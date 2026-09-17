# Flux Instagram — mise en service

Le carrousel de la page d'accueil est alimenté par `assets/instagram.json`,
généré par la GitHub Action `.github/workflows/instagram.yml`.

Le site reste strictement statique : les images sont téléchargées au build,
converties en WebP et versionnées dans le dépôt. Aucune requête n'est envoyée
à Instagram depuis le navigateur des visiteuses, aucun cookie tiers n'est posé.
La politique de confidentialité reste donc exacte, sans modification.

Tant que le flux n'est pas branché, les six visuels `assets/images/insta-*.webp`
codés dans `index.html` restent affichés. Si l'API tombe, expire ou renvoie une
erreur, le script sort sans rien écraser et le site continue de fonctionner.

## 1. Préparer le compte

Le compte `@juliemeessen.institut` doit être en **Professionnel** — Entreprise
ou Créateur. Instagram → Paramètres → Type de compte. Un compte personnel n'a
pas accès à l'API.

## 2. Créer l'application Meta

1. https://developers.facebook.com/apps → Créer une application → **Autre** →
   **Professionnel**.
2. Ajouter le produit **Instagram** → *Configurer*.
3. Dans *Instagram → Configuration de l'API avec connexion Instagram*, ajouter
   l'autorisation `instagram_business_basic`.
4. Générer un **token d'accès** pour le compte de Julie. Instagram renvoie un
   token longue durée valable 60 jours.

## 3. Enregistrer les secrets

Dépôt GitHub → Settings → Secrets and variables → Actions :

| Secret | Contenu | Obligatoire |
|---|---|---|
| `IG_TOKEN` | le token longue durée de l'étape 2 | oui |
| `GH_PAT` | PAT « fine-grained » sur ce dépôt, permission **Secrets : write** | recommandé |

`GH_PAT` sert uniquement à réécrire `IG_TOKEN` à chaque passage, pour que le
token ne périme jamais. Sans lui, tout fonctionne — mais il faudra régénérer
le token à la main tous les 60 jours, et le carrousel retombera sur les visuels
de repli le jour où il expire.

## 4. Premier lancement

Onglet **Actions** → *Flux Instagram* → **Run workflow**.

L'action tourne ensuite chaque nuit à 04h17 UTC. Elle ne commite que si le flux
a réellement changé.

## Réglages

`IG_COUNT` dans le workflow fixe le nombre de publications conservées (6 par
défaut). Les images sont recadrées en carré 640 × 640, qualité 78.

## Dépannage

Les logs de l'action disent toujours ce qui s'est passé. Les messages
`[instagram] …` sont volontairement non bloquants : le script sort en code 0
pour ne jamais casser le site.

- `IG_TOKEN absent` → le secret n'est pas enregistré.
- `API : ...` → token expiré ou autorisation manquante. Régénérer à l'étape 2.
- `aucune publication retournée` → le compte n'est pas en Professionnel, ou
  l'autorisation `instagram_business_basic` n'a pas été accordée.
