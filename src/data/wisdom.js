// src/data/wisdom.js
export const TRADING_WISDOM = [
  {
    author: "Mark Minervini",
    book: "Trade Like a Stock Market Wizard",
    quote: "Turnover is the truth. Volume is the fuel that drives stock prices.",
    tag: "Volume",
    category: "Technical"
  },
  {
    author: "Mark Minervini",
    book: "Think & Trade Like a Champion",
    quote: "Amateurs want to be right. Professionals want to make money.",
    tag: "Psychology",
    category: "Mindset"
  },
  {
    author: "Nicolas Darvas",
    book: "How I Made $2,000,000 in the Stock Market",
    quote: "I decided to let my stop-loss decide. I never sold a stock because it went up; I sold it because it started to go down.",
    tag: "Exit Strategy",
    category: "Risk"
  },
  {
    author: "William O'Neil",
    book: "How to Make Money in Stocks",
    quote: "The whole secret to winning big in the stock market is not to be right all the time, but to lose the least amount possible when you’re wrong.",
    tag: "Risk Management",
    category: "Risk"
  },
  {
    author: "Jesse Livermore",
    book: "Reminiscences of a Stock Operator",
    quote: "It never was my thinking that made the big money for me. It always was my sitting.",
    tag: "Patience",
    category: "Mindset"
  },
  {
    author: "Charlie Munger",
    book: "Poor Charlie's Almanack",
    quote: "It takes character to sit with all that cash and do nothing. I didn't get to where I am by going after mediocre opportunities.",
    tag: "Patience",
    category: "Philosophy"
  },
  {
    author: "Edward Thorp",
    book: "Beat the Dealer",
    quote: "The Kelly criterion maximizes the rate of growth of wealth but can lead to significant volatility. Half-Kelly is often safer.",
    tag: "Position Sizing",
    category: "Math"
  },
  {
    author: "Annie Duke",
    book: "Thinking in Bets",
    quote: "Resulting is the tendency to equate the quality of a decision with the quality of its outcome. Stop doing that.",
    tag: "Decision Quality",
    category: "Psychology"
  },
  {
    author: "Nate Silver",
    book: "The Signal and the Noise",
    quote: "The signal is the truth. The noise is what distracts us from the truth.",
    tag: "Forecasting",
    category: "Analysis"
  },
  {
    author: "Philip Tetlock",
    book: "Superforecasting",
    quote: "Forecasting is not about predicting the future. It's about updating your probability estimate as new information becomes available.",
    tag: "Bayesian",
    category: "Analysis"
  }
];

export function getRandomWisdom() {
  return TRADING_WISDOM[Math.floor(Math.random() * TRADING_WISDOM.length)];
}
