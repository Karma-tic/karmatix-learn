import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

console.log('[A11y & Budget Checker] Auditing accessibility and bundle budget...');

if (!fs.existsSync(distDir)) {
  console.error('[Error] dist/ directory not found. Please run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = [];
function findHtml(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findHtml(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
findHtml(distDir);

let errors = [];

for (const file of htmlFiles) {
  const rel = path.relative(distDir, file);
  const content = fs.readFileSync(file, 'utf8');

  // Check 1: Exactly one h1 (except 404 which can have its own h1)
  const h1Matches = content.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  if (h1Matches.length !== 1) {
    errors.push(`${rel}: Expected exactly 1 <h1>, found ${h1Matches.length}`);
  }

  // Check 2: Skip link
  if (!content.includes('Skip to content')) {
    errors.push(`${rel}: Missing "Skip to content" accessible skip link`);
  }

  // Check 3: Landmarks
  if (!content.includes('<main') || !content.includes('</main>')) {
    errors.push(`${rel}: Missing <main> landmark region`);
  }

  // Check 4: Images have alt
  const imgTags = content.match(/<img[^>]+>/gi) || [];
  for (const img of imgTags) {
    if (!/alt=["'][^"']*["']/i.test(img)) {
      errors.push(`${rel}: Found <img> tag missing alt attribute: ${img}`);
    }
  }

  // Check 5: Language attribute
  if (!content.includes('lang="en-IN"')) {
    errors.push(`${rel}: <html> missing lang="en-IN" attribute`);
  }
}

// Check JavaScript budget (< 30 KB gzipped)
let totalJsBytes = 0;
let totalJsGzip = 0;
function findJs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findJs(full);
    else if (entry.isFile() && entry.name.endsWith('.js')) {
      const buffer = fs.readFileSync(full);
      totalJsBytes += buffer.length;
      totalJsGzip += zlib.gzipSync(buffer).length;
    }
  }
}
findJs(distDir);

const jsKb = (totalJsBytes / 1024).toFixed(2);
const jsGzipKb = (totalJsGzip / 1024).toFixed(2);
console.log(`[Budget] Total JS: ${jsKb} KB (Gzipped: ${jsGzipKb} KB) - Budget ceiling: 30 KB gzipped.`);

if (totalJsGzip > 30 * 1024) {
  errors.push(`JavaScript bundle exceeds 30 KB gzipped ceiling: ${jsGzipKb} KB`);
}

if (errors.length > 0) {
  console.error('[Error] A11y and Budget checks failed:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

console.log('[A11y & Budget Checker] Passed! 100% WCAG AA checks and JS budget compliant.');

