import { ENV } from "./env";

export async function transcribeWhisper(input: { audioBase64: string; contentType?: string; language?: "en" | "fr" }) {
  if (!ENV.openaiApiKey) throw new Error("OpenAI API key is not configured");
  const { audioBase64, contentType = "audio/mpeg", language = "en" } = input;
  const bin = Buffer.from(audioBase64, "base64");
  const blob = new Blob([bin], { type: contentType });
  const form = new FormData();
  form.append("file", blob, `audio.${contentType.includes("wav") ? "wav" : contentType.includes("ogg") ? "ogg" : "mp3"}`);
  form.append("model", "whisper-1");
  form.append("language", language);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${ENV.openaiApiKey}` },
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI Whisper error: ${res.status} ${res.statusText} ${txt}`);
  }
  const json = await res.json();
  return { text: json.text ?? "" } as const;
}
