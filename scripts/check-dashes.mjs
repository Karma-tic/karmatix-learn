import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const scanDirs = ['src', 'public'];
let violations = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // Check for em-dash (—, \u2014) or en-dash (–, \u2013)
    if (/[\u2013\u2014]/.test(line)) {
      violations.push({
        file: path.relative(rootDir, filePath),
        line: index + 1,
        content: line.trim()
      });
    }
  });
}

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.astro' && entry.name !== '.git') {
        traverse(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.astro', '.json', '.html', '.css', '.js', '.mjs', '.ts', '.svg', '.txt', '.md'].includes(ext)) {
        scanFile(fullPath);
      }
    }
  }
}

console.log('[Dash Checker] Scanning codebase for forbidden em-dashes (—) and en-dashes (–)...');
scanDirs.forEach(d => traverse(path.join(rootDir, d)));

if (violations.length > 0) {
  console.error(`[Error] Found ${violations.length} dash violation(s)!`);
  violations.forEach(v => {
    console.error(`  ${v.file}:${v.line} -> ${v.content}`);
  });
  process.exit(1);
}

console.log('[Dash Checker] Passed! Zero em-dashes or en-dashes found across all scanned files.');
