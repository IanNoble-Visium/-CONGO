import fs from "fs";
import path from "path";

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function main() {
  const src = path.resolve("video", "training");
  const dest = path.resolve("client", "public", "media", "training");
  ensureDir(dest);

  const exts = /\.(mp4|webm|ogg)$/i;
  const files: string[] = [];

  if (fs.existsSync(src)) {
    for (const name of fs.readdirSync(src)) {
      if (!exts.test(name)) continue;
      const from = path.join(src, name);
      const to = path.join(dest, name);
      try {
        fs.copyFileSync(from, to);
        files.push(name);
      } catch {
        // ignore copy errors to not fail build
      }
    }
  }

  const index = files.map((name) => ({ name, url: `/media/training/${name}` }));
  try {
    fs.writeFileSync(path.join(dest, "index.json"), JSON.stringify(index, null, 2));
  } catch {
    // ignore write errors
  }

  console.log(`[prepare-training-media] Prepared ${files.length} video(s) at ${dest}`);
}

main();
