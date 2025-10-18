import { ENV } from "./env";
import crypto from "crypto";
import { getTrainingModuleImage, saveTrainingModuleImage } from "../db";

async function generateOpenAIImageB64(prompt: string, size = "1024x1024"): Promise<string> {
  if (!ENV.openaiApiKey) throw new Error("OPENAI_API_KEY is not configured");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: ENV.openaiImageModel || "gpt-image-1", prompt, size, response_format: "b64_json" }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI image gen failed: ${res.status} ${res.statusText} ${txt}`);
  }
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json || json?.data?.[0]?.b64 || json?.b64_json;
  if (!b64) throw new Error("OpenAI response missing b64 image");
  return b64 as string;
}

async function generateRecraftImageB64(prompt: string, size = "1024x1024"): Promise<string> {
  if (!ENV.recraftApiKey || !ENV.recraftApiUrl) throw new Error("RECRAFT_API_KEY or RECRAFT_API_URL is not configured");
  const url = ENV.recraftApiUrl.replace(/\/$/, "");
  const res = await fetch(`${url}/v1/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.recraftApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, size }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Recraft image gen failed: ${res.status} ${res.statusText} ${txt}`);
  }
  const json = await res.json();
  // Accept multiple possible shapes
  const b64 = json?.image_base64 || json?.data?.[0]?.b64 || json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("Recraft response missing base64 image");
  return b64 as string;
}

export async function generateImageB64(prompt: string, size?: string): Promise<{ b64: string; provider: string }> {
  const pref = (ENV.imageProvider || "auto").toLowerCase();
  const hasRecraft = !!ENV.recraftApiKey && !!ENV.recraftApiUrl;
  const hasOpenAI = !!ENV.openaiApiKey;

  async function tryRecraftFirst() {
    if (!hasRecraft) throw new Error("Recraft not configured");
    try {
      const b64 = await generateRecraftImageB64(prompt, size);
      return { b64, provider: "recraft" } as const;
    } catch (e) {
      if (hasOpenAI) {
        const b64 = await generateOpenAIImageB64(prompt, size);
        return { b64, provider: "openai" } as const;
      }
      throw e;
    }
  }

  async function tryOpenAIFirst() {
    if (!hasOpenAI) throw new Error("OpenAI not configured");
    try {
      const b64 = await generateOpenAIImageB64(prompt, size);
      return { b64, provider: "openai" } as const;
    } catch (e) {
      if (hasRecraft) {
        const b64 = await generateRecraftImageB64(prompt, size);
        return { b64, provider: "recraft" } as const;
      }
      throw e;
    }
  }

  if (pref === "recraft") return tryRecraftFirst();
  if (pref === "openai") return tryOpenAIFirst();
  // auto: prefer Recraft if configured, otherwise OpenAI
  if (hasRecraft) return tryRecraftFirst();
  if (hasOpenAI) return tryOpenAIFirst();
  throw new Error("No image provider configured");
}

function cloudinarySignature(params: Record<string, string>, apiSecret: string) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const toSign = `${sorted}${apiSecret}`;
  return crypto.createHash("sha1").update(toSign).digest("hex");
}

export async function uploadToCloudinary(b64: string, options?: { folder?: string; publicId?: string }): Promise<{ url: string; public_id: string }> {
  const cloud = ENV.cloudinaryCloudName;
  const apiKey = ENV.cloudinaryApiKey;
  const apiSecret = ENV.cloudinaryApiSecret;
  const folder = options?.folder || ENV.cloudinaryFolder || "training";
  if (!cloud || !apiKey || !apiSecret) throw new Error("Cloudinary credentials are not configured");

  const endpoint = `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params: Record<string, string> = { folder, timestamp };
  if (options?.publicId) params.public_id = options.publicId;
  const signature = cloudinarySignature(params, apiSecret);

  const form = new FormData();
  form.append("file", `data:image/png;base64,${b64}`);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  if (options?.publicId) form.append("public_id", options.publicId);
  form.append("signature", signature);

  const res = await fetch(endpoint, { method: "POST", body: form });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${res.status} ${res.statusText} ${txt}`);
  }
  const json = await res.json();
  return { url: json.secure_url || json.url, public_id: json.public_id };
}

export async function ensureModulePageImage(moduleId: string, pageIndex: number, prompt: string, size = "1024x1024") {
  try {
    const existing = await getTrainingModuleImage(moduleId, pageIndex);
    if (existing?.url) return existing;
  } catch {}
  const drcContext = "Democratic Republic of the Congo context: Kinshasa or Lubumbashi urban scenes, Congolese people and communities, local architecture and street life, DRC landmarks and geography; culturally respectful, authentic, modern, documentary style";
  const finalPrompt = `${prompt}. ${drcContext}`.slice(0, 900);
  const { b64, provider } = await generateImageB64(finalPrompt, size);
  const { url, public_id } = await uploadToCloudinary(b64, { folder: ENV.cloudinaryFolder, publicId: `${moduleId}_${pageIndex}` });
  try {
    await saveTrainingModuleImage({ moduleId, pageIndex, url, provider, prompt: finalPrompt, publicId: public_id });
  } catch {}
  return { moduleId, pageIndex, url, provider, prompt: finalPrompt, publicId: public_id };
}
