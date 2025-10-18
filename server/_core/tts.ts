import { ENV } from "./env";

export type TtsInput = {
  text: string;
  language: "en" | "fr";
  voice?: string;
  format?: "mp3" | "wav" | "ogg" | "aac";
};

export type TtsResult = {
  audioBase64: string;
  contentType: string;
  voice: string;
};

// Supported voices per OpenAI API error guidance
const SUPPORTED_VOICES = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
  "coral",
  "verse",
  "ballad",
  "ash",
  "sage",
  "marin",
  "cedar",
] as const;

// Favor certain voices per language (all are supported); list is used to randomize
const DEFAULT_VOICES_EN = ["alloy", "verse", "nova", "sage", "coral", "ballad"] as const;
const DEFAULT_VOICES_FR = ["marin", "alloy", "ash", "cedar", "nova", "sage", "coral", "ballad", "verse"] as const;

export async function synthesizeSpeech({ text, language, voice, format = "mp3" }: TtsInput): Promise<TtsResult> {
  if (!ENV.openaiApiKey) {
    throw new Error("OpenAI API key is not configured. Set OPENAI_API_KEY in .env");
  }

  // Resolve a supported voice
  const pool = language === "fr" ? DEFAULT_VOICES_FR : DEFAULT_VOICES_EN;
  const requested = voice && SUPPORTED_VOICES.includes(voice as any) ? (voice as typeof SUPPORTED_VOICES[number]) : undefined;
  let selectedVoice = requested || pool[Math.floor(Math.random() * pool.length)];

  // One-shot request function
  const requestOnce = async (useVoice: string) => {
    const payload = {
      model: ENV.openaiTtsModel,
      input: text,
      voice: useVoice,
      format,
    } as any;

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`OpenAI TTS error: ${res.status} ${res.statusText} ${txt}`);
    }
    const arrayBuf = await res.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuf).toString("base64");
    const contentType = formatToMime(format);
    return { audioBase64, contentType } as const;
  };

  // First attempt
  try {
    const first = await requestOnce(selectedVoice);
    return { ...first, voice: selectedVoice };
  } catch (err) {
    // If it's a voice error, retry with a different supported voice
    const msg = (err instanceof Error ? err.message : String(err)) || "";
    const isVoiceError = msg.includes("Invalid value") && msg.includes("Supported values are");
    if (!isVoiceError) throw err;
    // Parse supported list from error, or fallback to SUPPORTED_VOICES
    const supportedFromError = extractVoicesFromError(msg);
    const candidates = (supportedFromError.length ? supportedFromError : SUPPORTED_VOICES).filter(v => v !== selectedVoice);
    const fallback = candidates[Math.floor(Math.random() * candidates.length)] || "alloy";
    const second = await requestOnce(fallback);
    return { ...second, voice: fallback };
  }
}

function addEnthusiasm(text: string, language: "en" | "fr"): string {
  const prelude = language === "fr"
    ? "Narration enthousiaste et motivante, ton positif et engageant, débit naturel: "
    : "Enthusiastic, upbeat, engaging narration, natural pacing: ";
  return `${prelude}${text}`;
}

function formatToMime(fmt: string): string {
  switch (fmt) {
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    case "aac":
      return "audio/aac";
    default:
      return "audio/mpeg";
  }
}

function extractVoicesFromError(msg: string): string[] {
  // Extract quoted names after "Supported values are:"
  const m = msg.match(/Supported values are:\s*([^\n]+)/);
  if (!m) return [];
  const list = m[1];
  const names = Array.from(list.matchAll(/'([^']+)'/g)).map(x => x[1]);
  return names.filter(Boolean);
}
