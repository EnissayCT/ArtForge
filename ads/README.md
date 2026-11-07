# Ads — Reels + site loops (Remotion)

Two 15-second vertical ads for Instagram/Facebook Reels and two silent product loops for the website. All of it is code, so the brand name, photo or copy can change and the videos re-render with one command.

| Output | What |
|---|---|
| `out/ad-a-mur-vide.mp4` | Ad A, "Le mur vide" (no-drill angle). 1080×1920, 30 fps, 15.0 s, H.264 + AAC 192 kbps |
| `out/ad-b-ta-photo.mp4` | Ad B, "Ta photo, sur métal" (personalisation angle). Same spec |
| `out/ad-a-contact.jpg`, `out/ad-b-contact.jpg` | 8-frame contact sheets for a quick look |
| `out/site-loop-glint.mp4` + `.jpg` | Plate tilting slowly in 3D under a sweeping glint. 1080×1350 (4:5), 8 s, seamless, silent |
| `out/site-loop-snap.mp4` + `.jpg` | Magnet snap onto a wall, then the plate lifts off again so the loop is seamless. 1080×1350, 7 s, silent |

## Setup

```bash
cd ads
npm install          # Node 22; Remotion downloads its own headless Chrome on first render
```

## Re-render everything (new brand name = one command)

```bash
npm run render -- --brand "Nouveau Nom"
```

This regenerates both ads with the new name on the logo lockups, the app header in Ad B and the end cards. It also redoes the loops, posters and contact sheets. The default is `Darart`. Options:

- `--only a` / `--only b` / `--only loops` (comma-separated) renders a subset.
- `--audio` forces a rebuild of the soundtracks.

**GPU safety:** every render uses software GL (`--gl=swangle`) and two Chrome tabs (`--concurrency=2`), also set in `remotion.config.ts`. One full run (2 ads + 2 loops) takes about 8 to 10 minutes on this PC.

Other commands:

```bash
npm run studio       # live preview / scrubbing in the browser (Remotion Studio)
npm run audio        # rebuild public/audio/ad-a.wav + ad-b.wav (≈3 s, deterministic)
npm run typecheck
npx remotion still AdMurVide out/stills/check.png --frame=0 --gl=swangle --props='{"brand":"Darart","safe":true}'   # frame with the Reels safe-zone overlay
```

### Swapping the "customer photo" in Ad B

Ad B uses a stock café photo (`public/scenes/cafe.jpg`) as the photo that turns into metal. To use your own photo or a customer's (with their written permission):

1. Put it in `public/`, e.g. `public/photos/medina.jpg`.
2. In `scripts/render-all.mjs`, change `photo: "scenes/cafe.jpg", photoPosition: "62% 50%"`.
   - `photoPosition` is the CSS `object-position` of the 3:4 crop.
3. Run `npm run render -- --only b`.

Avoid faces of people who haven't agreed to appear in an ad.

## How it's built

- `src/cues.json` holds every cut and every sound hit, in frames. The video and the audio script both read it, so the "clac" always lands on the snap.
- `src/components/Plate.tsx` draws the metal plate: rounded corners, bright bevel, gloss/mat/brushed finishes, the double diagonal **glint**, and a contact shadow driven by `lift`.
- `src/lib/anim.ts` contains `snapState()`, the magnet snap. The plate accelerates in, lands, compresses, settles with a damped bounce, and the shadow tightens; a short camera shake plays on impact.
- `src/components/Room.tsx` places a room photo so a wall anchor lands on screen, and hangs plates at true scale where it fits (`cmPerWidth` from the site's `scenes.json`).
- `scripts/make-audio.mjs` synthesises the soundtrack: a 120 BPM groove (D minor for A, F major for B) and the effects, normalised to −14 LUFS.
- The palette, Archivo at `wdth` 62 %, IBM Plex Mono and the logo mark all come from the website.

Text stays inside the Reels safe band: y = 270 to 1248 on 1920, at least 72 px from the sides. That follows Meta's 14 % top, 35 % bottom and 6 % side guidance.

---

## Ad A — "Le mur vide" (no-drill)

| Time | Picture | On-screen copy | Sound |
|---|---|---|---|
| 0–1.0 s | Bare living-room wall with a dashed 40×60 cm outline. The plate flies in and **snaps** on at 1.0 s | **TON MUR / EST VIDE ?** | Riser, whoosh, then the magnet *clac* and the beat drops |
| 1.0–2.5 s | Plate settles, glint sweeps, slow push-in | Lockup + **ZÉRO TROU.** | Groove, glint *shing* |
| 2.5–4.8 s | Angled view: the adhesive steel sheet is pressed on, then the plate slides in and clicks onto it | 01 — Elle se colle · **COLLE.** / 02 — L'affiche s'aimante · **CLAC.** | Soft press, whoosh, big *clac* |
| 4.8–8.0 s | Six rooms, one plate snapping on per beat | **MAJORELLE. HOKUSAI. L'ESPACE. VAN GOGH. CHEFCHAOUEN. TA PHOTO.** | *Clac* on every beat |
| 8.0–9.5 s | The four sizes to scale | **À TA TAILLE.** 20×30 · 190 DH / 30×40 · 250 DH (le plus choisi) / 40×60 · 390 DH / 60×90 · 690 DH | Small clicks |
| 9.5–11 s | Three finishes side by side | **MAT, BRILLANT OU BROSSÉ.** + Cadre chêne ou noir en option | Whoosh, *shing* |
| 11–13 s | Offer card | Affiches en métal · dès **190 DH** · **PAIEMENT À LA LIVRAISON** · −15 % dès 3 plaques · Livraison offerte dès 500 DH | Impact |
| 13–15 s | End card | Logo · **CHOISIS LA TIENNE.** · [Commander →] · Paiement à la livraison · Livraison partout au Maroc | Final chord, fade |

**Primary text (short, for the ad):** `Zéro trou dans le mur. Dès 190 DH.`

**Caption:**

> Ton mur est vide ? Accroche une affiche en métal imprimée UV, sans perçage : une plaque adhésive, un aimant, clac.
> Zellige, Hokusai, l'espace… ou ta propre photo. Dès 190 DH, −15 % dès 3 plaques.
> Paiement à la livraison, partout au Maroc. Choisis la tienne sur le site.

**Hashtags:** `#decomaroc #decorationinterieure #maroc #casablanca #marrakech #zellige #affichemetal #ديكور`

## Ad B — "Ta photo, sur métal" (personalisation)

| Time | Picture | On-screen copy | Sound |
|---|---|---|---|
| 0–1.0 s | Phone with a photo open. The photo lifts out, swings in 3D, catches a bevel and a glint, and lands as a metal plate | Lockup + **TA PHOTO,** then **SUR MÉTAL.** at 1.0 s | Whoosh, *shing*, metallic hit, beat drops |
| 1.0–2.5 s | The plate sways, a second glint | (same) | Groove |
| 2.5–5.5 s | Phone UI, three steps: upload, crop (format chips), preview on a wall with the plate snapping on | 01 · Depuis ton téléphone **ENVOIE.** / 02 · Choisis le format **CADRE.** / 03 · Aperçu sur ton mur et en 3D **VISUALISE.** | UI taps, pop, small *clac* |
| 5.5–8.0 s | Real room: the plate snaps on the wall | Fixation aimantée · **SANS PERÇAGE.** | Whoosh, big *clac* |
| 8.0–10 s | Printed case turning in 3D | **ET SUR TA COQUE AUSSI.** iPhone · Samsung · Xiaomi · Coques dès **149 DH** | Whoosh, *shing* |
| 10–12.5 s | Offer card + plate & case | Ta photo sur métal · dès **190 DH** · **PAIEMENT À LA LIVRAISON** · −15 % dès 3 plaques · Livraison offerte dès 500 DH | Impact |
| 12.5–15 s | End card | Logo · **IMPRIME TA PHOTO.** · [Commander →] · Paiement à la livraison · Livraison partout au Maroc | Final chord, fade |

**Primary text (short):** `Ta photo, sur métal. Dès 190 DH.`

**Caption:**

> Ta plus belle photo dort dans ton téléphone ? Imprime-la sur métal (impression UV) et accroche-la sans perçage, avec un aimant.
> Envoie-la, cadre-la, vois-la sur ton mur avant de commander. Et sur ta coque aussi, dès 149 DH.
> Plaques dès 190 DH, paiement à la livraison partout au Maroc. Commande sur le site.

**Hashtags:** `#photosurmetal #cadeaupersonnalise #decomaroc #maroc #casablanca #rabat #coquepersonnalisee #ديكور`

## Before running the ads

- **Listen once on a phone.** The soundtrack was synthesised and checked by meter and spectrogram (−14 LUFS, no clipping), but nobody has listened to it yet.
- **"Le plus choisi" (30×40)** comes from the site's pricing config. If there are no sales yet, consider removing that tag; it is the only comparative claim. It's in `src/ads/AdMurVide.tsx`, the `top: true` size.
- **The phone UI in Ad B is an illustration** of the site's flow (upload, crop, wall preview, 3D), not a screenshot. Check it still matches the live site after the current redesign.
- **End cards carry no URL or handle.** The Instagram CTA button does that job.
