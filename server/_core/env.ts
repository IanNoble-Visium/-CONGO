export const ENV = {
  appId: process.env.VITE_APP_ID ?? "congo-address-mapper",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? process.env.GPT_API_KEY ?? "",
  openaiTtsModel: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
  // Images
  imageProvider: (process.env.IMAGE_PROVIDER ?? "openai").toLowerCase(), // openai | recraft
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
  recraftApiKey: process.env.RECRAFT_API_KEY ?? "",
  recraftApiUrl: process.env.RECRAFT_API_URL ?? "",
  // Cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER ?? "training",
};
