const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { clearArticlesForDate, insertArticle } = require('./db');
const { LEVELS } = require('./levels');
const DEMO_ARTICLES = require('./demo-data');

const DEMO_MODE = String(process.env.DEMO_MODE).toLowerCase() === 'true';
const MODEL = 'claude-sonnet-5';

const SPORT_EMOJI = {
  hockey: '🏒', football: '🏈', soccer: '⚽', 'ski alpin': '⛷️', ski: '⛷️',
  patinage: '⛸️', golf: '⛳', tennis: '🎾', basketball: '🏀', baseball: '⚾',
  natation: '🏊', athlétisme: '🏃', boxe: '🥊', cyclisme: '🚴'
};
const BAND_COLORS = ['#2D4E8A', '#B83A3A', '#1F8A5F'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function resolveTargetDate() {
  const arg = process.argv[2];
  if (!arg) return todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
    throw new Error(`Date invalide : "${arg}". Utilise le format AAAA-MM-JJ, ex: node generate.js 2026-09-01`);
  }
  return arg;
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('{');
  const startArr = raw.indexOf('[');
  let from = start;
  if (startArr !== -1 && (start === -1 || startArr < start)) from = startArr;
  const isArray = from === startArr;
  const end = isArray ? raw.lastIndexOf(']') : raw.lastIndexOf('}');
  const slice = raw.slice(from, end + 1);
  return JSON.parse(slice);
}

function textFromResponse(response) {
  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

const CANDIDATE_POOL_SIZE = 8;

async function findTodaysNews(client) {
  const prompt = `Trouve les ${CANDIDATE_POOL_SIZE} actualités sportives les plus importantes d'aujourd'hui en français,
en priorité pour Montréal, puis Québec, Canada, Amérique du Nord, puis mondial (dans cet ordre de priorité dans le tableau).
Pour chaque actualité, retourne : titre, sous-titre, équipe, sport, faits clés (joueurs, score, contexte).

Pour chaque actualité, indique aussi l'URL de la page web (trouvée par ta recherche) qui couvre l'événement,
et si possible une deuxième URL d'une page centrée sur le joueur vedette ou un moment clé (sinon null).
Ces URLs serviront uniquement à afficher la vraie photo publiée sur ces pages — choisis en priorité des
sites de presse généralistes ou sportifs connus pour publier de vraies photos éditoriales dans leurs pages
(ex: La Presse, TSN, Sportsnet, NHL.com, MLS.com, sites officiels d'équipes, agences de presse). Évite autant
que possible les sites qui bloquent les robots ou n'affichent pas de photo dans leurs pages (ex: ESPN,
Sofascore, Forbes) — préfère une autre source qui couvre le même événement si possible.

Réponds uniquement avec un objet JSON valide (sans texte autour, sans balises markdown), au format exact suivant :
{
  "articles": [
    {
      "team": "nom de l'équipe ou de l'athlète",
      "sport": "nom du sport",
      "title": "titre accrocheur et simple",
      "subtitle": "sous-titre court",
      "facts": "faits clés en 1-2 phrases concises, en texte brut sans aucune balise (pas de <cite> ni de markup) : score, joueurs vedettes, contexte",
      "sourceUrl": "URL de l'article qui couvre l'événement",
      "playerSourceUrl": "URL centrée sur le joueur vedette, ou null si non disponible"
    }
  ]
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 10 }],
    messages: [{ role: 'user', content: prompt }]
  });

  const rawText = textFromResponse(response);
  try {
    const parsed = extractJson(rawText);
    return parsed.articles;
  } catch (err) {
    const debugPath = path.join(__dirname, 'debug-news-response.txt');
    fs.writeFileSync(debugPath, rawText);
    throw new Error(`JSON invalide reçu de Claude (réponse brute sauvegardée dans ${debugPath}) : ${err.message}`);
  }
}

async function generatePageText(client, facts, level, pageNumber) {
  const pageFocus = pageNumber === 1
    ? "l'événement principal (ce qui s'est passé, le résultat)"
    : 'un joueur vedette ou un moment clé de cet événement';

  const prompt = `Voici des faits sportifs réels et exacts :
"""
${facts}
"""

Rédige le texte de la page ${pageNumber} d'un article pour enfant, en te concentrant sur ${pageFocus}.
Niveau de lecture visé : "${level.name}" (${level.ageRange}), soit entre ${level.minWords} et ${level.maxWords} mots.
Règles :
- Les faits doivent rester exacts, seule la complexité du langage change selon le niveau.
- Phrases courtes et adaptées à l'âge pour les niveaux plus jeunes ; vocabulaire plus riche, contexte et statistiques pour les niveaux plus avancés.
- Ton positif et encourageant, pour donner le goût de lire.
- N'invente aucun fait qui ne soit pas dans le texte fourni.

Réponds uniquement avec un objet JSON valide (sans texte autour, sans balises markdown) au format :
{ "title": "titre court de la page", "body": "texte de la page" }`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }]
  });

  return extractJson(textFromResponse(response));
}

async function fetchUnsplashImage(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return placeholderImage(query);
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&content_filter=high&orientation=landscape`;
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
    if (!res.ok) return placeholderImage(query);
    const data = await res.json();
    const photo = data.results && data.results[0];
    return photo ? photo.urls.regular : placeholderImage(query);
  } catch (err) {
    console.warn('Unsplash indisponible, utilisation d\'une image de remplacement :', err.message);
    return placeholderImage(query);
  }
}

const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function probeImage(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': BROWSER_USER_AGENT }
      });
      clearTimeout(timeout);
      if (res.body && typeof res.body.cancel === 'function') res.body.cancel().catch(() => {});
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.startsWith('image/') || contentType.includes('svg')) return false;
      const contentLength = Number(res.headers.get('content-length') || 0);
      if (contentLength && contentLength < 8000) return false;
      return true;
    } catch (err) {
      continue;
    }
  }
  return false;
}

function parseImageDimensions(buf) {
  if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length - 9) {
      if (buf[offset] !== 0xff) { offset += 1; continue; }
      const marker = buf[offset + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue; }
      if (marker === 0xd9 || marker === 0xda) break;
      const segmentLength = buf.readUInt16BE(offset + 2);
      const isSofMarker = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSofMarker) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
      }
      offset += 2 + segmentLength;
    }
    return null;
  }
  if (buf.length >= 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const format = buf.toString('ascii', 12, 16);
    if (format === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (format === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  }
  return null;
}

async function looksLikeLogo(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_USER_AGENT, Range: 'bytes=0-65535' }
    });
    clearTimeout(timeout);
    if (!res.ok && res.status !== 206) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    const dims = parseImageDimensions(buf);
    if (!dims || !dims.width || !dims.height) return false;
    const ratio = dims.width / dims.height;
    const isSquareish = ratio > 0.8 && ratio < 1.25;
    const isSmall = Math.max(dims.width, dims.height) < 900;
    return isSquareish && isSmall;
  } catch (err) {
    return false;
  }
}

const DEBUG_IMAGES = String(process.env.DEBUG_IMAGES).toLowerCase() === 'true';
function debugImage(sourceUrl, reason) {
  if (DEBUG_IMAGES) console.log(`    [debug] ${sourceUrl} -> ${reason}`);
}

async function fetchOgImage(sourceUrl) {
  if (!sourceUrl) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(sourceUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_USER_AGENT, Accept: 'text/html' }
    });
    clearTimeout(timeout);
    if (!res.ok) return debugImage(sourceUrl, `HTTP ${res.status}`), null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return debugImage(sourceUrl, `content-type ${contentType}`), null;

    const html = await res.text();
    const match = html.match(/<meta[^>]+(?:property|name)=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image(?::secure_url)?["']/i)
      || html.match(/<meta[^>]+(?:property|name)=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (!match) return debugImage(sourceUrl, 'no og:image meta tag found'), null;

    const decodedRaw = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    const imageUrl = new URL(decodedRaw, sourceUrl).href;
    const GENERIC_IMAGE_HINTS = /\bshare\b|\blogo\b|\bplaceholder\b|\bsprite\b|\bfavicon\b|og-image-default|default[-_]?share|social-card|assets\/og\/team|team-logo|\bcrest\b|\bbadge\b|\bbracket\b|\bblank\b|\bchart\b|\bgraphic\b|\btemplate\b|\bbanner\b|\bwordmark\b|\bicon\b|\bschedule\b/i;
    if (GENERIC_IMAGE_HINTS.test(imageUrl)) return debugImage(sourceUrl, `rejected by keyword filter: ${imageUrl}`), null;
    if (!(await probeImage(imageUrl))) return debugImage(sourceUrl, `failed probeImage: ${imageUrl}`), null;
    if (await looksLikeLogo(imageUrl)) return debugImage(sourceUrl, `looks like a logo (dimensions): ${imageUrl}`), null;

    debugImage(sourceUrl, `ACCEPTED: ${imageUrl}`);
    return imageUrl;
  } catch (err) {
    debugImage(sourceUrl, `error: ${err.message}`);
    return null;
  }
}

function placeholderImage(seed) {
  const s = encodeURIComponent(seed).slice(0, 60);
  return `https://picsum.photos/seed/${s}/1000/650`;
}

function pickBadge(sport) {
  const key = sport.toLowerCase();
  for (const [name, emoji] of Object.entries(SPORT_EMOJI)) {
    if (key.includes(name)) return emoji;
  }
  return '🏆';
}

async function generateWithAI() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.log('Étape 1/3 — Recherche des actualités sportives du jour...');
  const candidates = await findTodaysNews(client);

  console.log(`Étape 2/3 — Recherche de vraies photos parmi ${candidates.length} actualités candidates...`);
  const selected = [];
  const usedIndices = new Set();
  const usedImages = new Set();

  for (let i = 0; i < candidates.length && selected.length < 3; i++) {
    const item = candidates[i];
    let realSourceImage = await fetchOgImage(item.sourceUrl);
    if (realSourceImage && usedImages.has(realSourceImage)) {
      debugImage(item.sourceUrl, `image déjà utilisée par un autre article, rejetée : ${realSourceImage}`);
      realSourceImage = null;
    }
    if (!realSourceImage) {
      console.log(`  ✗ Pas de vraie photo pour "${item.title}" — actualité écartée.`);
      continue;
    }
    let realPlayerImage = await fetchOgImage(item.playerSourceUrl);
    if (realPlayerImage && usedImages.has(realPlayerImage)) {
      realPlayerImage = null;
    }
    realPlayerImage = realPlayerImage || realSourceImage;

    usedImages.add(realSourceImage);
    usedImages.add(realPlayerImage);

    console.log(`  ✓ Vraie photo trouvée pour "${item.title}".`);
    usedIndices.add(i);
    selected.push({ item, image1: realSourceImage, image2: realPlayerImage });
  }

  if (selected.length < 3) {
    console.warn(`Seulement ${selected.length}/3 actualités avec une vraie photo trouvée parmi ${candidates.length} candidates ; complément avec des photos génériques pour les places restantes.`);
    for (let i = 0; i < candidates.length && selected.length < 3; i++) {
      if (usedIndices.has(i)) continue;
      const item = candidates[i];
      const image1 = await fetchUnsplashImage(`${item.team} ${item.sport}`);
      const image2 = await fetchUnsplashImage(`${item.sport} player action`);
      selected.push({ item, image1, image2 });
    }
  }

  const articles = [];
  for (let i = 0; i < selected.length; i++) {
    const { item, image1, image2 } = selected[i];
    console.log(`Étape 3/3 — Génération des textes pour l'article ${i + 1}/${selected.length} (${item.team})...`);

    const content = {};
    for (const level of LEVELS) {
      content[level.key] = {};
      for (const pageNumber of [1, 2]) {
        content[level.key][pageNumber] = await generatePageText(client, item.facts, level, pageNumber);
      }
    }

    articles.push({
      position: i + 1,
      team: item.team,
      sport: item.sport,
      title: item.title,
      subtitle: item.subtitle,
      badgeEmoji: pickBadge(item.sport),
      teamColor: BAND_COLORS[i % BAND_COLORS.length],
      image1,
      image2,
      content
    });
  }

  return articles;
}

async function generateArticles(articleDate) {
  console.log(`Génération des articles Nawijo pour le ${articleDate} (DEMO_MODE=${DEMO_MODE})`);

  const articles = DEMO_MODE ? DEMO_ARTICLES : await generateWithAI();

  clearArticlesForDate(articleDate);
  for (const article of articles) {
    const contentWithImages = {};
    for (const level of LEVELS) {
      contentWithImages[level.key] = {
        1: { ...article.content[level.key][1], image: article.image1 },
        2: { ...article.content[level.key][2], image: article.image2 }
      };
    }
    insertArticle({
      articleDate,
      position: article.position,
      team: article.team,
      sport: article.sport,
      title: article.title,
      subtitle: article.subtitle,
      badgeEmoji: article.badgeEmoji,
      teamColor: article.teamColor,
      content: contentWithImages
    });
  }

  console.log(`${articles.length} articles enregistrés dans nawijo.db pour le ${articleDate}.`);
  return articles.length;
}

module.exports = { generateArticles };

if (require.main === module) {
  generateArticles(resolveTargetDate()).catch((err) => {
    console.error('Erreur lors de la génération des articles :', err);
    process.exit(1);
  });
}
