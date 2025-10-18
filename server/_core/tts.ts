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

const DEFAULT_VOICES_EN = ["alloy", "verse", "aria", "sage"];
const DEFAULT_VOICES_FR = ["serena", "alloy", "aria", "sage"];

export async function synthesizeSpeech({ text, language, voice, format = "mp3" }: TtsInput): Promise<TtsResult> {
  if (!ENV.openaiApiKey) {
    throw new Error("OpenAI API key is not configured. Set OPENAI_API_KEY in .env");
  }

  const voices = language === "fr" ? DEFAULT_VOICES_FR : DEFAULT_VOICES_EN;
  const selectedVoice = voice || voices[Math.floor(Math.random() * voices.length)];

  const payload = {
    model: ENV.openaiTtsModel,
    input: addEnthusiasm(text, language),
    voice: selectedVoice,
    format,
  } as any;

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ENV.openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI TTS error: ${res.status} ${res.statusText} ${errText}`);
  }

  const arrayBuf = await res.arrayBuffer();
  const audioBase64 = Buffer.from(arrayBuf).toString("base64");
  const contentType = formatToMime(format);

  return { audioBase64, contentType, voice: selectedVoice };
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
