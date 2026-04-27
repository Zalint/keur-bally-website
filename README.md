# Keur Bally — site e-commerce

Site vitrine + panier multi-produits + commande WhatsApp pour le mini-market **Keur Bally** (Liberté 5, Dakar). Catalogue alimenté par un Google Sheet, hébergé sur Vercel, sans base de données ni back-office.

---

## Stack

- **Next.js 14** (App Router, TypeScript strict)
- **Tailwind CSS** (palette charte Keur Bally : vert foncé, rouge bordeaux, crème)
- **React Context + localStorage** pour le panier
- **Google Sheet → CSV** comme source de données (revalidation ISR 1h)
- Aucune base de données, aucun backend, aucun compte utilisateur

---

## Installation locale

Prérequis : **Node.js ≥ 18.18**.

```bash
cp .env.local.example .env.local
# édite .env.local avec ton numéro WhatsApp Business

npm install
npm run dev
# → http://localhost:3000
```

Tant que `GOOGLE_SHEET_CSV_URL` est vide, le site lit `data/sample.csv` (catalogue de démo).

---

## Le Google Sheet

Le catalogue est une **feuille unique**. Une colonne `type` distingue produits et packs.

| Colonne              | Type                | Obligatoire | Exemple                               |
| -------------------- | ------------------- | ----------- | ------------------------------------- |
| `id`                 | string unique       | oui         | `riz-sangomar-25`                     |
| `slug`               | string URL          | oui         | `riz-sangomar-25kg`                   |
| `type`               | `produit` ou `pack` | oui         | `produit`                             |
| `nom`                | string              | oui         | `Riz parfumé Sangomar 25 kg`          |
| `categorie`          | string              | oui         | `Épicerie sèche`                      |
| `description`        | string              | non         | `Riz jasmine parfumé...`              |
| `prix_fcfa`          | nombre              | oui         | `18000`                               |
| `unite`              | string              | oui         | `sac`, `kg`, `L`, `pièce`, `lot`, `boîte`, `bouteille`, `pack` |
| `image_url`          | URL absolue ou `/images/...` | oui | `https://...` |
| `image_url_2`, `image_url_3` | URL         | non         | photos additionnelles fiche article   |
| `disponible`         | `oui` ou `non`      | oui         | `oui`                                 |
| `ordre`              | nombre              | oui         | `10` (tri croissant)                  |
| `composition`        | string multi-ligne  | si pack     | voir ci-dessous                       |
| `livraison_gratuite` | `oui` ou `non`      | oui         | `non`                                 |
| `note`               | string              | non         | encart sur la fiche pack              |

### Composer un pack

Dans la cellule `composition`, **une ligne = un produit**. Séparateur : retour à la ligne (Alt+Entrée dans Google Sheets) ou la séquence `\n` littérale dans un export CSV.

Pour signaler qu'une ligne est substituable, ajoute le suffixe **`(ou équivalent)`** :

```
Sac de riz Umbrella 25 kg
Huile MIS 5 L
Petits pois 800 g (ou équivalent)
Lentilles Mocitos
```

Le composant `PackComposition` détecte automatiquement ce suffixe et l'affiche en italique discret.

### Publier le Sheet en CSV

1. Ouvre le Google Sheet
2. **Fichier → Partager → Publier sur le Web**
3. Choisis la feuille concernée + format **Valeurs séparées par des virgules (.csv)**
4. Copie l'URL générée et place-la dans `GOOGLE_SHEET_CSV_URL` (`.env.local` en local, variables d'environnement Vercel en prod)

Le site rafraîchit automatiquement le catalogue **toutes les heures** (ISR `revalidate: 3600`).

---

## Déploiement Vercel

```bash
# 1. Installer la CLI Vercel (une seule fois)
npm i -g vercel

# 2. Depuis le dossier du projet
vercel

# 3. Pour la prod
vercel --prod
```

Ou via l'interface web :

1. Pousse le projet sur GitHub
2. Sur **vercel.com → New Project**, importe le repo
3. Dans **Settings → Environment Variables**, configure :
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` (format : `221771234567`, sans `+`)
   - `NEXT_PUBLIC_SITE_URL` (ex. `https://keurbally.com`)
   - `NEXT_PUBLIC_BUSINESS_NAME` (`Keur Bally`)
   - `NEXT_PUBLIC_BUSINESS_TAGLINE` (`Mini-Market`)
   - `NEXT_PUBLIC_BUSINESS_LOCATION` (`Rond-point Liberté 5, Dakar`)
   - `GOOGLE_SHEET_CSV_URL` (URL du Sheet publié)
4. **Deploy**

### Domaine custom

**Project → Settings → Domains → Add** → suivre les instructions DNS (CNAME ou A record selon ton registrar). Vercel s'occupe du certificat HTTPS.

---

## Personnalisation rapide

| Pour changer…              | Où ?                                                         |
| -------------------------- | ------------------------------------------------------------ |
| Le numéro WhatsApp         | Variable `NEXT_PUBLIC_WHATSAPP_NUMBER`                       |
| Le nom de la boutique      | Variable `NEXT_PUBLIC_BUSINESS_NAME`                         |
| L'adresse                  | Variable `NEXT_PUBLIC_BUSINESS_LOCATION`                     |
| Les couleurs / typo        | [tailwind.config.ts](tailwind.config.ts), [app/globals.css](app/globals.css) |
| Le hero                    | [components/Hero.tsx](components/Hero.tsx)                   |
| Les FAQ                    | [app/comment-commander/page.tsx](app/comment-commander/page.tsx) |
| La politique de substitution | [components/SubstitutionNotice.tsx](components/SubstitutionNotice.tsx) |

---

## Tests manuels recommandés avant livraison

- [ ] **Ajout** : un produit (au kg, à la pièce), un pack, un mix
- [ ] **Quantités** : modif kg par 0.5, modif pièce par 1, suppression auto sous le minimum
- [ ] **Persistance** : recharger la page → le panier reste
- [ ] **Message WhatsApp** : avec 1 produit, 1 pack, mix produit+pack, panier de 5 articles
- [ ] **Indisponibilité** : passer un item à `disponible = non` dans le Sheet, le panier l'affiche grisé et l'exclut du WA
- [ ] **Substitution** : une ligne `(ou équivalent)` dans la composition s'affiche en italique
- [ ] **Livraison gratuite** : badge visible sur card pack, fiche pack et panier
- [ ] **Mobile 375px** : pas de scroll horizontal, CTA sticky visible

---

## Structure du projet

```
keur-bally/
├── app/
│   ├── layout.tsx             # CartProvider + Header + Footer
│   ├── page.tsx               # Home (hero + packs + catégories + steps)
│   ├── catalogue/             # Tous les items, filtres type + catégorie
│   ├── packs/                 # Vue dédiée packs
│   ├── article/[slug]/        # Fiche produit OU pack (génération statique)
│   ├── panier/                # Panier + CTA WhatsApp
│   ├── comment-commander/
│   ├── contact/
│   ├── sitemap.ts             # /sitemap.xml
│   └── robots.ts              # /robots.txt (noindex /panier)
├── components/                # ProductCard, PackCard, AddToCartButton, etc.
├── contexts/CartContext.tsx   # État panier + persistance localStorage
├── lib/
│   ├── sheets.ts              # Fetch CSV + parsing + cache 1h
│   ├── cart.ts                # formatFcfa, stepFor, totaux
│   ├── whatsapp.ts            # Génération du message + URL wa.me
│   └── types.ts
├── data/sample.csv            # Catalogue de démo
└── public/images/products/    # Photos produits Keur Bally
```

---

## Limitations volontaires

- **Pas de paiement en ligne** : paiement à la livraison (cash, Wave, Orange Money à confirmer avec le livreur)
- **Pas de compte utilisateur** : panier en localStorage uniquement
- **Pas d'historique de commandes** : tout passe par WhatsApp
- **Pas de stock en temps réel** : la disponibilité dépend du Sheet, rafraîchie toutes les heures (ISR)
