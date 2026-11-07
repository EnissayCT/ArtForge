# Darart

Affiches en métal imprimées UV au Maroc — site de validation de marché (proof of concept).

## Lancer le site

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000. Copier `.env.example` vers `.env.local` pour régler le numéro WhatsApp et la clé admin.

## Ce que fait le site

| Page | Rôle |
|---|---|
| `/` | Accueil : héros, collections, sélection, vidéo fixation aimantée, formats à l'échelle, sur-mesure, coques, atelier |
| `/boutique` | Catalogue complet, filtres collection / orientation, tri, recherche (`?q=`) |
| `/collections/[slug]` | 8 collections |
| `/oeuvre/[slug]` | Fiche produit : aperçu, **vue 3D** (reflet lumineux à l'ouverture), **« Chez vous »** (5 pièces + photo de son propre mur), zoom détail, plaque ↔ coque, formats, finitions, cadres |
| `/creer` | Atelier sur mesure : import (glisser, coller, choisir), cadrage (glisser, zoom, rotation, image entière + fond), jauge de qualité d'impression (dpi), 3D, mise en situation, coques avec repère caméra |
| `/coques` | Coques iPhone / Samsung / Xiaomi |
| `/panier`, `/commande`, `/commande/merci` | Panier, commande **paiement à la livraison**, confirmation WhatsApp |
| `/aide`, `/atelier`, `/favoris` | FAQ, page marque, favoris |
| `/admin` | Commandes, chiffre d'affaires, inscrits au club — pour mesurer la demande |

## Où modifier quoi

- **Prix, formats, finitions, cadres, livraison, codes promo** : `src/lib/pricing.ts`
- **Téléphones** : `src/lib/phones.ts`
- **Collections** : `src/lib/catalog.ts` — **œuvres** : `src/data/artworks.json` (+ images dans `public/art/`)
- **Pièces de mise en situation** : `src/data/scenes.json` (+ `public/scenes/`) — `anchor` = centre de l'œuvre, `cmPerWidth` = largeur réelle du mur visible
- **Vidéos** : `src/data/videos.json` (+ `public/videos/`)
- **Nom, WhatsApp, ville, navigation** : `src/lib/site.ts`

## Données

Les commandes, inscriptions et fichiers clients sont enregistrés dans `data/` (ignoré par git) :
`data/orders.json`, `data/leads.json`, `data/uploads/*.jpg`. Ça fonctionne en local et sur un VPS ;
sur un hébergement serverless (Vercel) il faudra brancher une base de données à la place de `src/lib/store.ts`.

En production, `/admin` n'est accessible qu'avec `ADMIN_KEY` défini et `/admin?key=…`.

## Contenus et droits

Les œuvres sont du domaine public / CC0 (sources par œuvre dans `src/data/CREDITS.md` et sur chaque fiche).
Vidéos Mixkit et photos d'intérieur : voir `src/data/MEDIA_CREDITS.md`.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · three.js / React Three Fiber · Zustand · Zod
