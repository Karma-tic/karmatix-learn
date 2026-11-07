import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import sharp from 'sharp';

const outputDir = path.resolve('public/images/courses');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function getPageTabWsUrl(port = 9222) {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        const tabs = await res.json();
        const pageTab = tabs.find((t) => t.type === 'page');
        if (pageTab && pageTab.webSocketDebuggerUrl) {
          return pageTab.webSocketDebuggerUrl;
        }
      }
    } catch (e) {
      // wait
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('Chrome remote debugging page tab did not respond.');
}

async function capture() {
  console.log('[Screenshots] Launching headless Chrome...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--hide-scrollbars',
    'about:blank'
  ]);

  const wsUrl = await getPageTabWsUrl(9222);
  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((resolve) => ws.onopen = resolve);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');

  const targets = [
    {
      name: 'dotnet',
      url: 'https://learn.karmatix.in/',
      desktop: { width: 1440, height: 900 },
      mobile: { width: 390, height: 844 }
    },
    {
      name: 'flutter',
      url: 'https://karma-tic.github.io/flutter-course/',
      desktop: { width: 1440, height: 900 },
      mobile: { width: 390, height: 844 }
    }
  ];

  for (const t of targets) {
    console.log(`[Screenshots] Navigating to ${t.url}...`);
    await send('Page.navigate', { url: t.url });
    await new Promise((r) => setTimeout(r, 4000));

    // Capture Desktop
    console.log(`[Screenshots] Capturing ${t.name} desktop (${t.desktop.width}x${t.desktop.height})...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: t.desktop.width,
      height: t.desktop.height,
      deviceScaleFactor: 2,
      mobile: false
    });
    await new Promise((r) => setTimeout(r, 800));

    const desktopRes = await send('Page.captureScreenshot', { format: 'png' });
    const desktopPng = Buffer.from(desktopRes.data, 'base64');
    const desktopPngPath = path.join(outputDir, `${t.name}-desktop.png`);
    fs.writeFileSync(desktopPngPath, desktopPng);

    await sharp(desktopPng)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(outputDir, `${t.name}-desktop.webp`));

    await sharp(desktopPng)
      .resize(1200, null, { withoutEnlargement: true })
      .avif({ quality: 75 })
      .toFile(path.join(outputDir, `${t.name}-desktop.avif`));

    // Capture Mobile
    console.log(`[Screenshots] Capturing ${t.name} mobile (${t.mobile.width}x${t.mobile.height})...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: t.mobile.width,
      height: t.mobile.height,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise((r) => setTimeout(r, 800));

    const mobileRes = await send('Page.captureScreenshot', { format: 'png' });
    const mobilePng = Buffer.from(mobileRes.data, 'base64');
    const mobilePngPath = path.join(outputDir, `${t.name}-mobile.png`);
    fs.writeFileSync(mobilePngPath, mobilePng);

    await sharp(mobilePng)
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(outputDir, `${t.name}-mobile.webp`));

    await sharp(mobilePng)
      .resize(600, null, { withoutEnlargement: true })
      .avif({ quality: 75 })
      .toFile(path.join(outputDir, `${t.name}-mobile.avif`));

    console.log(`[Screenshots] Saved ${t.name} desktop and mobile (PNG, WebP, AVIF)`);
  }

  // Generate Open Graph image (1200x630)
  console.log('[Screenshots] Generating 1200x630 Open Graph card...');
  const ogSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0B0F19"/>
    <defs>
      <linearGradient id="grid" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop stop-color="#1E293B" stop-opacity="0.3"/>
        <stop offset="1" stop-color="#0B0F19" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <rect x="80" y="80" width="48" height="48" rx="10" fill="#2563EB"/>
    <path d="M96 92h5v10l8-10h6l-9 11 10 13h-6l-7-9.5-2 2v7.5h-5V92z" fill="#FFFFFF"/>
    <text x="144" y="113" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="28" font-weight="700">Karmatix Learning</text>
    <text x="80" y="240" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="52" font-weight="700" letter-spacing="-0.02em">
      Engineering education the clear way.
    </text>
    <text x="80" y="295" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="22" font-weight="400">
      Free software engineering courses built on real tested code. No accounts required.
    </text>
    <g transform="translate(80, 360)">
      <rect width="480" height="180" rx="12" fill="#111827" stroke="#1E293B" stroke-width="2"/>
      <rect x="24" y="24" width="80" height="24" rx="12" fill="#2563EB" fill-opacity="0.2"/>
      <text x="64" y="40" fill="#60A5FA" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle">FLAGSHIP</text>
      <text x="24" y="84" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="22" font-weight="700">Karmatix .NET Academy</text>
      <text x="24" y="114" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="15">12 Modules · .NET 10 LTS · 16 Tested Projects</text>
      <text x="24" y="144" fill="#60A5FA" font-family="system-ui, sans-serif" font-size="15" font-weight="500">dotnet.karmatix.in →</text>
    </g>
    <g transform="translate(600, 360)">
      <rect width="480" height="180" rx="12" fill="#111827" stroke="#1E293B" stroke-width="2"/>
      <rect x="24" y="24" width="60" height="24" rx="12" fill="#10B981" fill-opacity="0.2"/>
      <text x="54" y="40" fill="#34D399" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle">LIVE</text>
      <text x="24" y="84" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="22" font-weight="700">Karmatix Flutter Course</text>
      <text x="24" y="114" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="15">10 Modules · Android Core · Timed Mock Exams</text>
      <text x="24" y="144" fill="#60A5FA" font-family="system-ui, sans-serif" font-size="15" font-weight="500">karma-tic.github.io/flutter-course/ →</text>
    </g>
  </svg>
  `;

  const ogPngPath = path.resolve('public/images/og-karmatix-learn.png');
  fs.mkdirSync(path.resolve('public/images'), { recursive: true });
  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(ogPngPath);
  console.log(`[Screenshots] Generated ${ogPngPath}`);

  ws.close();
  chrome.kill();
  console.log('[Screenshots] Complete!');
}

capture().catch((err) => {
  console.error('[Screenshots] Fatal error:', err);
  process.exit(1);
});
