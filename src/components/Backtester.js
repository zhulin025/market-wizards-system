import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function Backtester({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [config, setConfig] = useState({
    initialCapital: 100000,
    riskPercent: 1,
    stopLoss: 7,
    targetR: 3,
    maxPositions: 5,
  });
  
  const [trades, setTrades] = useState('');
  const [results, setResults] = useState(null);

  const labels = t || {
    backtester: "Backtester",
    initialCapital: "Initial Capital ($)",
    riskPercent: "Risk per Trade (%)",
    stopLoss: "Stop Loss (%)",
    targetR: "Target R-Multiple",
    maxPositions: "Max Positions",
    runBacktest: "Run Backtest",
    clearResults: "Clear",
  };

  const runBacktest = () => {
    // Parse trades: Ticker, Entry, Exit, Date
    const lines = trades.trim().split('\n');
    const parsedTrades = [];
    
    for (const line of lines) {
      const parts = line.split(/[,;\t]/);
      if (parts.length >= 3) {
        const ticker = parts[0].trim().toUpperCase();
        const entry = parseFloat(parts[1]);
        const exit = parseFloat(parts[2]);
        
        if (!isNaN(entry) && !isNaN(exit) && entry > 0) {
          const pnl = exit - entry;
          const pnlPercent = (pnl / entry) * 100;
          const rMultiple = pnlPercent / config.stopLoss;
          
          parsedTrades.push({
            ticker,
            entry,
            exit,
            pnl,
            pnlPercent,
            rMultiple,
            win: pnl > 0,
          });
        }
      }
    }
    
    if (parsedTrades.length === 0) {
      setResults({ error: isZh ? '无法解析交易数据' : 'Unable to parse trade data' });
      return;
    }
    
    // Simulate trading
    let capital = config.initialCapital;
    const tradeResults = [];
    let wins = 0;
    let totalR = 0;
    
    for (const trade of parsedTrades) {
      const positionSize = (capital * (config.riskPercent / 100)) / (config.stopLoss / 100);
      const shares = Math.floor(positionSize / trade.entry);
      const actualPnl = shares * trade.pnl;
      
      capital += actualPnl;
      totalR += trade.rMultiple;
      
      if (trade.win) wins++;
      
      tradeResults.push({
        ...trade,
        shares,
        positionSize,
        actualPnl,
        capitalAfter: capital,
      });
    }
    
    const winRate = (wins / parsedTrades.length) * 100;
    const avgR = totalR / parsedTrades.length;
    const totalReturn = ((capital - config.initialCapital) / config.initialCapital) * 100;
    const maxDrawdown = calculateMaxDrawdown(tradeResults);
    
    setResults({
      trades: tradeResults,
      summary: {
        initialCapital: config.initialCapital,
        finalCapital: capital,
        totalReturn,
        totalTrades: parsedTrades.length,
        winRate,
        avgR,
        maxDrawdown,
        profitFactor: calculateProfitFactor(tradeResults),
      }
    });
  };

  const calculateMaxDrawdown = (trades) => {
    let peak = config.initialCapital;
    let maxDD = 0;
    
    for (const trade of trades) {
      if (trade.capitalAfter > peak) peak = trade.capitalAfter;
      const dd = (peak - trade.capitalAfter) / peak;
      if (dd > maxDD) maxDD = dd;
    }
    
    return maxDD * 100;
  };

  const calculateProfitFactor = (trades) => {
    let grossProfit = 0;
    let grossLoss = 0;
    
    for (const trade of trades) {
      if (trade.actualPnl > 0) grossProfit += trade.actualPnl;
      else grossLoss += Math.abs(trade.actualPnl);
    }
    
    return grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : '∞';
  };

  const clearResults = () => {
    setResults(null);
    setTrades('');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-amber-400">📊 {labels.backtester}</h2>
      
      {/* Config */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">{labels.initialCapital}</label>
          <input 
            type="number" 
            value={config.initialCapital}
            onChange={(e) => setConfig({...config, initialCapital: Number(e.target.value)})}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">{labels.riskPercent}</label>
          <input 
            type="number" 
            value={config.riskPercent}
            onChange={(e) => setConfig({...config, riskPercent: Number(e.target.value)})}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">{labels.stopLoss}</label>
          <input 
            type="number" 
            value={config.stopLoss}
            onChange={(e) => setConfig({...config, stopLoss: Number(e.target.value)})}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">{labels.targetR}</label>
          <input 
            type="number" 
            value={config.targetR}
            onChange={(e) => setConfig({...config, targetR: Number(e.target.value)})}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">{labels.maxPositions}</label>
          <input 
            type="number" 
            value={config.maxPositions}
            onChange={(e) => setConfig({...config, maxPositions: Number(e.target.value)})}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
          />
        </div>
      </div>
      
      {/* Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          {isZh ? '交易记录 (格式: 股票代码, 买入价, 卖出价)' : 'Trade History (Format: Ticker, Entry, Exit)'}
        </label>
        <textarea 
          value={trades}
          onChange={(e) => setTrades(e.target.value)}
          placeholder={isZh ? 'AAPL, 150, 165\nMSFT, 280, 295\nTSLA, 200, 180\n...' : 'AAPL, 150, 165\nMSFT, 280, 295\nTSLA, 200, 180\n...'}
          className="w-full h-32 bg-gray-700 text-white px-3 py-2 rounded font-mono text-xs"
        />
      </div>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={runBacktest}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded"
        >
          {labels.runBacktest}
        </button>
        <button 
          onClick={clearResults}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          {labels.clearResults}
        </button>
      </div>
      
      {/* Results */}
      {results && (
        <div>
          {results.error ? (
            <p className="text-red-400">{results.error}</p>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">{isZh ? '初始资金' : 'Initial'}</div>
                  <div className="text-lg font-bold text-white">${results.summary.initialCapital.toLocaleString()}</div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">{isZh ? '最终资金' : 'Final'}</div>
                  <div className={`text-lg font-bold ${results.summary.finalCapital >= results.summary.initialCapital ? 'text-green-400' : 'text-red-400'}`}>
                    ${results.summary.finalCapital.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">{isZh ? '总收益' : 'Return'}</div>
                  <div className={`text-lg font-bold ${results.summary.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.summary.totalReturn.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">{isZh ? '胜率' : 'Win Rate'}</div>
                  <div className={`text-lg font-bold ${results.summary.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.summary.winRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">{isZh ? '平均R' : 'Avg R'}</div>
                  <div className={`text-lg font-bold ${results.summary.avgR >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.summary.avgR.toFixed(2)}R
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">{isZh ? '最大回撤' : 'Max DD'}</div>
                  <div className="text-lg font-bold text-red-400">{results.summary.maxDrawdown.toFixed(1)}%</div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">{isZh ? '盈亏比' : 'Profit Factor'}</div>
                  <div className="text-lg font-bold text-white">{results.summary.profitFactor}</div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">{isZh ? '交易次数' : 'Trades'}</div>
                  <div className="text-lg font-bold text-white">{results.summary.totalTrades}</div>
                </div>
              </div>
              
              {/* Trade List */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-gray-900 text-gray-400 uppercase">
                    <tr>
                      <th className="px-2 py-1">#</th>
                      <th className="px-2 py-1">{isZh ? '股票' : 'Ticker'}</th>
                      <th className="px-2 py-1">{isZh ? '买入' : 'Entry'}</th>
                      <th className="px-2 py-1">{isZh ? '卖出' : 'Exit'}</th>
                      <th className="px-2 py-1">{isZh ? '收益%' : 'P&L %'}</th>
                      <th className="px-2 py-1">R</th>
                      <th className="px-2 py-1">{isZh ? '股数' : 'Shares'}</th>
                      <th className="px-2 py-1">{isZh ? '金额' : 'P&L $'}</th>
                      <th className="px-2 py-1">{isZh ? '资金' : 'Capital'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.trades.map((trade, i) => (
                      <tr key={i} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                        <td className="px-2 py-1 font-bold text-white">{trade.ticker}</td>
                        <td className="px-2 py-1">${trade.entry}</td>
                        <td className="px-2 py-1">${trade.exit}</td>
                        <td className={`px-2 py-1 font-bold ${trade.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.pnlPercent.toFixed(1)}%
                        </td>
                        <td className={`px-2 py-1 font-bold ${trade.rMultiple >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.rMultiple.toFixed(2)}R
                        </td>
                        <td className="px-2 py-1">{trade.shares}</td>
                        <td className={`px-2 py-1 font-bold ${trade.actualPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${trade.actualPnl.toFixed(0)}
                        </td>
                        <td className="px-2 py-1 text-white">${trade.capitalAfter.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
