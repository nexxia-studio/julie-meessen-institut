# Julie Meessen Institut — Site web

Site vitrine statique (HTML/CSS/JS) pour l'institut de beauté **Julie Meessen** à Welkenraedt.
Conçu pour un hébergement **GitHub Pages**, sans backend.

---

## 📁 Structure

```
julie-meessen-institut/
├── index.html              ← Page d'accueil
├── css/
│   └── styles.css          ← Design system + tous les composants
├── js/
│   └── script.js           ← Header scroll, menu mobile, reveals, carrousel
├── assets/
│   ├── fonts/              ← Dream Avenue + Monterchi (WOFF2, auto-hébergées)
│   ├── images/            ← Poster vidéo, OG, visuels Instagram
│   └── videos/
│       └── hero.mp4        ← Vidéo de fond (compressée pour le web)
└── README.md
```

---

## 🚀 Déploiement sur GitHub Pages

1. Crée un dépôt GitHub (ex. `julie-meessen-institut`).
2. Pousse tout le contenu de ce dossier à la racine du dépôt :
   ```bash
   git init
   git add .
   git commit -m "Site Julie Meessen Institut"
   git branch -M main
   git remote add origin https://github.com/<ton-compte>/julie-meessen-institut.git
   git push -u origin main
   ```
3. Dans le dépôt : **Settings → Pages → Source : `main` / `(root)`**.
4. Le site sera en ligne sous quelques minutes sur
   `https://<ton-compte>.github.io/julie-meessen-institut/`.
5. **Nom de domaine** (`juliemeessen-institut.be`) : ajoute un fichier `CNAME`
   contenant le domaine, puis configure le DNS chez ton registrar (enregistrement
   `CNAME` ou `A` vers les IP de GitHub Pages).

---

## ✏️ Contenu à remplacer

| Élément | Emplacement | À faire |
|---|---|---|
| **Témoignages** | `index.html` → section `.testimonials` | Remplacer par de vrais avis Salonkee |
| **Visuels Instagram** | `assets/images/insta-1…6.jpg` | Voir « Connecter Instagram » ci-dessous |
| **Image de partage** | `assets/images/og-image.jpg` | Remplacer par un vrai visuel 1200×630 |
| **Vidéo hero** | `assets/videos/hero.mp4` | OK (déjà compressée) — remplaçable |

---

## 📸 Connecter le carrousel Instagram (sans backend)

Le carrousel utilise pour l'instant des visuels de remplacement. Pour afficher
les vraies publications de **@juliemeessen.institut** automatiquement, le plus
simple est un service gratuit et conforme RGPD :

**Option recommandée — [Behold.so](https://behold.so) (gratuit)**
1. Crée un compte, connecte le compte Instagram de l'institut.
2. Behold te donne un petit script + un identifiant de feed.
3. Remplace le bloc `.instagram__track` par le widget Behold, ou utilise leur
   API JSON pour injecter les images dans le carrousel existant.

Alternatives : **LightWidget**, **EmbedSocial**, **Elfsight** (offres gratuites limitées).

> Sans service tiers, Instagram ne permet pas d'afficher un feed en direct sur un
> site statique. La grille reste sinon à mettre à jour manuellement.

---

## 🔤 Polices — important

Les polices de marque sont **Dream Avenue** (titres) et **Monterchi** (corps),
auto-hébergées en WOFF2.

⚠️ **La version actuelle de Monterchi est une version d'essai (trial)** qui
remplace les **chiffres** par un filigrane. Contournement en place : via
`unicode-range`, les chiffres s'affichent automatiquement en Dream Avenue (dont
les chiffres sont valides).
👉 **Pour la production, acheter la licence Monterchi complète** chez Zetafonts,
puis remplacer les fichiers `assets/fonts/Monterchi-*.woff2`.

---

## ⚙️ Optimisations déjà en place

- Vidéo hero : **22 Mo → ~0,9 Mo** (H.264, 900px, sans audio, `faststart`).
- Polices : TTF → **WOFF2** (~236 Ko au total), auto-hébergées (rapides + RGPD).
- `prefers-reduced-motion` respecté, navigation clavier, `aria-*` sur le menu.
- SEO : balises meta + **JSON-LD `BeautySalon`** (adresse, horaires, note 5/5).

---

## 🔜 Pages à venir

- `menu-de-soins.html` — tarifs détaillés par catégorie
- `a-propos.html` — histoire de Julie, philosophie, marques

La navigation pointe déjà vers ces fichiers.
