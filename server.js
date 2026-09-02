const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cron = require('node-cron');
const { getLatestArticles, getArticlesForDate, getPastDates, getArticleById } = require('./db');
const { LEVELS, CONGRATS_MESSAGES } = require('./levels');
const { generateArticles } = require('./generate');

const app = express();
const PORT = process.env.PORT || 3000;
const TIMEZONE = process.env.TIMEZONE || 'America/Toronto';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

cron.schedule('0 6 * * *', () => {
  generateArticles(todayISO()).catch((err) => console.error('Erreur lors de la génération planifiée :', err));
}, { timezone: TIMEZONE });

// Génère immédiatement au démarrage si aucun article n'existe encore pour aujourd'hui
// (ex: premier déploiement, ou redémarrage après minuit avant le prochain passage du cron).
const latestAtBoot = getLatestArticles();
if (!latestAtBoot.length || latestAtBoot[0].articleDate !== todayISO()) {
  console.log("Aucun article pour aujourd'hui — génération immédiate...");
  generateArticles(todayISO()).catch((err) => console.error('Erreur lors de la génération au démarrage :', err));
}

app.use(express.static(__dirname));

function summarize(a) {
  const firstLevelKey = Object.keys(a.content)[0];
  return {
    id: a.id,
    team: a.team,
    sport: a.sport,
    title: a.title,
    subtitle: a.subtitle,
    badgeEmoji: a.badgeEmoji,
    teamColor: a.teamColor,
    image: a.content[firstLevelKey]?.[1]?.image || null
  };
}

app.get('/api/levels', (req, res) => {
  res.json({ levels: LEVELS, congrats: CONGRATS_MESSAGES });
});

app.get('/api/articles', (req, res) => {
  const articles = getLatestArticles();
  res.json({
    date: articles.length ? articles[0].articleDate : null,
    articles: articles.map(summarize)
  });
});

app.get('/api/archive', (req, res) => {
  const latest = getLatestArticles();
  const latestDate = latest.length ? latest[0].articleDate : null;
  res.json({ dates: getPastDates(latestDate) });
});

app.get('/api/archive/:date', (req, res) => {
  const articles = getArticlesForDate(req.params.date);
  res.json({ date: req.params.date, articles: articles.map(summarize) });
});

app.get('/api/articles/:id', (req, res) => {
  const article = getArticleById(Number(req.params.id));
  if (!article) {
    return res.status(404).json({ error: 'Article introuvable. As-tu lancé "node generate.js" aujourd\'hui ?' });
  }
  res.json({ article });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Nawijo est en ligne : http://localhost:${PORT}`);
});
