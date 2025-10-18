import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { ensureModulePageImage } from '../server/_core/images';

type ModFile = { modules: Array<{ id: string; title: string; summary: string; pages: Array<{ title: string; body: string }> }> };

async function loadTrainingJson(lang: 'en' | 'fr'): Promise<ModFile> {
  const file = path.join(process.cwd(), 'client', 'public', 'training', `training.${lang}.json`);
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw) as ModFile;
}

async function main() {
  // Load both languages to build the best prompts
  const en = await loadTrainingJson('en').catch(() => ({ modules: [] } as ModFile));
  const fr = await loadTrainingJson('fr').catch(() => ({ modules: [] } as ModFile));

  const byIdEn = new Map(en.modules.map(m => [m.id, m] as const));
  const byIdFr = new Map(fr.modules.map(m => [m.id, m] as const));

  const moduleIds = Array.from(new Set([...byIdEn.keys(), ...byIdFr.keys()]));
  let ok = 0, fail = 0;

  for (const mid of moduleIds) {
    const men = byIdEn.get(mid);
    const mfr = byIdFr.get(mid);
    const pageCount = Math.max(men?.pages.length || 0, mfr?.pages.length || 0);
    for (let i = 0; i < pageCount; i++) {
      const pen = men?.pages[i];
      const pfr = mfr?.pages[i];
      const title = pen?.title || pfr?.title || `Module ${mid} Page ${i+1}`;
      const body = pen?.body || pfr?.body || '';
      const prompt = `${men?.title || mfr?.title || mid}. ${title}. ${body}`.slice(0, 800);
      try {
        const out = await ensureModulePageImage(mid, i, prompt);
        console.log(`[ok] ${mid}#${i} -> ${out.url}`);
        ok++;
      } catch (err: any) {
        console.warn(`[fail] ${mid}#${i}:`, err?.message || err);
        fail++;
      }
    }
  }
  console.log(`Done. ok=${ok} fail=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
