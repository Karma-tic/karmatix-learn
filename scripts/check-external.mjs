// Checks every external link in the curated data. Runs weekly in CI and on demand.
// Some sites block bots (403/429); those are reported as warnings, not failures.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data');
const read = (n) => JSON.parse(fs.readFileSync(path.join(dir, `${n}.json`), 'utf8'));
const urls = [...new Set([
  ...read('resources').map((r) => r.url),
  ...read('certifications').map((c) => c.url),
  ...read('courses').map((c) => c.url).filter(Boolean),
])];

const UA = 'Mozilla/5.0 (compatible; KarmatixLearnLinkCheck/1.0; +https://learn.karmatix.in)';
async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000) });
      if (res.ok) return { url, status: res.status, ok: true };
      if (method === 'GET') return { url, status: res.status, ok: false };
    } catch (e) {
      if (method === 'GET') return { url, status: e.name === 'TimeoutError' ? 'timeout' : 'error', ok: false };
    }
  }
}

const results = [];
const queue = [...urls];
await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) results.push(await check(queue.shift())); }));

const blocked = results.filter((r) => !r.ok && [401, 403, 405, 406, 429, 999].includes(r.status));
const broken = results.filter((r) => !r.ok && !blocked.includes(r));
blocked.forEach((r) => console.warn(`[warn] ${r.status} ${r.url} (site may block bots; check by hand)`));
broken.forEach((r) => console.error(`[broken] ${r.status} ${r.url}`));
console.log(`[External] ${results.length} links: ${results.length - blocked.length - broken.length} ok, ${blocked.length} blocked, ${broken.length} broken.`);
if (broken.length) process.exit(1);
