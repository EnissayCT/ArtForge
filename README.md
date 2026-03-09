# ArtForge Studio 🔥

Plateforme e-commerce marocaine d'impression UV personnalisée sur plaques métal et coques de téléphone.

## Fonctionnalités

- **Éditeur de design** — Upload d'images, positionnement via Fabric.js, redimensionnement, rotation, flip, opacité
- **Aperçu 3D** — Prévisualisation en temps réel sur le produit (React Three Fiber)
- **Catalogue produits** — Plaques métal (A3/A4), coques téléphone (iPhone 14/15/16, Samsung S23/S24)
- **Calcul de prix** — Prix en MAD avec remises quantité, frais de livraison, option encre blanche
- **Panier** — Drawer latéral + page complète, persistance via localStorage
- **Commande COD** — Paiement à la livraison uniquement, formulaire avec validation téléphone marocain
- **Galerie d'exemples** — Filtrage par catégorie et tags
- **Contact** — Formulaire de contact avec FAQ
- **Admin** — Tableau de bord, gestion commandes, galerie
- **Responsive** — Mobile-first avec navigation adaptative

## Stack technique

| Technologie | Usage |
|---|---|
| Next.js 16 (App Router) | Framework React avec SSR/SSG |
| TypeScript | Typage statique |
| Tailwind CSS v4 | Styles utilitaires |
| Fabric.js | Éditeur canvas 2D |
| Three.js / React Three Fiber | Aperçu 3D |
| Zustand | State management |
| Prisma | ORM (PostgreSQL) |
| Supabase | Base de données + Auth + Storage |

## Installation

```bash
# Cloner le repo
git clone <repo-url>
cd ArtForge

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Remplir les variables dans .env.local

# Lancer en développement
npm run dev
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm run prisma:generate` | Générer le client Prisma |
| `npm run prisma:migrate` | Lancer les migrations |
| `npm run prisma:seed` | Peupler la base de données |
| `npm run prisma:studio` | Interface graphique Prisma |

## Structure du projet

```
src/
├── app/                    # Pages (App Router)
│   ├── admin/             # Dashboard admin
│   ├── api/               # Routes API (orders, upload)
│   ├── cart/              # Page panier
│   ├── checkout/          # Commande COD
│   ├── contact/           # Page contact
│   ├── customize/         # Éditeur de personnalisation
│   ├── examples/          # Galerie d'exemples
│   └── shop/              # Catalogue produits
├── components/
│   ├── cart/              # CartDrawer, CartItemCard
│   ├── customizer/        # Éditeur canvas, aperçu 3D, options
│   ├── layout/            # Navbar, Footer
│   └── ui/                # Composants réutilisables
├── config/                # Configuration site, produits, prix
├── hooks/                 # useCanvasEditor
├── lib/                   # Utilitaires, pricing, validateurs
├── stores/                # Zustand (editor, cart)
└── types/                 # Types TypeScript
```

## Produits

### Plaques Métal
- **A4** (210×297mm) — 150 MAD
- **A3** (297×420mm) — 220 MAD
- Finitions : Mat (+0) ou Brillant (+20 MAD)
- Option encre blanche (+30 MAD)

### Coques Téléphone
- iPhone 14, 15, 16
- Samsung Galaxy S23, S24
- Prix de base : 120 MAD
- Finitions : Mat ou Brillant

### Livraison
- Standard : 30 MAD
- **Gratuite** au-dessus de 500 MAD
- Partout au Maroc

## Variables d'environnement

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Licence

Projet privé — ArtForge Studio © 2025
