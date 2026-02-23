import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

export default function PositionManager({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const labels = t || {
    positionManager: "Position Manager",
    symbol: "Symbol",
    shares: "Shares",
    avgCost: "Avg Cost",
    currentPrice: "Current",
    marketValue: "Market Value",
    profitLoss: "P/L",
    gainLoss: "Gain %",
    stopLoss: "Stop",
    targetPrice: "Target",
    notes: "Notes",
    addPosition: "Add Position",
    totalValue: "Total Value",
    totalGainLoss: "Total P/L",
  };

  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState({
    ticker: '',
    shares: '',
    avgCost: '',
    currentPrice: '',
    stopLoss: '',
    targetPrice: '',
    notes: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('mw-positions');
    if (saved) setPositions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (positions.length > 0) {
      localStorage.setItem('mw-positions', JSON.stringify(positions));
    }
  }, [positions]);

  const addPosition = () => {
    if (!form.ticker || !form.shares || !form.avgCost) return;
    
    const shares = Number(form.shares);
    const avgCost = Number(form.avgCost);
    const currentPrice = Number(form.currentPrice) || avgCost;
    const marketValue = shares * currentPrice;
    const costBasis = shares * avgCost;
    const profitLoss = marketValue - costBasis;
    const gainLoss = ((profitLoss / costBasis) * 100);
    
    const newPosition = { 
      ...form, 
      id: Date.now(), 
      shares,
      avgCost,
      currentPrice,
      marketValue,
      profitLoss,
      gainLoss,
    };
    
    setPositions([...positions, newPosition]);
    setForm({ ticker: '', shares: '', avgCost: '', currentPrice: '', stopLoss: '', targetPrice: '', notes: '' });
  };

  const deletePosition = (id) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  const totalValue = positions.reduce((sum, p) => sum + (p.shares * (p.currentPrice || p.avgCost)), 0);
  const totalCost = positions.reduce((sum, p) => sum + (p.shares * p.avgCost), 0);
  const totalPL = totalValue - totalCost;
  const totalGain = totalCost > 0 ? ((totalPL / totalCost) * 100) : 0;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-indigo-400">💼 {labels.positionManager}</h2>
      
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <div className="text-sm text-gray-400">{labels.totalValue}</div>
          <div className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <div className="text-sm text-gray-400">{labels.totalGainLoss}</div>
          <div className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${totalPL.toLocaleString()} ({totalGain.toFixed(1)}%)
          </div>
        </div>
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <div className="text-sm text-gray-400">{isZh ? '持仓数' : 'Positions'}</div>
          <div className="text-2xl font-bold text-white">{positions.length}</div>
        </div>
      </div>

      {/* Add Form */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <input 
          placeholder={labels.symbol}
          className="bg-gray-700 text-white p-2 rounded"
          value={form.ticker}
          onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})}
        />
        <input 
          placeholder={labels.shares}
          type="number"
          className="bg-gray-700 text-white p-2 rounded"
          value={form.shares}
          onChange={e => setForm({...form, shares: e.target.value})}
        />
        <input 
          placeholder={labels.avgCost}
          type="number"
          className="bg-gray-700 text-white p-2 rounded"
          value={form.avgCost}
          onChange={e => setForm({...form, avgCost: e.target.value})}
        />
        <input 
          placeholder={`${labels.currentPrice} (${isZh ? '可选' : 'Optional'})`}
          type="number"
          className="bg-gray-700 text-white p-2 rounded"
          value={form.currentPrice}
          onChange={e => setForm({...form, currentPrice: e.target.value})}
        />
        <input 
          placeholder={labels.stopLoss}
          type="number"
          className="bg-gray-700 text-white p-2 rounded"
          value={form.stopLoss}
          onChange={e => setForm({...form, stopLoss: e.target.value})}
        />
        <input 
          placeholder={labels.targetPrice}
          type="number"
          className="bg-gray-700 text-white p-2 rounded"
          value={form.targetPrice}
          onChange={e => setForm({...form, targetPrice: e.target.value})}
        />
        <input 
          placeholder={labels.notes}
          className="bg-gray-700 text-white p-2 rounded"
          value={form.notes}
          onChange={e => setForm({...form, notes: e.target.value})}
        />
        <button 
          onClick={addPosition}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          {labels.addPosition}
        </button>
      </div>

      {/* Positions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900 text-gray-400 uppercase font-medium">
            <tr>
              <th className="px-3 py-2">{labels.symbol}</th>
              <th className="px-3 py-2">{labels.shares}</th>
              <th className="px-3 py-2">{labels.avgCost}</th>
              <th className="px-3 py-2">{labels.currentPrice}</th>
              <th className="px-3 py-2">{labels.marketValue}</th>
              <th className="px-3 py-2">{labels.profitLoss}</th>
              <th className="px-3 py-2">{labels.gainLoss}</th>
              <th className="px-3 py-2">{labels.stopLoss}</th>
              <th className="px-3 py-2">{labels.targetPrice}</th>
              <th className="px-3 py-2">{labels.action}</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => (
              <tr key={pos.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="px-3 py-2 font-bold text-white">{pos.ticker}</td>
                <td className="px-3 py-2">{pos.shares}</td>
                <td className="px-3 py-2">${pos.avgCost}</td>
                <td className="px-3 py-2">${pos.currentPrice?.toFixed(2) || '-'}</td>
                <td className="px-3 py-2">${pos.marketValue?.toFixed(0) || '-'}</td>
                <td className={`px-3 py-2 font-bold ${pos.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${pos.profitLoss?.toFixed(0) || '-'}
                </td>
                <td className={`px-3 py-2 font-bold ${pos.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pos.gainLoss?.toFixed(1) || '-'}%
                </td>
                <td className="px-3 py-2 text-red-400">${pos.stopLoss || '-'}</td>
                <td className="px-3 py-2 text-green-400">${pos.targetPrice || '-'}</td>
                <td className="px-3 py-2">
                  <button onClick={() => deletePosition(pos.id)} className="text-red-500 hover:text-red-300">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {positions.length === 0 && <p className="text-center text-gray-500 mt-4">{isZh ? '暂无持仓' : 'No positions yet.'}</p>}
      </div>
    </div>
  );
}
