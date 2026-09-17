/**
 * Récupère les dernières publications Instagram et les écrit en local.
 *
 * Objectif : le site reste strictement statique. Aucune requête n'est faite
 * vers Instagram depuis le navigateur des visiteuses — les images sont
 * téléchargées ici, converties en WebP et versionnées dans le dépôt.
 *
 * Variables d'environnement :
 *   IG_TOKEN   token longue durée Instagram (obligatoire)
 *   IG_COUNT   nombre de publications à conserver (défaut : 6)
 *
 * En cas d'échec, le script sort en code 0 sans rien modifier : le site
 * continue d'afficher les visuels déjà présents.
 */

import { writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const TOKEN = process.env.IG_TOKEN;
const COUNT = Number(process.env.IG_COUNT || 6);
const OUT_DIR = 'assets/images/instagram';
const JSON_PATH = 'assets/instagram.json';
const API = 'https://graph.instagram.com/v21.0';

function bail(message) {
  console.warn(`[instagram] ${message} — les visuels existants sont conservés.`);
  process.exit(0);
}

/** Nettoie une légende pour en faire un texte alternatif utile. */
function toAlt(caption) {
  if (!caption) return "Publication Instagram de Julie Meessen Institut";
  const clean = caption
    .replace(/#[\p{L}\p{N}_]+/gu, '')
    .replace(/@[\w.]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return "Publication Instagram de Julie Meessen Institut";
  return clean.length > 120 ? `${clean.slice(0, 117).trimEnd()}…` : clean;
}

if (!TOKEN) bail('IG_TOKEN absent');

// 1. Prolonge le token (il reste valable 60 jours à partir d'aujourd'hui).
try {
  const r = await fetch(`${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${TOKEN}`);
  const j = await r.json();
  if (j.access_token) {
    await writeFile('.ig-token-refreshed', j.access_token, 'utf8');
    console.log(`[instagram] token prolongé (${j.expires_in ?? '?'} s)`);
  }
} catch {
  console.warn('[instagram] prolongation du token impossible, on continue');
}

// 2. Récupère les publications.
let media = [];
try {
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const r = await fetch(`${API}/me/media?fields=${fields}&limit=${COUNT * 2}&access_token=${TOKEN}`);
  const j = await r.json();
  if (j.error) bail(`API : ${j.error.message}`);
  media = (j.data || []).filter(m => m.media_url || m.thumbnail_url).slice(0, COUNT);
} catch (e) {
  bail(`appel API impossible (${e.message})`);
}

if (!media.length) bail('aucune publication retournée');

// 3. Télécharge, redimensionne, convertit en WebP.
await mkdir(OUT_DIR, { recursive: true });
const posts = [];

for (const [i, m] of media.entries()) {
  const src = m.media_type === 'VIDEO' ? (m.thumbnail_url || m.media_url) : m.media_url;
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const name = `post-${String(i + 1).padStart(2, '0')}.webp`;
    await sharp(buf)
      .resize(640, 640, { fit: 'cover', position: 'attention' })
      .webp({ quality: 78 })
      .toFile(path.join(OUT_DIR, name));
    posts.push({
      id: m.id,
      image: `${OUT_DIR}/${name}`,
      permalink: m.permalink,
      alt: toAlt(m.caption),
      timestamp: m.timestamp,
      isVideo: m.media_type === 'VIDEO'
    });
  } catch (e) {
    console.warn(`[instagram] publication ${m.id} ignorée : ${e.message}`);
  }
}

if (!posts.length) bail('aucune image téléchargée');

// 4. Supprime les fichiers devenus orphelins.
const keep = new Set(posts.map(p => path.basename(p.image)));
for (const f of await readdir(OUT_DIR)) {
  if (f.endsWith('.webp') && !keep.has(f)) await unlink(path.join(OUT_DIR, f));
}

await writeFile(JSON_PATH, JSON.stringify({ updated: new Date().toISOString(), posts }, null, 2) + '\n', 'utf8');
console.log(`[instagram] ${posts.length} publication(s) enregistrée(s)`);
