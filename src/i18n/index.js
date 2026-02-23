// src/i18n/index.js (更新以包含默认导出)

// 中文语言包
export const zh = {
  title: "市场巫师 AI 交易系统",
  // Header
  dashboard: "仪表盘",
  screener: "筛选器",
  journal: "交易日志",
  status: "状态",
  live: "实盘",

  // Screener
  sepaScreener: "SEPA 智能筛选器",
  enterTicker: "股票代码",
  analyze: "分析",
  score: "评分",
  
  // SEPA Criteria (Chinese)
  criteria: {
    priceAbove200MA: "1. 股价 > 200日均线",
    ma150Above200MA: "2. 150日均线 > 200日均线",
    ma200TrendingUp: "3. 200日均线向上",
    priceAbove50MA: "4. 股价 > 50日均线",
    priceAboveLow25: "5. 距52周低点 > 25%",
    priceNearHigh25: "6. 距52周高点 < 25%",
    rsRatingAbove70: "7. 相对强度评分 > 70",
    earningsGrowth: "8. 盈利增长（需手动）",
  },
  
  // Stats
  currentPrice: "当前价",
  rsRating: "相对强度",
  week52High: "52周最高",
  week52Low: "52周最低",

  // Quick Tips
  quickTips: "快速要点 (Minervini)",
  tips: [
    "尊重趋势。永远不要逆趋势交易。",
    "等待 VCP（波动收缩形态）形成。",
    "突破前成交量必须萎缩。",
    "在成交量放大时买入突破。",
  ],

  // Risk Calculator
  riskManagement: "风险管理 (1-2%法则)",
  accountSize: "账户规模 ($)",
  riskPerTrade: "每笔风险 (%)",
  stopLossPercent: "止损幅度 (%)",
  sharePrice: "股价 ($)",
  riskAmount: "风险金额",
  maxPositionSize: "最大仓位",
  maxShares: "最大股数",
  percentageOfAccount: "账户占比",
  highConcentration: "⚠️ 仓位过重",

  // Iron Rules
  ironRules: "铁律",
  rules: [
    "止损不可商量。",
    "快速亏损时卖出半数。",
    "不要补仓。输家补仓输得更惨。",
    "获得可观利润后保护成本价。",
  ],

  // Journal
  tradeJournal: "交易日志",
  date: "日期",
  ticker: "代码",
  entry: "买入价",
  stop: "止损价",
  exit: "卖出价",
  rMultiple: "R倍数",
  action: "操作",
  addTrade: "添加交易",
  noTrades: "暂无交易记录",

  // Footer
  footer: "基于《股票魔法师》构建 🦞",
};

// English language pack
export const en = {
  title: "Market Wizards AI System",
  // Header
  dashboard: "Dashboard",
  screener: "Screener",
  journal: "Journal",
  status: "Status",
  live: "LIVE",

  // Screener
  sepaScreener: "SEPA Screener (Auto)",
  enterTicker: "Ticker",
  analyze: "Analyze",
  score: "Score",
  
  // SEPA Criteria
  criteria: {
    priceAbove200MA: "1. Price > 200 MA",
    ma150Above200MA: "2. 150 MA > 200 MA",
    ma200TrendingUp: "3. 200 MA Trending Up",
    priceAbove50MA: "4. Price > 50 MA",
    priceAboveLow25: "5. > 25% off Low",
    priceNearHigh25: "6. < 25% off High",
    rsRatingAbove70: "7. RS Rating > 70",
    earningsGrowth: "8. Earnings Growth (Manual)",
  },
  
  // Stats
  currentPrice: "Current",
  rsRating: "RS Rating",
  week52High: "52W High",
  week52Low: "52W Low",

  // Quick Tips
  quickTips: "Quick Tips (Minervini)",
  tips: [
    "Respect the trend. Never trade against the primary trend.",
    "Wait for the VCP (Volatility Contraction Pattern).",
    "Volume must dry up before the breakout.",
    "Buy the breakout on Volume Expansion.",
  ],

  // Risk Calculator
  riskManagement: "Risk Management (1-2% Rule)",
  accountSize: "Account Size ($)",
  riskPerTrade: "Risk per Trade (%)",
  stopLossPercent: "Stop Loss (%)",
  sharePrice: "Share Price ($)",
  riskAmount: "Risk Amount",
  maxPositionSize: "Max Position Size",
  maxShares: "Max Shares",
  percentageOfAccount: "% of Account",
  highConcentration: "⚠️ High Concentration",

  // Iron Rules
  ironRules: "Iron Rules",
  rules: [
    "Stop Loss is not negotiable.",
    "Sell half if the stock moves against you fast.",
    "Don't average down. Losers average losers.",
    "Protect your breakeven once you have a decent profit.",
  ],

  // Journal
  tradeJournal: "Trade Journal",
  date: "Date",
  ticker: "Ticker",
  entry: "Entry",
  stop: "Stop",
  exit: "Exit",
  rMultiple: "R-Multiple",
  action: "Action",
  addTrade: "Add Trade",
  noTrades: "No trades recorded yet.",

  // Footer
  footer: "Based on 'Trade Like a Stock Market Wizard' 🦞",
};
