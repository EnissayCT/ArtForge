# Research notes — what the ads are built on

Everything below was read as reference material. No script, installer or command from these sources was run; the rules were re-applied by hand in this project.

## 1. Remotion's official agent skills

- Repo: https://github.com/remotion-dev/skills
- Files read: `skills/remotion-markup/SKILL.md`, `timing.md`, `sequencing.md`, `multi-scene-video.md`, `transitions.md`, `google-fonts.md`, `images.md`, `audio.md`, `sfx.md`, `3d.md`, and `skills/remotion-render/SKILL.md` (skill version 4.0.541, same as the pinned Remotion).

Rules taken:

| Rule | Where it shows up |
|---|---|
| Animate only from `useCurrentFrame()` + `interpolate()`; CSS `transition`/`animation` don't render | The site's hover/`@keyframes` glint was re-written as a frame-driven `<Glint pos>` (`src/components/Plate.tsx`); every move is a function of the frame |
| Custom timing with `Easing.bezier()`; clamp extrapolation | The site's two easings (`cubic-bezier(0.16,1,0.3,1)` and `(0.76,0,0.24,1)`) live in `src/lib/anim.ts` |
| Each scene its own component inside a `<Sequence>`; timing from `fps` | `AdMurVide.tsx` / `AdTaPhoto.tsx` are one component per beat, cut times in `src/cues.json` |
| Fonts via `@remotion/google-fonts` (blocks rendering until loaded) | Archivo loaded with `loadVariableFont` so the `wdth` axis (62 %) works; IBM Plex Mono with `loadFont` |
| Assets in `public/` + `staticFile()` | All images/audio copied into `ads/public/` |
| `<Audio>` from `@remotion/media` | One baked soundtrack per ad |
| 3D: animation must be frame-driven; WebGL needs `<ThreeCanvas>` | Not used: GPU safety. All 3D is CSS `perspective` + `rotateY` (software-GL friendly) |
| Render stills at chosen frames (`remotion render --frames=…`) to review | Done at every iteration; contact sheets in `out/` |
| Use Remotion's own headless Chrome | Kept, with `--gl=swangle --concurrency=2` |
| The skill's SFX list (`remotion.media/*.wav`) | Not used: mostly meme sounds, off-brand, and no license text for paid ads |

## 2. Marketing skills (Corey Haines, `marketingskills`)

- `ad-creative` skill: https://github.com/coreyhaines31/marketingskills/tree/main/skills/ad-creative
  - `references/hook-system.md`, `references/short-form-video-specs.md`, `references/motion-video-ads.md`
- `video` skill: https://github.com/coreyhaines31/marketingskills/tree/main/skills/video
  - `references/code-rendered-product-films.md`, `references/edit-anatomy.md`

Rules taken:

- **A hook has three parts that do different jobs:** what you see, the caption, and the sound. They should add to each other, not repeat. Ad A: the caption states the situation ("Ton mur est vide ?"), the picture shows the fix (the plate snaps on), and the sound is the "clac" plus the beat drop. Ad B: the caption reads "Ta photo,", the picture turns the photo into metal, and a metallic "shing" plays with the glint.
- **For impulse products, open with proof or a relatable moment, not a contrast argument.** Both hooks show the product doing its thing within 1 second.
- **The next beat (the "on-ramp") must continue the hook's idea.** In A, the question is answered by "Zéro trou." on the snap, then "how does it hold?" (steel sheet, then clac). In B, the photo becomes metal, then "how do I get mine?" (envoie → cadre → visualise).
- **Captions are fully visible on frame 1.** The hook text needs no entrance animation, so the first frame works as the thumbnail.
- **Cut every 0.5 to 1 s; one dominant motion per beat.** The gallery cuts every 15 frames (0.5 s) on the beat. Each beat has one move: a snap, a tilt or a slam.
- **Safe band (cross-platform worst case):** clear 220 px at the top, 500 px at the bottom and 180 px at the sides. Combined with Meta's numbers below.
- **Paid ads: bake the music in and fade it over the last ~0.8 s.** Both soundtracks are baked and fade over the last 0.7 s.
- **Deterministic renders:** no `Math.random()` and no clocks. Audio noise comes from a seeded generator and film grain is indexed by frame.
- **No invented claims, stats or testimonials.** Only the brief's fact list is used.
- **Legibility:** body text is at least 20 px at 1080p. Mono labels here are 24 to 36 px, headlines 140 to 350 px.
- **End card:** logo lockup, one line, one CTA. No recap montage.
- **Review contact sheets of the frames yourself.** Done for each iteration.
- **Loudness: normalise to about −14 LUFS with a true peak around −1.5 dBTP.** Both WAVs come out at −14.2 / −14.3 LUFS with peaks of −2.0 / −2.8 dBFS.
- **"Agents can't listen": flag music for a human ear-check.** Flagged in the README and the report.

## 3. Meta (Instagram / Facebook Reels)

- Instagram Reels ad specs: https://www.facebook.com/business/ads-guide/update/video/instagram-reels
- Reels ads overview: https://www.facebook.com/business/ads/facebook-instagram-reels-ads
- Safe-zone help article (title only retrieved): https://www.facebook.com/business/help/980593475366490/

Rules taken:

- **Keep about 14 % at the top, 35 % at the bottom and 6 % on each side free** of text, logos and key elements. On 1080×1920 the text band here runs from y = 270 to y = 1248, with at least 72 px of side margin. `SafeZones` overlay in `src/components/ui.tsx` (`safe: true` prop) to check.
- **9:16 full screen; sound "strongly recommended";** AAC stereo at 128 kbps or more (rendered at 192 kbps).
- **Avoid licensed music;** prefer original audio. All audio is synthesised in `scripts/make-audio.mjs`.
- **Reels play sound-on by default** (unless the viewer muted them), so the snap and glint are scored. Every message is also on screen for sound-off viewers.
- **Meta reports that 9:16 video with sound and key messages in the safe zone gets more Reels delivery.** That is Meta's own figure, used only as a design target.
- **Branding and key message within the first 3 seconds** (Meta guidance, quoted in search results). The brand lockup shows from 1.3 s in Ad A and from frame 0 in Ad B. The product appears within the first second in both.

## Hooks chosen

- **Ad A, "Le mur vide":** frame 0 is the bare wall with a dashed "40 × 60 cm" outline and **"TON MUR / EST VIDE ?"** in huge condensed type. The plate flies in from 0.4 s and snaps on at 1.0 s with a clack and the beat drop. The caption switches to **"ZÉRO TROU."** on the impact.
  - Why the question first: "Zéro trou." alone on a still thumbnail doesn't say what's being sold. The question puts the viewer's own wall in the frame (a question/relatable move), and the snap is the proof one second later.
- **Ad B, "Ta photo, sur métal":** frame 0 shows the brand lockup, **"TA PHOTO,"** and a phone showing the photo. The photo lifts out, swings in 3D, picks up a bevel and a glint, and lands as a metal plate at 1.0 s as **"SUR MÉTAL."** appears. This is a transformation shown, not described: proof first.
