// Exports the logo as transparent PNGs (for Instagram, Canva, ChatGPT uploads) using headless Chrome.
//   node scripts/export-logo.mjs                 -> brand-kit/ with the name "Darart"
//   node scripts/export-logo.mjs --name Glinto   -> same files with the new name
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const name = args.includes("--name") ? args[args.indexOf("--name") + 1] : "Darart";
const outDir = path.resolve(import.meta.dirname, "..", "brand-kit");
mkdirSync(outDir, { recursive: true });

const INK = "#131211";
const PAPER = "#f1eee8";
const EMBER = "#e4572e";
const PLATE = "M0 1.2A1.2 1.2 0 0 1 1.2 0H25l5 5v33.8a1.2 1.2 0 0 1-1.2 1.2H1.2A1.2 1.2 0 0 1 0 38.8Z";
const GLINT = ["M-2 29.6 32 6.2v5.4L-2 35Z", "M-2 38.4 32 15v1.9L-2 40.3Z"];
let n = 0;
const mark = (color, height) => {
  const id = `m${n++}`;
  return `<svg viewBox="0 0 30 40" style="height:${height}px;width:auto;display:block"><defs><mask id="${id}"><path d="${PLATE}" fill="#fff"/>${GLINT.map((d) => `<path d="${d}" fill="#000"/>`).join("")}</mask></defs><rect width="30" height="40" fill="${color}" mask="url(#${id})"/></svg>`;
};
// same proportions as the site header: mark 26px, name 23px, gap 10px (scaled x10)
const lockup = (color) =>
  `<div class="shot" style="display:inline-flex;align-items:center;gap:100px;padding:40px;color:${color}">${mark(color, 260)}<span style="font:800 230px/1 Archivo;font-stretch:62%;text-transform:uppercase;letter-spacing:.02em">${name}</span></div>`;
const square = (bg, color, size, markH) =>
  `<div class="shot" style="width:${size}px;height:${size}px;background:${bg};display:grid;place-items:center">${mark(color, markH)}</div>`;

const files = {
  "logo-noir.png": lockup(INK), // for light backgrounds
  "logo-blanc.png": lockup(PAPER), // for dark backgrounds and photos
  "symbole-noir.png": `<div class="shot" style="display:inline-block;padding:40px">${mark(INK, 1000)}</div>`,
  "symbole-blanc.png": `<div class="shot" style="display:inline-block;padding:40px">${mark(PAPER, 1000)}</div>`,
  "symbole-orange.png": `<div class="shot" style="display:inline-block;padding:40px">${mark(EMBER, 1000)}</div>`,
  "photo-profil-instagram.png": square(INK, PAPER, 1080, 520),
};

const PORT = 9336;
const profile = mkdtempSync(path.join(tmpdir(), "af-logo-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-first-run", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(250);
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page"); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((res, rej) => { const k = ++id; pending.set(k, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: k, method, params })); });
const ev = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 3000, height: 1400, deviceScaleFactor: 1, mobile: false });
await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
const head = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,800&display=block"><style>html,body{margin:0;background:transparent}</style>`;

try {
  for (const [file, body] of Object.entries(files)) {
    await send("Page.navigate", { url: "data:text/html;charset=utf-8," + encodeURIComponent(`<!doctype html><html><head>${head}</head><body>${body}</body></html>`) });
    await sleep(600);
    const ok = await ev(`(async () => { await document.fonts.ready; await document.fonts.load('800 230px Archivo'); return document.fonts.check('800 230px Archivo') })()`);
    if (!ok) throw new Error("Archivo font did not load (needs internet)");
    const r = await ev(`(() => { const b = document.querySelector('.shot').getBoundingClientRect(); return { x: b.x, y: b.y, width: Math.ceil(b.width), height: Math.ceil(b.height) } })()`);
    const shot = await send("Page.captureScreenshot", { format: "png", clip: { ...r, scale: 1 } });
    writeFileSync(path.join(outDir, file), Buffer.from(shot.data, "base64"));
    console.log(`${file}  ${r.width}x${r.height}`);
  }
} finally {
  ws.close();
  chrome.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
console.log(`-> ${outDir}`);
