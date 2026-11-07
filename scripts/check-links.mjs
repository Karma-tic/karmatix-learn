import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

console.log('[Link Checker] Verifying internal assets and anchor links in dist/...');

if (!fs.existsSync(distDir)) {
  console.error('[Error] dist/ directory not found. Please run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = [];
function findHtml(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findHtml(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(full);
    }
  }
}

findHtml(distDir);
console.log(`[Link Checker] Found ${htmlFiles.length} HTML files.`);

let errors = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(distDir, file);

  // Extract all IDs in the page for anchor validation
  const idMatches = content.matchAll(/id=["']([^"']+)["']/g);
  const ids = new Set();
  for (const match of idMatches) {
    ids.add(match[1]);
  }

  // Check <img> src attributes
  const imgMatches = content.matchAll(/<img[^>]+src=["']([^"']+)["']/g);
  for (const match of imgMatches) {
    const src = match[1];
    if (src.startsWith('data:') || src.startsWith('http')) continue;
    const cleanSrc = src.split('?')[0].split('#')[0];
    const assetPath = path.join(distDir, cleanSrc.startsWith('/') ? cleanSrc.slice(1) : cleanSrc);
    if (!fs.existsSync(assetPath)) {
      errors.push(`${relFile}: Missing image src "${src}" (expected at ${assetPath})`);
    }
  }

  // Check <source> srcset attributes
  const sourceMatches = content.matchAll(/<source[^>]+srcset=["']([^"']+)["']/g);
  for (const match of sourceMatches) {
    const srcset = match[1];
    if (srcset.startsWith('data:') || srcset.startsWith('http')) continue;
    const cleanSrc = srcset.split('?')[0].split('#')[0].trim().split(/\s+/)[0];
    const assetPath = path.join(distDir, cleanSrc.startsWith('/') ? cleanSrc.slice(1) : cleanSrc);
    if (!fs.existsSync(assetPath)) {
      errors.push(`${relFile}: Missing source srcset "${cleanSrc}" (expected at ${assetPath})`);
    }
  }

  // Check local anchor links
  const hrefMatches = content.matchAll(/<a[^>]+href=["']([^"']+)["']/g);
  for (const match of hrefMatches) {
    const href = match[1];
    if (href.startsWith('#')) {
      const anchor = href.slice(1);
      if (anchor && !ids.has(anchor)) {
        errors.push(`${relFile}: Missing anchor target "#${anchor}"`);
      }
    } else if (href.startsWith('/') && !href.startsWith('//')) {
      const [route] = href.split('#');
      let targetFile;
      if (route === '/' || route === '') {
        targetFile = path.join(distDir, 'index.html');
      } else {
        const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
        targetFile = path.join(distDir, cleanRoute);
        if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
          targetFile = path.join(targetFile, 'index.html');
        } else if (!path.extname(targetFile)) {
          targetFile = path.join(distDir, `${cleanRoute}.html`);
          if (!fs.existsSync(targetFile)) {
            targetFile = path.join(distDir, cleanRoute, 'index.html');
          }
        }
      }
      if (!fs.existsSync(targetFile)) {
        errors.push(`${relFile}: Dead internal route "${href}" (expected at ${targetFile})`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error('[Error] Link validation failed with errors:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

console.log('[Link Checker] Passed! All internal links, images, and in-page anchors verified.');
