// One command to (re)render every deliverable:
//
//   npm run render                         # brand "Darart"
//   npm run render -- --brand "Nouveau Nom" # same ads, new name on logo/end cards
//   npm run render -- --only a             # a | b | loops (comma-separated)
//
// GPU safety: software GL only (--gl=swangle) and 2 render tabs (--concurrency=2).
// Outputs land in out/: ad-a-mur-vide.mp4, ad-b-ta-photo.mp4, site-loop-*.mp4/.jpg, *-contact.jpg

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const WORK = path.join(OUT, "_work");
fs.mkdirSync(WORK, { recursive: true });

const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--")) return argv[i + 1];
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.slice(name.length + 3) : def;
};
const brand = arg("brand", "Darart");
const only = new Set(arg("only", "a,b,loops").split(","));
const GL = ["--gl=swangle", "--concurrency=2", "--log=warn"];

const run = (cmd, args) => {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) throw new Error(`${cmd} failed (${r.status})`);
};
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const probe = (file) =>
  spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate", "-of", "json", file], {
    encoding: "utf8",
  }).stdout;

const writeProps = (id, props) => {
  const p = path.join(WORK, `props-${id}.json`);
  fs.writeFileSync(p, JSON.stringify(props));
  return path.relative(ROOT, p);
};

/**
 * Final mux: keep Remotion's H.264 stream as is and encode the master WAV once to AAC,
 * trimmed by 20 ms so AAC frame padding can't push the file past exactly 15.000 s.
 * Also moves the moov atom to the front (+faststart).
 */
function finalize(file, wav) {
  const tmp = path.join(WORK, path.basename(file).replace(/\.mp4$/, ".final.mp4"));
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", file, "-i", wav,
    "-map", "0:v", "-map", "1:a", "-c:v", "copy",
    "-af", "atrim=0:14.98,asetpts=PTS-STARTPTS", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
    "-movflags", "+faststart", tmp,
  ]);
  fs.renameSync(tmp, file);
}

/** 8 frames → 4×2 sheet */
function contactSheet(video, out, frames) {
  const sel = frames.map((n) => `eq(n\\,${n})`).join("+");
  run("ffmpeg", ["-y", "-loglevel", "error", "-i", video, "-vf", `select='${sel}',scale=360:640,tile=4x2:padding=8:margin=8:color=0x131211`, "-frames:v", "1", "-q:v", "3", out]);
}

if (!fs.existsSync(path.join(ROOT, "public/audio/ad-a.wav")) || argv.includes("--audio")) run("node", ["scripts/make-audio.mjs"]);

const ads = [
  { key: "a", id: "AdMurVide", file: "ad-a-mur-vide.mp4", sheet: "ad-a-contact.jpg", props: { brand }, frames: [0, 24, 40, 100, 124, 186, 340, 420] },
  {
    key: "b",
    id: "AdTaPhoto",
    file: "ad-b-ta-photo.mp4",
    sheet: "ad-b-contact.jpg",
    props: { brand, photo: "scenes/cafe.jpg", photoPosition: "62% 50%" },
    frames: [0, 16, 45, 96, 150, 200, 280, 420],
  },
];

for (const ad of ads) {
  if (!only.has(ad.key)) continue;
  const file = path.join(OUT, ad.file);
  run(npx, ["remotion", "render", ad.id, path.relative(ROOT, file), `--props=${writeProps(ad.id, ad.props)}`, "--codec=h264", "--crf=18", "--audio-codec=aac", "--audio-bitrate=192k", ...GL]);
  finalize(file, path.join(ROOT, "public/audio", `ad-${ad.key}.wav`));
  contactSheet(file, path.join(OUT, ad.sheet), ad.frames);
  console.log(probe(file));
}

if (only.has("loops")) {
  for (const loop of [
    { id: "SiteLoopGlint", name: "site-loop-glint", poster: 3.6 },
    { id: "SiteLoopSnap", name: "site-loop-snap", poster: 2.9 },
  ]) {
    const master = path.join(WORK, `${loop.name}.master.mp4`);
    run(npx, ["remotion", "render", loop.id, path.relative(ROOT, master), "--codec=h264", "--crf=12", "--muted", ...GL]);
    const final = path.join(OUT, `${loop.name}.mp4`);
    let crf = 26;
    for (;;) {
      run("ffmpeg", ["-y", "-loglevel", "error", "-i", master, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", final]);
      const size = fs.statSync(final).size;
      console.log(`${loop.name}.mp4 crf ${crf}: ${(size / 1024 / 1024).toFixed(2)} MB`);
      if (size <= 2 * 1024 * 1024 || crf >= 32) break;
      crf += 2;
    }
    run("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(loop.poster), "-i", final, "-frames:v", "1", "-q:v", "3", path.join(OUT, `${loop.name}.jpg`)]);
    console.log(probe(final));
  }
}
console.log("\nDone.");
