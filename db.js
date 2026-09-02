const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'nawijo.db');
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_date TEXT NOT NULL,
    position INTEGER NOT NULL,
    team TEXT NOT NULL,
    sport TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    badge_emoji TEXT NOT NULL,
    team_color TEXT NOT NULL,
    content_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

function clearArticlesForDate(articleDate) {
  db.prepare('DELETE FROM articles WHERE article_date = ?').run(articleDate);
}

function insertArticle(article) {
  const stmt = db.prepare(`
    INSERT INTO articles (article_date, position, team, sport, title, subtitle, badge_emoji, team_color, content_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    article.articleDate,
    article.position,
    article.team,
    article.sport,
    article.title,
    article.subtitle,
    article.badgeEmoji,
    article.teamColor,
    JSON.stringify(article.content)
  );
}

function getArticlesForDate(articleDate) {
  const rows = db.prepare(`
    SELECT * FROM articles WHERE article_date = ? ORDER BY position ASC
  `).all(articleDate);
  return rows.map(rowToArticle);
}

function getLatestArticles() {
  const dateRow = db.prepare('SELECT article_date FROM articles ORDER BY article_date DESC LIMIT 1').get();
  if (!dateRow) return [];
  return getArticlesForDate(dateRow.article_date);
}

function getPastDates(excludeDate) {
  const rows = db.prepare(`
    SELECT DISTINCT article_date FROM articles
    WHERE article_date != ?
    ORDER BY article_date DESC
  `).all(excludeDate);
  return rows.map((row) => row.article_date);
}

function getArticleById(id) {
  const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  return row ? rowToArticle(row) : null;
}

function rowToArticle(row) {
  return {
    id: row.id,
    articleDate: row.article_date,
    position: row.position,
    team: row.team,
    sport: row.sport,
    title: row.title,
    subtitle: row.subtitle,
    badgeEmoji: row.badge_emoji,
    teamColor: row.team_color,
    content: JSON.parse(row.content_json)
  };
}

module.exports = {
  db,
  clearArticlesForDate,
  insertArticle,
  getArticlesForDate,
  getLatestArticles,
  getPastDates,
  getArticleById
};
