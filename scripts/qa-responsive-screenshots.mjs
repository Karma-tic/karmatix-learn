import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

const distDir = path.resolve('dist');
const qaDir = path.resolve('docs/qa');
if (!fs.existsSync(qaDir)) {
  fs.mkdirSync(qaDir, { recursive: true });
}

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || !path.extname(reqPath)) {
    reqPath = path.join(reqPath, 'index.html');
  }
  const filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const notFound = path.join(distDir, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html' });
    fs.createReadStream(notFound).pipe(res);
  }
});

server.listen(4321, async () => {
  console.log('[QA] Local preview server listening on http://127.0.0.1:4321');

  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--hide-scrollbars',
    'http://127.0.0.1:4321/'
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  async function getWsUrl() {
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch('http://127.0.0.1:9223/json');
        if (res.ok) {
          const tabs = await res.json();
          const tab = tabs.find((t) => t.type === 'page');
          if (tab && tab.webSocketDebuggerUrl) return tab.webSocketDebuggerUrl;
        }
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 300));
    }
    throw new Error('Chrome did not respond on 9223');
  }

  const wsUrl = await getWsUrl();
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
  await send('Page.navigate', { url: 'http://127.0.0.1:4321/' });
  await new Promise((r) => setTimeout(r, 1500));

  const viewports = [
    { name: 'viewport-360x640-mobile.png', width: 360, height: 640, mobile: true },
    { name: 'viewport-390x844-iphone.png', width: 390, height: 844, mobile: true },
    { name: 'viewport-768x1024-tablet.png', width: 768, height: 1024, mobile: false },
    { name: 'viewport-1024x768-laptop.png', width: 1024, height: 768, mobile: false },
    { name: 'viewport-1440x900-desktop.png', width: 1440, height: 900, mobile: false },
    { name: 'viewport-1920x1080-wide.png', width: 1920, height: 1080, mobile: false },
  ];

  for (const vp of viewports) {
    console.log(`[QA] Capturing ${vp.width}x${vp.height} -> ${vp.name}...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.mobile
    });
    await new Promise((r) => setTimeout(r, 600));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    fs.writeFileSync(path.join(qaDir, vp.name), buffer);
  }

  // Reduced motion capture
  console.log('[QA] Capturing with prefers-reduced-motion: reduce...');
  await send('Emulation.setEmulatedMedia', {
    media: '',
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
  });
  await new Promise((r) => setTimeout(r, 400));
  const reducedShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(qaDir, 'viewport-reduced-motion.png'), Buffer.from(reducedShot.data, 'base64'));

  console.log('[QA] All responsive screenshots captured successfully in docs/qa!');

  ws.close();
  chrome.kill();
  server.close();
});
