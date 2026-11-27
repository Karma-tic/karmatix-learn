// Validates the curated data: resources, paths and certifications.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data');
const load = (n) => {
  const raw = fs.readFileSync(path.join(dir, `${n}.json`), 'utf8');
  if (/[–—]/.test(raw)) fail(`${n}.json contains an em or en dash. Use commas, colons or hyphens.`);
  return JSON.parse(raw);
};
const errors = [];
function fail(m) { errors.push(m); }

const resources = load('resources');
const paths = load('paths');
const certs = load('certifications');
const roadmaps = load('roadmaps');

const TYPES = ['course', 'practice', 'docs', 'video', 'roadmap', 'tool', 'community', 'program', 'newsletter', 'podcast', 'jobs', 'book'];
const TRACKS = ['core', 'frontend', 'backend', 'mobile', 'cloud', 'ai', 'data', 'dsa', 'security'];
const COSTS = ['free', 'freemium', 'paid'];
const LEVELS = ['beginner', 'intermediate', 'advanced', 'all'];
const LANGS = ['en', 'hi', 'hi-en'];
const VERDICTS = ['worth', 'good', 'only'];

const ids = new Set();
const urls = new Set();
for (const r of resources) {
  const at = `resource "${r.id}"`;
  if (!/^[a-z0-9-]+$/.test(r.id || '')) fail(`${at}: id must be lowercase letters, numbers and hyphens`);
  if (ids.has(r.id)) fail(`${at}: duplicate id`);
  ids.add(r.id);
  if (!r.url?.startsWith('https://')) fail(`${at}: url must start with https://`);
  if (urls.has(r.url)) fail(`${at}: duplicate url ${r.url}`);
  urls.add(r.url);
  if (!TYPES.includes(r.type)) fail(`${at}: unknown type ${r.type}`);
  if (!COSTS.includes(r.cost)) fail(`${at}: unknown cost ${r.cost}`);
  if (!LEVELS.includes(r.level)) fail(`${at}: unknown level ${r.level}`);
  if (!LANGS.includes(r.lang)) fail(`${at}: unknown lang ${r.lang}`);
  if (!Array.isArray(r.tracks) || !r.tracks.length || r.tracks.some((t) => !TRACKS.includes(t))) fail(`${at}: tracks must be a non-empty list of ${TRACKS.join(', ')}`);
  for (const k of ['name', 'by', 'why', 'tip']) if (!r[k] || typeof r[k] !== 'string') fail(`${at}: missing ${k}`);
  if (r.why && r.why.length > 160) fail(`${at}: "why" is over 160 characters. Keep it to one sentence.`);
  if (r.tip && r.tip.length > 170) fail(`${at}: "tip" is over 170 characters. Keep it practical and short.`);
  if (typeof r.india !== 'boolean') fail(`${at}: india must be true or false`);
}

const certIds = new Set();
for (const c of certs) {
  const at = `certification "${c.id}"`;
  if (certIds.has(c.id)) fail(`${at}: duplicate id`);
  certIds.add(c.id);
  if (!VERDICTS.includes(c.verdict)) fail(`${at}: unknown verdict ${c.verdict}`);
  if (!c.url?.startsWith('https://')) fail(`${at}: url must start with https://`);
  if (!c.fee) fail(`${at}: missing fee`);
  for (const id of c.prep || []) if (!ids.has(id)) fail(`${at}: prep refers to unknown resource "${id}"`);
}

for (const p of paths) {
  const at = `path "${p.id}"`;
  if (!TRACKS.includes(p.id)) fail(`${at}: id must be one of the tracks`);
  if (!Array.isArray(p.stages) || p.stages.length < 3) fail(`${at}: needs at least 3 stages`);
  p.stages.forEach((s, i) => {
    const st = `${at} stage ${i + 1}`;
    for (const k of ['title', 'goal', 'weeks', 'build', 'prove']) if (!s[k]) fail(`${st}: missing ${k}`);
    if (!s.learn?.length) fail(`${st}: needs at least one "learn" resource`);
    if (!s.practise?.length) fail(`${st}: needs at least one "practise" resource`);
    for (const id of [...(s.learn || []), ...(s.practise || [])]) if (!ids.has(id)) fail(`${st}: unknown resource "${id}"`);
    const dup = (s.learn || []).filter((id) => (s.practise || []).includes(id));
    if (dup.length) fail(`${st}: ${dup.join(', ')} listed in both learn and practise`);
  });
  for (const k of ['tools', 'channels', 'communities', 'jobs']) for (const id of p[k] || []) if (!ids.has(id)) fail(`${at}: ${k} refers to unknown resource "${id}"`);
  for (const id of p.certs || []) if (!certIds.has(id)) fail(`${at}: unknown certification "${id}"`);
}

for (const k of roadmaps) {
  const at = `roadmap "${k.id}"`;
  if (!/^[a-z0-9-]+$/.test(k.id || '')) fail(`${at}: bad id`);
  if (!['frontend', 'backend', 'mobile', 'cloud', 'ai', 'data', 'dsa', 'security'].includes(k.related)) fail(`${at}: related must be a path id`);
  if (!Array.isArray(k.stages) || k.stages.length < 3) fail(`${at}: needs at least 3 stages`);
  k.stages.forEach((s, i) => {
    const st = `${at} stage ${i + 1}`;
    for (const key of ['title', 'goal', 'weeks', 'build', 'prove']) if (!s[key]) fail(`${st}: missing ${key}`);
    if (!s.topics?.length) fail(`${st}: needs a skills checklist (topics)`);
    if (new Set(s.topics).size !== s.topics.length) fail(`${st}: duplicate skills`);
    for (const id of [...(s.learn || []), ...(s.practise || [])]) if (!ids.has(id)) fail(`${st}: unknown resource "${id}"`);
    const dup = (s.learn || []).filter((id) => (s.practise || []).includes(id));
    if (dup.length) fail(`${st}: ${dup.join(', ')} listed in both learn and practise`);
  });
  for (const key of ['tools', 'channels', 'communities']) for (const id of k[key] || []) if (!ids.has(id)) fail(`${at}: ${key} refers to unknown resource "${id}"`);
  for (const id of k.certs || []) if (!certIds.has(id)) fail(`${at}: unknown certification "${id}"`);
  if (!k.libs?.length) fail(`${at}: list the libraries to know`);
  if (!k.interview?.length) fail(`${at}: list the interview topics`);
}

if (errors.length) {
  console.error(`[Data] ${errors.length} problem(s):`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`[Data] Passed: ${resources.length} resources, ${paths.length} paths, ${roadmaps.length} stack roadmaps, ${certs.length} certifications. All references resolve.`);
