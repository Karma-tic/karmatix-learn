// Exports one stack roadmap, with every resource resolved, as a TypeScript module
// for the Karmatix course sites (flutter-course, dotnet-academy).
// Usage: node scripts/export-roadmap.mjs flutter ../flutter-course/src/data/roadmap.generated.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , id, out] = process.argv;
if (!id || !out) { console.error('Usage: export-roadmap.mjs <stack-id> <output.ts>'); process.exit(1); }
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data');
const read = (n) => JSON.parse(fs.readFileSync(path.join(dir, `${n}.json`), 'utf8'));
const resources = new Map(read('resources').map((r) => [r.id, r]));
const certs = new Map(read('certifications').map((c) => [c.id, c]));
const k = read('roadmaps').find((r) => r.id === id);
if (!k) { console.error(`No roadmap "${id}"`); process.exit(1); }
const pick = (rid) => { const r = resources.get(rid); return { id: r.id, name: r.name, by: r.by, url: r.url, type: r.type, cost: r.cost, lang: r.lang, why: r.why, tip: r.tip }; };
const data = {
  ...k,
  stages: k.stages.map((s) => ({ ...s, learn: s.learn.map(pick), practise: s.practise.map(pick) })),
  tools: k.tools.map(pick), channels: k.channels.map(pick), communities: k.communities.map(pick),
  certs: k.certs.map((c) => { const x = certs.get(c); return { id: x.id, name: x.name, fee: x.fee, verdict: x.verdict, url: x.url }; }),
  source: `https://learn.karmatix.in/roadmaps/${k.id}/`,
};
const ts = `// Generated from karmatix-learn (src/data). Do not edit by hand.\n// Regenerate: node scripts/export-roadmap.mjs ${id} <this file>\n\nexport type RoadmapResource = { id: string; name: string; by: string; url: string; type: string; cost: string; lang: string; why: string; tip: string };\n\nexport const roadmap = ${JSON.stringify(data, null, 2)} as const;\n`;
fs.writeFileSync(out, ts);
console.log(`Wrote ${out} (${k.stages.length} stages, ${k.stages.reduce((n, s) => n + s.topics.length, 0)} skills)`);
