// src/components/Journal.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from './LanguageProvider';

export default function Journal() {
  const { t, locale } = useTranslation();
  const [trades, setTrades] = useState([]);
  
  // Form State
  const [ticker, setTicker] = useState('');
  const [entry, setEntry] = useState('');
  const [stop, setStop] = useState('');
  const [exit, setExit] = useState('');
  const [date, setDate] = useState('');
  const [decisionQuality, setDecisionQuality] = useState(3); // 1-5 Stars (Annie Duke)

  // Load trades from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('market_wizards_journal');
    if (saved) {
      setTrades(JSON.parse(saved));
    }
  }, []);

  const addTrade = () => {
    if (!ticker || !entry || !stop) return;

    const risk = Math.abs(entry - stop);
    const reward = exit ? (exit - entry) : 0;
    const rMultiple = exit ? (reward / risk).toFixed(2) : 'Open';

    const newTrade = {
      id: Date.now(),
      date: date || new Date().toISOString().split('T')[0],
      ticker: ticker.toUpperCase(),
      entry,
      stop,
      exit,
      rMultiple,
      decisionQuality
    };

    const updated = [newTrade, ...trades];
    setTrades(updated);
    localStorage.setItem('market_wizards_journal', JSON.stringify(updated));
    
    // Reset form
    setTicker('');
    setEntry('');
    setStop('');
    setExit('');
    setDecisionQuality(3);
  };

  const deleteTrade = (id) => {
    const updated = trades.filter(t => t.id !== id);
    setTrades(updated);
    localStorage.setItem('market_wizards_journal', JSON.stringify(updated));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
      <h3 className="text-xl font-bold mb-4 text-purple-400">📝 {t('tradeJournal')}</h3>
      
      {/* Input Form */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4 items-end">
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-gray-700 text-white px-2 py-2 rounded text-sm"
        />
        <input 
          type="text" 
          placeholder={t('ticker')}
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          className="bg-gray-700 text-white px-3 py-2 rounded text-sm uppercase font-bold"
        />
        <input 
          type="number" 
          placeholder={t('entry')}
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          className="bg-gray-700 text-white px-3 py-2 rounded text-sm"
        />
        <input 
          type="number" 
          placeholder={t('stop')}
          value={stop}
          onChange={(e) => setStop(e.target.value)}
          className="bg-gray-700 text-white px-3 py-2 rounded text-sm"
        />
        <input 
          type="number" 
          placeholder={t('exit')}
          value={exit}
          onChange={(e) => setExit(e.target.value)}
          className="bg-gray-700 text-white px-3 py-2 rounded text-sm"
        />
        
        {/* Decision Quality (Annie Duke) */}
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-400 mb-1">
            {locale === 'zh' ? '决策质量 (非结果)' : 'Decision Quality'}
          </label>
          <select 
            value={decisionQuality} 
            onChange={(e) => setDecisionQuality(Number(e.target.value))}
            className="bg-gray-700 text-yellow-400 px-2 py-2 rounded text-sm"
          >
            <option value="5">⭐⭐⭐⭐⭐ (Perfect Process)</option>
            <option value="4">⭐⭐⭐⭐ (Good)</option>
            <option value="3">⭐⭐⭐ (Average)</option>
            <option value="2">⭐⭐ (Bad Process)</option>
            <option value="1">⭐ (Tilt/FOMO)</option>
          </select>
        </div>
      </div>
      
      <button 
        onClick={addTrade}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-6 transition-colors"
      >
        {t('addTrade')}
      </button>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-gray-700">
              <th className="p-2">{t('date')}</th>
              <th className="p-2">{t('ticker')}</th>
              <th className="p-2">{t('entry')}</th>
              <th className="p-2">{t('stop')}</th>
              <th className="p-2">{t('exit')}</th>
              <th className="p-2">{t('rMultiple')}</th>
              <th className="p-2">{locale === 'zh' ? '决策' : 'Quality'}</th>
              <th className="p-2">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {trades.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500 italic">
                  {t('noTrades')}
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="p-2 text-gray-400">{trade.date}</td>
                  <td className="p-2 font-bold text-blue-300">{trade.ticker}</td>
                  <td className="p-2">${trade.entry}</td>
                  <td className="p-2 text-red-400">${trade.stop}</td>
                  <td className="p-2 text-green-400">{trade.exit ? `$${trade.exit}` : '-'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.rMultiple >= 3 ? 'bg-green-900 text-green-300' :
                      trade.rMultiple >= 1 ? 'bg-blue-900 text-blue-300' :
                      trade.rMultiple < 0 ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {trade.rMultiple}R
                    </span>
                  </td>
                  <td className="p-2 text-yellow-500 text-xs">
                    {'★'.repeat(trade.decisionQuality)}
                  </td>
                  <td className="p-2">
                    <button 
                      onClick={() => deleteTrade(trade.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 border-t border-gray-700 pt-2 text-center">
        💡 Annie Duke: "Resulting" is judging a decision by its outcome. Judge by the process (Stars).
      </div>
    </div>
  );
}
