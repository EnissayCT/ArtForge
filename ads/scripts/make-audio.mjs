// Synthesizes the two 15 s soundtracks (music bed + sound effects) from scratch.
// Everything is generated here from oscillators and seeded noise: no samples, no
// third-party audio, so there is nothing to license. Timing comes from src/cues.json,
// the same file the compositions read, so every "clack" lands on its frame.
//
//   node scripts/make-audio.mjs        -> public/audio/ad-a.wav, public/audio/ad-b.wav
//
// Then loudness-normalised with ffmpeg (EBU R128, -14 LUFS, -1.5 dBTP).

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cues = JSON.parse(fs.readFileSync(path.join(ROOT, "src/cues.json"), "utf8"));

const SR = 48000;
const DUR = 15;
const N = SR * DUR;
const FPS = cues.fps;
const BEAT = 60 / cues.bpm; // 0.5 s
const fr = (f) => f / FPS; // frame -> seconds

/* ------------------------------ DSP basics ------------------------------ */
const rng = (seed) => {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return (s / 4294967296) * 2 - 1;
  };
};

class Biquad {
  constructor(type = "lp", f = 1000, q = 0.707) {
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
    this.set(type, f, q);
  }
  set(type, f, q) {
    const w = (2 * Math.PI * Math.min(Math.max(f, 10), SR * 0.45)) / SR;
    const c = Math.cos(w);
    const s = Math.sin(w);
    const a = s / (2 * q);
    let b0, b1, b2;
    if (type === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
    else if (type === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
    else [b0, b1, b2] = [a, 0, -a]; // band-pass, 0 dB peak
    const a0 = 1 + a;
    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = (-2 * c) / a0;
    this.a2 = (1 - a) / a0;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

const polyblep = (t, dt) => {
  if (t < dt) {
    t /= dt;
    return t + t - t * t - 1;
  }
  if (t > 1 - dt) {
    t = (t - 1) / dt;
    return t * t + t + t + 1;
  }
  return 0;
};

const bus = () => [new Float32Array(N), new Float32Array(N)];
const panGains = (pan) => {
  const th = ((pan + 1) * Math.PI) / 4;
  return [Math.cos(th) * Math.SQRT2, Math.sin(th) * Math.SQRT2];
};
/** write a mono generator (i -> sample) into a stereo bus */
function write(b, t0, dur, gen, pan = 0, gain = 1) {
  const i0 = Math.max(0, Math.round(t0 * SR));
  const i1 = Math.min(N, Math.round((t0 + dur) * SR));
  for (let i = i0; i < i1; i++) {
    const t = (i - Math.round(t0 * SR)) / SR;
    const v = gen(t) * gain;
    const p = typeof pan === "function" ? pan(t) : pan;
    const [gl, gr] = panGains(p);
    b[0][i] += v * gl;
    b[1][i] += v * gr;
  }
}
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

/* ------------------------------ Instruments ------------------------------ */
function kick(b, t0, amp = 1) {
  let ph = 0;
  const r = rng(Math.round(t0 * 1000) + 7);
  const hp = new Biquad("hp", 2500, 0.7);
  write(b, t0, 0.5, (t) => {
    const f = 46 + 120 * Math.exp(-t / 0.032);
    ph += (2 * Math.PI * f) / SR;
    const body = Math.sin(ph) * Math.exp(-t / 0.17) * Math.min(1, t / 0.0015);
    const click = hp.run(r()) * Math.exp(-t / 0.004) * 0.5;
    return Math.tanh((body + click) * 1.6) * 0.9 * amp;
  });
}

function clap(b, send, t0, amp = 1) {
  const r = rng(Math.round(t0 * 977) + 3);
  const bp = new Biquad("bp", 1500, 0.9);
  const g = (t) => {
    const bursts = [0, 0.009, 0.018].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) / 0.006) : 0), 0) * 0.55;
    const tail = t >= 0.018 ? Math.exp(-(t - 0.018) / 0.11) : 0;
    return bp.run(r()) * (bursts + tail) * 0.75 * amp;
  };
  write(b, t0, 0.45, g, 0.05);
  const bp2 = new Biquad("bp", 1500, 0.9);
  const r2 = rng(Math.round(t0 * 977) + 3);
  write(send, t0, 0.3, (t) => bp2.run(r2()) * Math.exp(-t / 0.05) * 0.25 * amp, 0);
}

function hat(b, t0, amp = 1, open = false, pan = 0.18) {
  const r = rng(Math.round(t0 * 1543) + 11);
  const hp = new Biquad("hp", 7600, 0.8);
  const hp2 = new Biquad("hp", 7600, 0.8);
  const d = open ? 0.16 : 0.032;
  write(b, t0, d * 5, (t) => hp2.run(hp.run(r())) * Math.exp(-t / d) * 0.33 * amp, pan);
}

function bassNote(b, t0, dur, note, amp = 1) {
  const f = midi(note);
  let ph = 0;
  let sp = 0;
  const lp = new Biquad("lp", 520, 0.9);
  write(b, t0, dur + 0.06, (t) => {
    ph += (2 * Math.PI * f) / SR;
    sp += f / SR;
    if (sp >= 1) sp -= 1;
    const saw = 2 * sp - 1 - polyblep(sp, f / SR);
    const env = Math.min(1, t / 0.006) * (t < dur ? 1 - 0.25 * (t / dur) : Math.max(0, 1 - (t - dur) / 0.06) * 0.75);
    return Math.tanh((Math.sin(ph) * 0.9 + lp.run(saw) * 0.35) * 1.3) * env * 0.55 * amp;
  });
}

/** Warm pad: 3 detuned polyBLEP saws per note through a slowly opening low-pass. */
function pad(b, send, t0, dur, notes, opts = {}) {
  const { amp = 1, cutoffFrom = 700, cutoffTo = 1500, attack = 0.25, release = 0.7, sendAmt = 0.35 } = opts;
  notes.forEach((n, ni) => {
    [-7, 0, 7].forEach((cents, vi) => {
      const f = midi(n) * Math.pow(2, cents / 1200);
      let p = ((ni * 0.37 + vi * 0.21) % 1 + 1) % 1;
      const lp = new Biquad("lp", cutoffFrom, 0.6);
      const pan = (vi - 1) * 0.45 + (ni % 2 ? 0.1 : -0.1);
      let k = 0;
      const total = dur + release;
      const gen = (t) => {
        if (k++ % 64 === 0) lp.set("lp", cutoffFrom + (cutoffTo - cutoffFrom) * Math.min(1, t / Math.max(0.01, dur)), 0.6);
        const dt = f / SR;
        const v = 2 * p - 1 - polyblep(p, dt);
        p += dt;
        if (p >= 1) p -= 1;
        const env = Math.min(1, t / attack) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / release));
        return lp.run(v) * env * 0.06 * amp;
      };
      // write to bus and a quieter copy to the reverb send
      const i0 = Math.round(t0 * SR);
      const [gl, gr] = panGains(pan);
      for (let i = 0; i < total * SR; i++) {
        const idx = i0 + i;
        if (idx >= N) break;
        const v = gen(i / SR);
        if (idx < 0) continue;
        b[0][idx] += v * gl;
        b[1][idx] += v * gr;
        send[0][idx] += v * gl * sendAmt;
        send[1][idx] += v * gr * sendAmt;
      }
    });
  });
}

/* ------------------------------ Sound effects ------------------------------ */
/** air whoosh: band-passed noise with a sweeping centre, panned across */
function whoosh(b, t0, dur, amp = 1, up = true, panFrom = -0.6, panTo = 0.6) {
  const r = rng(Math.round(t0 * 3331) + 5);
  const bp = new Biquad("bp", 400, 1.1);
  let k = 0;
  write(
    b,
    t0,
    dur + 0.08,
    (t) => {
      const x = Math.min(1, t / dur);
      if (k++ % 32 === 0) bp.set("bp", up ? 300 + 3600 * x * x : 3800 - 3400 * x, 1.1);
      const env = t < dur ? Math.pow(x, 1.8) : Math.exp(-(t - dur) / 0.025);
      return bp.run(r()) * env * 0.9 * amp;
    },
    (t) => panFrom + (panTo - panFrom) * Math.min(1, t / dur),
  );
}

/** the magnet snap: transient + inharmonic metal ring + thump on the wall */
function clack(b, send, t0, amp = 1, tone = 1) {
  const r = rng(Math.round(t0 * 7919) + 13);
  const hp = new Biquad("hp", 2200, 0.7);
  const bp = new Biquad("bp", 3600, 2.5);
  const partials = [
    [612, 0.07, 0.45],
    [1484, 0.055, 0.38],
    [2391, 0.04, 0.3],
    [3527, 0.03, 0.22],
    [5013, 0.022, 0.14],
    [6870, 0.015, 0.08],
  ];
  const gen = (t) => {
    let v = hp.run(r()) * Math.exp(-t / 0.0025) * 0.9; // contact tick
    v += bp.run(r()) * Math.exp(-t / 0.012) * 0.6; // magnet "click"
    for (const [f, d, a] of partials) v += Math.sin(2 * Math.PI * f * tone * t + a) * Math.exp(-t / d) * a;
    const tf = 110 * Math.exp(-t / 0.05) + 58;
    v += Math.sin(2 * Math.PI * tf * t) * Math.exp(-t / 0.07) * 0.9; // thump
    return Math.tanh(v * 1.2) * 0.85 * amp;
  };
  write(b, t0, 0.4, gen, 0);
  write(send, t0, 0.2, (t) => {
    let v = 0;
    for (const [f, d, a] of partials) v += Math.sin(2 * Math.PI * f * tone * t + a) * Math.exp(-t / d) * a;
    return v * 0.3 * amp;
  });
}

/** sub impact under a big moment */
function boom(b, t0, amp = 1) {
  let ph = 0;
  write(b, t0, 0.9, (t) => {
    const f = 44 + 34 * Math.exp(-t / 0.09);
    ph += (2 * Math.PI * f) / SR;
    return Math.sin(ph) * Math.exp(-t / 0.32) * Math.min(1, t / 0.003) * 0.75 * amp;
  });
}

/** the glint, as a sound: airy high partials gliding up, panned with the light */
function shing(b, send, t0, amp = 1, panFrom = -0.5, panTo = 0.5) {
  const parts = [
    [4186, 0.55, 0.3],
    [5274, 0.45, 0.24],
    [6272, 0.38, 0.2],
    [7902, 0.3, 0.14],
    [9397, 0.25, 0.1],
  ];
  const r = rng(Math.round(t0 * 4421) + 17);
  const hp = new Biquad("hp", 6500, 0.7);
  const gen = (t) => {
    const glide = 1 + 0.025 * Math.min(1, t / 0.3);
    let v = 0;
    for (const [f, d, a] of parts) v += Math.sin(2 * Math.PI * f * glide * t) * a * Math.exp(-t / d);
    v *= Math.min(1, t / 0.012);
    v += hp.run(r()) * 0.25 * Math.exp(-t / 0.18) * Math.min(1, t / 0.02);
    return v * 0.28 * amp;
  };
  const pan = (t) => panFrom + (panTo - panFrom) * Math.min(1, t / 0.6);
  write(b, t0, 1.4, gen, pan);
  write(send, t0, 1.0, gen, pan, 0.8);
}

/** soft UI tap */
function tap(b, t0, amp = 1) {
  const r = rng(Math.round(t0 * 2131) + 19);
  const bp = new Biquad("bp", 2400, 1.5);
  write(b, t0, 0.08, (t) => (Math.sin(2 * Math.PI * 1750 * t) * Math.exp(-t / 0.012) * 0.45 + bp.run(r()) * Math.exp(-t / 0.004) * 0.6) * amp * 0.6, 0.1);
}

/** upward blip when the photo drops in */
function pop(b, t0, amp = 1) {
  let ph = 0;
  write(b, t0, 0.14, (t) => {
    const f = 380 + 900 * Math.min(1, t / 0.07);
    ph += (2 * Math.PI * f) / SR;
    return Math.sin(ph) * Math.exp(-t / 0.045) * Math.min(1, t / 0.004) * 0.35 * amp;
  });
}

/** adhesive steel sheet pressed on: muffled thup + a short sticky rustle */
function press(b, t0, amp = 1) {
  const r = rng(Math.round(t0 * 1777) + 23);
  const lp = new Biquad("lp", 900, 0.7);
  let ph = 0;
  write(b, t0, 0.3, (t) => {
    const f = 150 * Math.exp(-t / 0.04) + 70;
    ph += (2 * Math.PI * f) / SR;
    return (Math.sin(ph) * Math.exp(-t / 0.06) * 0.7 + lp.run(r()) * Math.exp(-t / 0.05) * 0.35) * amp;
  });
}

/** rising filtered noise into a drop */
function riser(b, t0, dur, amp = 1) {
  const r = rng(Math.round(t0 * 991) + 29);
  const bp = new Biquad("bp", 300, 0.8);
  let k = 0;
  let ph = 0;
  write(b, t0, dur, (t) => {
    const x = t / dur;
    if (k++ % 32 === 0) bp.set("bp", 250 + 5200 * x * x, 0.8);
    const f = 180 + 520 * x * x;
    ph += (2 * Math.PI * f) / SR;
    return (bp.run(r()) * 0.7 + Math.sin(ph) * 0.12) * Math.pow(x, 2.2) * amp;
  }, (t) => -0.3 + 0.6 * (t / dur));
}

/* ------------------------------ Reverb (Schroeder/Freeverb-style) ------------------------------ */
function reverb(send, wet = 0.3) {
  const out = bus();
  const scale = SR / 44100;
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const aps = [556, 441, 341, 225];
  for (let ch = 0; ch < 2; ch++) {
    const spread = ch ? 23 : 0;
    const cs = combs.map((d) => ({ buf: new Float32Array(Math.round((d + spread) * scale)), i: 0, store: 0 }));
    const as = aps.map((d) => ({ buf: new Float32Array(Math.round((d + spread) * scale)), i: 0 }));
    const fb = 0.86;
    const damp = 0.25;
    const x = send[ch];
    const y = out[ch];
    for (let n = 0; n < N; n++) {
      const input = x[n] * 0.015;
      let acc = 0;
      for (const c of cs) {
        const o = c.buf[c.i];
        c.store = o * (1 - damp) + c.store * damp;
        c.buf[c.i] = input + c.store * fb;
        c.i = (c.i + 1) % c.buf.length;
        acc += o;
      }
      for (const a of as) {
        const bo = a.buf[a.i];
        const o = -acc + bo;
        a.buf[a.i] = acc + bo * 0.5;
        a.i = (a.i + 1) % a.buf.length;
        acc = o;
      }
      y[n] = acc * wet;
    }
  }
  return out;
}

/* ------------------------------ Arrangement ------------------------------ */
/**
 * Builds one soundtrack.
 * spec.chords: [startSec, notes[]] per bar; spec.bassRoots: midi root per bar
 * spec.sections: which drum layers play when
 */
function track(spec) {
  const music = bus(); // pad + bass (ducked by the kick)
  const drums = bus(); // kick, clap, hats (not ducked)
  const sfx = bus();
  const send = bus();
  const kicks = [];

  const t1 = spec.drop; // first downbeat (the snap)
  const tEnd = spec.endHit; // end-card hit

  // pre-roll pad (filtered) + riser into the drop
  pad(music, send, 0, t1 + 0.1, spec.intro, { amp: 0.8, cutoffFrom: 260, cutoffTo: 1100, attack: 0.04, release: 0.25 });
  riser(sfx, Math.max(0, t1 - 0.95), 0.95, 0.35);

  // bars
  spec.chords.forEach(([start, notes], i) => {
    const end = i < spec.chords.length - 1 ? spec.chords[i + 1][0] : tEnd;
    pad(music, send, start, end - start, notes, { amp: 0.95, cutoffFrom: 900, cutoffTo: 1700, attack: 0.03, release: 0.35 });
  });

  // drums + bass on a 16th grid from the drop to the end hit
  const step = BEAT / 4;
  for (let t = t1, s = 0; t < tEnd - 1e-6; t += step, s++) {
    const inBar = s % 16;
    const sec = spec.section(t);
    if (inBar % 4 === 0 && sec.kick) {
      kick(drums, t, 1);
      kicks.push(t);
    }
    if ((inBar === 4 || inBar === 12) && sec.clap) clap(drums, send, t, 0.8);
    if (sec.hats === "off" && inBar % 4 === 2) hat(drums, t, 0.9);
    if (sec.hats === "16" && inBar % 2 === 0) hat(drums, t, inBar % 4 === 2 ? 0.95 : 0.5, false, inBar % 4 === 2 ? 0.2 : -0.15);
    if (sec.hats === "16" && inBar % 2 === 1) hat(drums, t, 0.28, false, 0.3);
    if (sec.hats && inBar === 14) hat(drums, t, 0.5, true, 0.25);
    // bass: syncopated root / fifth / octave
    if (sec.bass) {
      const bar = Math.floor(s / 16);
      const root = spec.bassRoots[Math.min(bar, spec.bassRoots.length - 1)];
      const pat = { 0: [0, 3], 3: [0, 2], 6: [0, 2], 10: [7, 2], 12: [12, 2], 14: [0, 1.5] };
      if (pat[inBar]) bassNote(music, t, pat[inBar][1] * step * 0.92, root + pat[inBar][0], 0.95);
    }
  }

  // end hit: kick + boom + bright stab, then the pad rings out
  kick(drums, tEnd, 1);
  kicks.push(tEnd);
  boom(sfx, tEnd, 0.55);
  pad(music, send, tEnd, DUR - tEnd - 0.75, spec.outro, { amp: 1.15, cutoffFrom: 2200, cutoffTo: 900, attack: 0.008, release: 0.7, sendAmt: 0.9 });

  // sound effects
  spec.sfx({ sfx, send });

  // sidechain: music ducks under each kick (the "pump")
  const duck = new Float32Array(N).fill(1);
  for (const tk of kicks) {
    const i0 = Math.round(tk * SR);
    for (let i = i0; i < Math.min(N, i0 + 0.3 * SR); i++) {
      const g = 1 - 0.42 * Math.exp(-(i - i0) / (0.09 * SR));
      duck[i] = Math.min(duck[i], g);
    }
  }
  const verb = reverb(send, 0.32);
  const out = bus();
  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < N; i++) {
      out[ch][i] = music[ch][i] * 0.7 * duck[i] + drums[ch][i] * 0.62 + sfx[ch][i] * 0.95 + verb[ch][i];
    }
  }
  // master: gentle saturation + fade out over the last 0.7 s
  let peak = 0;
  for (let ch = 0; ch < 2; ch++)
    for (let i = 0; i < N; i++) {
      const t = i / SR;
      const fade = t > DUR - 0.7 ? Math.max(0, (DUR - t) / 0.7) : 1;
      const fin = t < 0.004 ? t / 0.004 : 1;
      const v = Math.tanh(out[ch][i] * 1.1) * fade * fin;
      out[ch][i] = v;
      peak = Math.max(peak, Math.abs(v));
    }
  const g = 0.89 / (peak || 1);
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) out[ch][i] *= g;
  return out;
}

function writeWav(file, [L, R]) {
  const buf = Buffer.alloc(44 + N * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + N * 4, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
  }
  fs.writeFileSync(file, buf);
}

function normalize(raw, final) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", final]);
  fs.unlinkSync(raw);
}

/* ------------------------------ Ad A — D minor, deep-house pulse ------------------------------ */
const A = cues.adA;
const D = 50; // D3
const adA = track({
  drop: fr(A.hookSnap),
  endHit: fr(A.end),
  intro: [D, D + 7, D + 12, D + 15],
  chords: [
    [1, [D, D + 3, D + 7, D + 10, D + 14]], // Dm9
    [3, [D - 4, D, D + 3, D + 7]], // Bbmaj7
    [5, [D + 3, D + 7, D + 10, D + 14]], // Fmaj7
    [7, [D - 2, D + 2, D + 5, D + 9]], // C add9
    [9, [D, D + 3, D + 7, D + 10, D + 14]],
    [11, [D - 4, D, D + 3, D + 7]],
  ],
  bassRoots: [D - 12, D - 16, D - 9, D - 14, D - 12, D - 16],
  outro: [D + 3, D + 7, D + 10, D + 14, D + 19], // F major 9 — opens up on the end card
  section: (t) => {
    if (t < fr(A.steel)) return { kick: true, clap: true, hats: "off", bass: true };
    if (t < fr(A.mechSnap)) return { kick: true, clap: false, hats: null, bass: false }; // space for the steel + clac
    if (t < fr(A.galleryLands[0] - 5)) return { kick: true, clap: true, hats: "off", bass: true };
    if (t < fr(A.sizes)) return { kick: true, clap: true, hats: "16", bass: true };
    return { kick: true, clap: true, hats: "16", bass: true };
  },
  sfx: ({ sfx, send }) => {
    whoosh(sfx, fr(12), fr(A.hookSnap) - fr(12), 0.9, true, 0.5, -0.1);
    clack(sfx, send, fr(A.hookSnap), 1.15, 1);
    boom(sfx, fr(A.hookSnap), 0.8);
    shing(sfx, send, fr(A.hookSnap + 6), 0.8);
    press(sfx, fr(A.steel), 1);
    whoosh(sfx, fr(A.mechSnap - 13), fr(13), 0.7, true, 0.6, 0);
    clack(sfx, send, fr(A.mechSnap), 1.2, 0.94);
    boom(sfx, fr(A.mechSnap), 0.5);
    A.galleryLands.forEach((f, i) => {
      whoosh(sfx, fr(f - 6), fr(6), 0.35, true, i % 2 ? 0.5 : -0.5, 0);
      clack(sfx, send, fr(f), 0.8, [1, 1.08, 0.95, 1.12, 1.03, 0.9][i]);
    });
    A.sizeLands.forEach((f, i) => clack(sfx, send, fr(f), 0.4, 1.25 + i * 0.08));
    whoosh(sfx, fr(A.finishes - 8), fr(8), 0.5, false, -0.4, 0.4);
    shing(sfx, send, fr(A.finishes + 14), 0.7, -0.6, 0.6);
    boom(sfx, fr(A.offer), 0.6);
    clack(sfx, send, fr(A.offer), 0.45, 0.7);
    shing(sfx, send, fr(A.offer + 12), 0.55);
    shing(sfx, send, fr(A.end + 8), 0.45, -0.3, 0.3);
  },
});

/* ------------------------------ Ad B — F major, brighter ------------------------------ */
const Bc = cues.adB;
const F = 53; // F3
const adB = track({
  drop: fr(Bc.hookLand),
  endHit: fr(Bc.end),
  intro: [F, F + 7, F + 12, F + 16],
  chords: [
    [1, [F, F + 4, F + 7, F + 11, F + 14]], // Fmaj9
    [3, [F + 4, F + 7, F + 11, F + 14]], // Am7
    [5, [F - 3, F + 2, F + 5, F + 9]], // Dm7
    [7, [F - 7, F - 3, F, F + 4, F + 9]], // Bbmaj9
    [9, [F, F + 4, F + 7, F + 11, F + 14]],
    [11, [F - 5, F - 1, F + 2, F + 5, F + 9]], // C add9-ish
  ],
  bassRoots: [F - 12, F - 8, F - 15, F - 19, F - 12, F - 17],
  outro: [F, F + 4, F + 7, F + 11, F + 16],
  section: (t) => {
    if (t < fr(Bc.steps)) return { kick: true, clap: true, hats: "off", bass: true };
    if (t < fr(Bc.room)) return { kick: true, clap: false, hats: "off", bass: true }; // the UI flow: lighter
    if (t < fr(Bc.roomSnap)) return { kick: true, clap: false, hats: null, bass: false }; // breath before the snap
    return { kick: true, clap: true, hats: "16", bass: true };
  },
  sfx: ({ sfx, send }) => {
    whoosh(sfx, fr(4), fr(Bc.hookLand) - fr(4), 0.7, true, -0.4, 0.3);
    shing(sfx, send, fr(15), 1.0, -0.6, 0.6);
    clack(sfx, send, fr(Bc.hookLand), 0.8, 1.15);
    boom(sfx, fr(Bc.hookLand), 0.8);
    shing(sfx, send, fr(44), 0.6, -0.4, 0.5);
    whoosh(sfx, fr(Bc.steps - 7), fr(7), 0.5, false, 0.4, -0.2);
    tap(sfx, fr(Bc.tap), 1);
    pop(sfx, fr(Bc.upload), 1);
    tap(sfx, fr(Bc.crop), 0.6);
    tap(sfx, fr(Bc.crop + 12), 0.9);
    tap(sfx, fr(Bc.preview), 0.6);
    clack(sfx, send, fr(Bc.preview + 8), 0.35, 1.3);
    whoosh(sfx, fr(Bc.room - 6), fr(6), 0.5, true, -0.3, 0.3);
    whoosh(sfx, fr(Bc.roomSnap - 14), fr(14), 0.85, true, -0.5, 0.1);
    clack(sfx, send, fr(Bc.roomSnap), 1.2, 0.97);
    boom(sfx, fr(Bc.roomSnap), 0.85);
    shing(sfx, send, fr(Bc.roomSnap + 6), 0.7);
    whoosh(sfx, fr(Bc.case - 6), fr(10), 0.6, false, -0.6, 0.4);
    shing(sfx, send, fr(Bc.case + 20), 0.45, -0.3, 0.4);
    boom(sfx, fr(Bc.offer), 0.6);
    clack(sfx, send, fr(Bc.offer), 0.45, 0.7);
    shing(sfx, send, fr(Bc.end + 8), 0.45, -0.3, 0.3);
  },
});

const outDir = path.join(ROOT, "public/audio");
fs.mkdirSync(outDir, { recursive: true });
for (const [name, data] of [
  ["ad-a", adA],
  ["ad-b", adB],
]) {
  const raw = path.join(outDir, `${name}.raw.wav`);
  writeWav(raw, data);
  normalize(raw, path.join(outDir, `${name}.wav`));
  console.log(`wrote public/audio/${name}.wav`);
}
