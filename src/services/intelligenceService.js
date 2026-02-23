// src/services/intelligenceService.js
const Parser = require('rss-parser');
const db = require('./db');

const parser = new Parser();

// Feed configuration
const FEEDS = [
    { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph', category: 'crypto' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', category: 'crypto' },
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'YahooFinance', category: 'macro' }
];

// Mock Twitter Data (since no direct API access)
// In a real scenario, this would be a Twitter API v2 integration or browser-based scraper.
const MOCK_TWEETS = [
    {
        title: "Bitcoin breaks $95k resistance",
        content: "Just in: Bitcoin has officially broken the $95,000 resistance level. Expect volatility ahead. #BTC #Crypto",
        link: "https://twitter.com/mock_trader/status/123456789",
        source: "TopTraderX",
        category: "tweet",
        pubDate: new Date().toISOString()
    },
    {
        title: "Fed rate decision preview",
        content: "Markets are pricing in a 25bps cut next month. If Powell signals pause, expect a sell-off in risk assets.",
        link: "https://twitter.com/macro_guru/status/987654321",
        source: "MacroGuru",
        category: "tweet",
        pubDate: new Date().toISOString()
    }
];

// Initialize DB
db.initDB();

/**
 * Fetch and process intelligence from RSS feeds
 */
async function fetchIntelligence() {
    console.log("Fetching intelligence from feeds...");
    let newItemsCount = 0;

    // 1. Process RSS Feeds
    for (const feed of FEEDS) {
        try {
            const feedData = await parser.parseURL(feed.url);
            console.log(`Fetched ${feedData.items.length} items from ${feed.source}`);

            for (const item of feedData.items.slice(0, 5)) { // Limit to latest 5 per feed to save tokens
                const sentiment = analyzeSentimentBasic(item.title + " " + (item.contentSnippet || ""));
                
                const newItem = {
                    source: feed.source,
                    title: item.title,
                    content: item.contentSnippet || item.content || "",
                    link: item.link,
                    category: feed.category,
                    sentiment: sentiment,
                    summary: "", // Can be filled by LLM later
                    published_at: new Date(item.pubDate).toISOString()
                };

                const result = db.insertItem(newItem);
                if (result.changes > 0) newItemsCount++;
            }
        } catch (error) {
            console.error(`Error fetching feed ${feed.source}:`, error);
        }
    }

    // 2. Process Mock Tweets (Simulation)
    for (const tweet of MOCK_TWEETS) {
        const sentiment = analyzeSentimentBasic(tweet.content);
        const newItem = {
            source: tweet.source,
            title: tweet.title,
            content: tweet.content,
            link: tweet.link,
            category: tweet.category,
            sentiment: sentiment,
            summary: "",
            published_at: tweet.pubDate
        };
        const result = db.insertItem(newItem);
        if (result.changes > 0) newItemsCount++;
    }

    console.log(`Intelligence update complete. ${newItemsCount} new items added.`);
    return newItemsCount;
}

/**
 * Simple keyword-based sentiment analysis (Placeholder for LLM)
 */
function analyzeSentimentBasic(text) {
    const bullishKeywords = ['breakout', 'surge', 'high', 'gain', 'buy', 'long', 'support', 'growth'];
    const bearishKeywords = ['drop', 'fall', 'loss', 'sell', 'short', 'resistance', 'crash', 'risk'];
    
    text = text.toLowerCase();
    let score = 0;

    bullishKeywords.forEach(word => { if (text.includes(word)) score++; });
    bearishKeywords.forEach(word => { if (text.includes(word)) score--; });

    if (score > 0) return 'bullish';
    if (score < 0) return 'bearish';
    return 'neutral';
}

module.exports = {
    fetchIntelligence
};
