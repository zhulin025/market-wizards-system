// src/services/db.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'intelligence.db');

const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize the database schema
function initDB() {
    const tableSchema = `
    CREATE TABLE IF NOT EXISTS intelligence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT,
        title TEXT,
        content TEXT,
        link TEXT UNIQUE,
        category TEXT, -- 'news', 'tweet', 'macro'
        sentiment TEXT, -- 'bullish', 'bearish', 'neutral'
        summary TEXT,
        published_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `;
    db.exec(tableSchema);
}

// Insert new item
function insertItem(item) {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO intelligence (source, title, content, link, category, sentiment, summary, published_at)
        VALUES (@source, @title, @content, @link, @category, @sentiment, @summary, @published_at)
    `);
    return stmt.run(item);
}

// Get latest items
function getLatestItems(limit = 20) {
    const stmt = db.prepare('SELECT * FROM intelligence ORDER BY published_at DESC LIMIT ?');
    return stmt.all(limit);
}

// Get items by sentiment
function getItemsBySentiment(sentiment, limit = 10) {
    const stmt = db.prepare('SELECT * FROM intelligence WHERE sentiment = ? ORDER BY published_at DESC LIMIT ?');
    return stmt.all(sentiment, limit);
}

module.exports = {
    initDB,
    insertItem,
    getLatestItems,
    getItemsBySentiment
};
