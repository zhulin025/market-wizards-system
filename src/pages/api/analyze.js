// In-memory cache: { symbol: { data: ..., timestamp: ... } }
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

// Helper: Get cached data or fetch fresh
async function getStockDataWithCache(symbol) {
  const cached = cache.get(symbol);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[API] Using cached data for ${symbol}`);
    return cached.data;
  }

  // Try different data sources in order of preference
  const sources = [
    { name: 'Yahoo Finance', fn: () => fetchYahooFinance(symbol) },
    { name: 'Alpha Vantage', fn: () => fetchAlphaVantage(symbol) },
    { name: 'Finnhub', fn: () => fetchFinnhub(symbol) },
    { name: 'Marketstack', fn: () => fetchMarketstack(symbol) },
    { name: 'iTick', fn: () => fetchITick(symbol) },
  ];

  for (const source of sources) {
    try {
      console.log(`[API] Trying ${source.name} for ${symbol}`);
      const result = await source.fn();
      if (result) {
        result._source = source.name;
        cache.set(symbol, { data: result, timestamp: now });
        console.log(`[API] Success: ${source.name} for ${symbol}`);
        return result;
      }
    } catch (e) {
      console.warn(`[API] ${source.name} error:`, e.message);
    }
  }

  // Last fallback: Try Yahoo CSV download
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/download/${symbol}?period1=${Math.floor(Date.now()/1000) - 63072000}&period2=${Math.floor(Date.now()/1000)}&interval=1d&events=history`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (response.ok) {
      const text = await response.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');
      const closeIdx = headers.indexOf('Close');
      const highIdx = headers.indexOf('High');
      const lowIdx = headers.indexOf('Low');
      
      const timestamps = [];
      const quote = { close: [], high: [], low: [] };
      
      for (let i = lines.length - 1; i >= Math.max(1, lines.length - 500); i--) {
        const cols = lines[i].split(',');
        timestamps.push(new Date(cols[0]).getTime() / 1000);
        quote.close.push(parseFloat(cols[closeIdx]));
        quote.high.push(parseFloat(cols[highIdx]));
        quote.low.push(parseFloat(cols[lowIdx]));
      }
      
      const result = {
        meta: { regularMarketPrice: quote.close[0] },
        timestamp: timestamps,
        indicators: { quote: [quote] },
        _source: 'Yahoo CSV'
      };
      cache.set(symbol, { data: result, timestamp: now });
      console.log(`[API] Yahoo CSV fallback for ${symbol}`);
      return result;
    }
  } catch (e) {
    console.warn(`[API] Yahoo CSV error:`, e.message);
  }

  return null;
}

// Yahoo Finance API (Primary)
async function fetchYahooFinance(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2y`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (response.ok) {
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (result) {
      return result;
    }
  }
  return null;
}

// Alpha Vantage API
async function fetchAlphaVantage(symbol) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    console.log('[API] Alpha Vantage: No API key configured');
    return null;
  }

  // Try intraday first (free, 5 requests/min)
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data['Time Series (Daily)']) {
    const timeSeries = data['Time Series (Daily)'];
    const dates = Object.keys(timeSeries).sort().slice(-100); // Last 100 days
    
    if (dates.length < 50) return null;
    
    const result = {
      meta: { 
        regularMarketPrice: parseFloat(timeSeries[dates[0]]['4. close']),
        fiftyTwoWeekHigh: Math.max(...dates.map(d => parseFloat(timeSeries[d]['2. high']))),
        fiftyTwoWeekLow: Math.min(...dates.map(d => parseFloat(timeSeries[d]['3. low']))),
      },
      timestamp: dates.map(d => new Date(d).getTime() / 1000),
      indicators: {
        quote: [{
          close: dates.map(d => parseFloat(timeSeries[d]['4. close'])),
          high: dates.map(d => parseFloat(timeSeries[d]['2. high'])),
          low: dates.map(d => parseFloat(timeSeries[d]['3. low']))
        }]
      }
    };
    return result;
  }
  return null;
}

// Finnhub API
async function fetchFinnhub(symbol) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.log('[API] Finnhub: No API key configured');
    return null;
  }

  try {
    // Get stock candles
    const to = Math.floor(Date.now() / 1000);
    const from = to - (365 * 24 * 60 * 60); // 1 year ago
    
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.s === 'ok' && data.t && data.c) {
      const result = {
        meta: { 
          regularMarketPrice: data.c[0],
          fiftyTwoWeekHigh: Math.max(...data.h),
          fiftyTwoWeekLow: Math.min(...data.l),
        },
        timestamp: data.t,
        indicators: {
          quote: [{
            close: data.c,
            high: data.h,
            low: data.l
          }]
        }
      };
      return result;
    }
  } catch (e) {
    console.warn('[API] Finnhub error:', e.message);
  }
  return null;
}

// Marketstack API
async function fetchMarketstack(symbol) {
  const apiKey = process.env.MARKETSTACK_API_KEY;
  if (!apiKey) {
    console.log('[API] Marketstack: No API key configured');
    return null;
  }

  try {
    const url = `http://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=${symbol}&limit=365`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const sortedData = data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const result = {
        meta: { 
          regularMarketPrice: sortedData[0].close,
          fiftyTwoWeekHigh: Math.max(...sortedData.map(d => d.high)),
          fiftyTwoWeekLow: Math.min(...sortedData.map(d => d.low)),
        },
        timestamp: sortedData.map(d => new Date(d.date).getTime() / 1000),
        indicators: {
          quote: [{
            close: sortedData.map(d => d.close),
            high: sortedData.map(d => d.high),
            low: sortedData.map(d => d.low)
          }]
        }
      };
      return result;
    }
  } catch (e) {
    console.warn('[API] Marketstack error:', e.message);
  }
  return null;
}

// Alpaca API (for market data)
async function fetchAlpaca(symbol) {
  const apiKey = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.log('[API] Alpaca: No API key configured');
    return null;
  }

  try {
    const url = `https://data.alpaca.markets/v2/stocks/${symbol}/bars?start=${new Date(Date.now() - 365*24*60*60*1000).toISOString()}&end=${new Date().toISOString()}&timeframe=1Day`;
    const response = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.bars && data.bars.length > 0) {
        const result = {
          meta: { 
            regularMarketPrice: data.bars[0].close,
            fiftyTwoWeekHigh: Math.max(...data.bars.map(d => d.high)),
            fiftyTwoWeekLow: Math.min(...data.bars.map(d => d.low)),
          },
          timestamp: data.bars.map(d => new Date(d.t).getTime() / 1000),
          indicators: {
            quote: [{
              close: data.bars.map(d => d.close),
              high: data.bars.map(d => d.high),
              low: data.bars.map(d => d.low)
            }]
          }
        };
        return result;
      }
    }
  } catch (e) {
    console.warn('[API] Alpaca error:', e.message);
  }
  return null;
}

// iTick API (Free tier available)
async function fetchITick(symbol) {
  try {
    const url = `https://api.itick.tech/stock/${symbol.toUpperCase()}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const quotes = data.data;
        const result = {
          meta: { 
            regularMarketPrice: quotes[0].close,
            fiftyTwoWeekHigh: Math.max(...quotes.map(q => q.high)),
            fiftyTwoWeekLow: Math.min(...quotes.map(q => q.low)),
          },
          timestamp: quotes.map(q => new Date(q.time).getTime() / 1000),
          indicators: {
            quote: [{
              close: quotes.map(q => q.close),
              high: quotes.map(q => q.high),
              low: quotes.map(q => q.low)
            }]
          }
        };
        return result;
      }
    }
  } catch (e) {
    console.warn('[API] iTick error:', e.message);
  }
  return null;
}

// Helper: Calculate Simple Moving Average
const calculateSMA = (data, period) => {
  if (!data || data.length < period) return null;
  const slice = data.slice(0, period);
  const sum = slice.reduce((acc, curr) => acc + (curr.close || 0), 0);
  return sum / period;
};

// Helper: Calculate Relative Strength (RS) Score (Simplified)
const calculateRS = (currentPrice, history) => {
  if (!history || history.length < 252) return 50; 
  
  const p3m = history[63]?.close || currentPrice;
  const p6m = history[126]?.close || currentPrice;
  const p9m = history[189]?.close || currentPrice;
  const p12m = history[252]?.close || currentPrice;

  const r3m = ((currentPrice - p3m) / p3m) * 0.4;
  const r6m = ((currentPrice - p6m) / p6m) * 0.2;
  const r9m = ((currentPrice - p9m) / p9m) * 0.2;
  const r12m = ((currentPrice - p12m) / p12m) * 0.2;

  const rawScore = (r3m + r6m + r9m + r12m) * 100;
  return Math.min(99, Math.max(1, Math.round(50 + rawScore * 2))); 
};

export default async function handler(req, res) {
  const { ticker, source } = req.query;
  const symbol = ticker ? ticker.toUpperCase() : null;

  console.log(`[API] Analyzing ticker: ${symbol}, requested source: ${source || 'auto'}`);

  if (!symbol) {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  try {
    let result;

    // If specific source requested
    if (source) {
      switch (source.toLowerCase()) {
        case 'yahoo':
          result = await fetchYahooFinance(symbol);
          break;
        case 'alphavantage':
          result = await fetchAlphaVantage(symbol);
          break;
        case 'finnhub':
          result = await fetchFinnhub(symbol);
          break;
        case 'marketstack':
          result = await fetchMarketstack(symbol);
          break;
        case 'alpaca':
          result = await fetchAlpaca(symbol);
          break;
        case 'itick':
          result = await fetchITick(symbol);
          break;
        default:
          result = await getStockDataWithCache(symbol);
      }
    } else {
      // Auto-select best available source
      result = await getStockDataWithCache(symbol);
    }

    if (!result) {
      console.error(`[API] All data sources failed for ${symbol}`);
      return res.status(503).json({ 
        error: 'Unable to fetch stock data. All sources failed.',
        sources: ['Yahoo Finance', 'Alpha Vantage', 'Finnhub', 'Marketstack', 'iTick']
      });
    }

    const quote = result.meta;
    const timestamps = result.timestamp;
    const indicators = result.indicators.quote[0];
    
    // Construct simplified history array { date, close, high, low }
    const history = [];
    if (timestamps && indicators.close) {
        for (let i = timestamps.length - 1; i >= 0; i--) {
            if (indicators.close[i] !== null) {
                history.push({
                    date: new Date(timestamps[i] * 1000),
                    close: indicators.close[i],
                    high: indicators.high[i],
                    low: indicators.low[i]
                });
            }
        }
    }

    if (history.length < 50) {
        return res.status(400).json({ error: 'Not enough historical data' });
    }

    const currentPrice = quote.regularMarketPrice || history[0].close;
    
    // MA Calculations
    const ma50 = calculateSMA(history, 50) || currentPrice;
    const ma150 = calculateSMA(history, 150) || currentPrice;
    const ma200 = calculateSMA(history, 200) || currentPrice;
    
    // 52-Week High/Low
    let yearHigh = quote.fiftyTwoWeekHigh;
    let yearLow = quote.fiftyTwoWeekLow;

    if (!yearHigh || !yearLow) {
        const lastYear = history.slice(0, Math.min(252, history.length));
        yearHigh = Math.max(...lastYear.map(d => d.high));
        yearLow = Math.min(...lastYear.map(d => d.low));
    }
    
    // RS Rating
    const rsRating = calculateRS(currentPrice, history);

    // SEPA Criteria Logic
    const criteria = {
      priceAbove200MA: currentPrice > ma200,
      ma150Above200MA: ma150 > ma200,
      ma200TrendingUp: ma200 > (calculateSMA(history.slice(20), 200) || ma200),
      priceAbove50MA: currentPrice > ma50,
      priceAboveLow25: currentPrice > (yearLow * 1.25),
      priceNearHigh25: currentPrice > (yearHigh * 0.75), 
      rsRatingAbove70: rsRating >= 70,
      earningsGrowth: false
    };

    // Determine data source
    const dataSource = result._source || 'Yahoo Finance';

    res.status(200).json({
      symbol,
      price: currentPrice,
      stats: {
        ma50,
        ma150,
        ma200,
        yearHigh,
        yearLow,
        rsRating
      },
      criteria,
      dataSource
    });

  } catch (error) {
    console.error('[API] Fetch Error:', error);
    res.status(500).json({ error: error.message || 'Server Error' });
  }
}
