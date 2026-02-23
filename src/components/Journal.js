import React, { useState, useEffect } from 'react';

export default function Journal({ t }) {
  const labels = t || {
    tradeJournal: "Trade Journal",
    ticker: "Ticker",
    date: "Date",
    entry: "Entry",
    stop: "Stop",
    exit: "Exit",
    rMultiple: "R-Multiple",
    action: "Action",
    addTrade: "Add Trade",
    noTrades: "No trades recorded yet.",
  };

  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState({
    ticker: '',
    date: new Date().toISOString().split('T')[0],
    entryPrice: '',
    stopLoss: '',
    exitPrice: '',
    notes: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('mw-journal-trades');
    if (saved) setTrades(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (trades.length > 0) {
      localStorage.setItem('mw-journal-trades', JSON.stringify(trades));
    }
  }, [trades]);

  const addTrade = () => {
    if (!form.ticker || !form.entryPrice) return;
    
    const risk = form.entryPrice - form.stopLoss;
    const reward = form.exitPrice ? form.exitPrice - form.entryPrice : 0;
    const rMultiple = risk !== 0 ? (reward / risk).toFixed(2) : 0;
    
    const newTrade = { ...form, id: Date.now(), rMultiple, risk };
    setTrades([newTrade, ...trades]);
    setForm({ ...form, ticker: '', entryPrice: '', stopLoss: '', exitPrice: '', notes: '' });
  };

  const deleteTrade = (id) => {
    setTrades(trades.filter(t => t.id !== id));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-purple-400">📝 {labels.tradeJournal}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        <input 
          placeholder={labels.ticker}
          className="bg-gray-700 text-white p-2 rounded"
          value={form.ticker}
          onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})}
        />
        <input 
          type="date"
          className="bg-gray-700 text-white p-2 rounded"
          value={form.date}
          onChange={e => setForm({...form, date: e.target.value})}
        />
        <input 
          placeholder={labels.entry}
          type="number"
          className="bg-gray-700 text-white p-2 rounded"
          value={form.entryPrice}
          onChange={e => setForm({...form, entryPrice: Number(e.target.value)})}
        />
        <input 
          placeholder={labels.stop}
          type="number"
          className="bg-gray-700 text-white p-2 rounded"
          value={form.stopLoss}
          onChange={e => setForm({...form, stopLoss: Number(e.target.value)})}
        />
        <input 
          placeholder={`${labels.exit} (Optional)`}
          type="number"
          className="bg-gray-700 text-white p-2 rounded"
          value={form.exitPrice}
          onChange={e => setForm({...form, exitPrice: Number(e.target.value)})}
        />
        <button 
          onClick={addTrade}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          {labels.addTrade}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900 text-gray-400 uppercase font-medium">
            <tr>
              <th className="px-4 py-2">{labels.date}</th>
              <th className="px-4 py-2">{labels.ticker}</th>
              <th className="px-4 py-2">{labels.entry}</th>
              <th className="px-4 py-2">{labels.stop}</th>
              <th className="px-4 py-2">{labels.exit}</th>
              <th className="px-4 py-2">{labels.rMultiple}</th>
              <th className="px-4 py-2">{labels.action}</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="px-4 py-2">{trade.date}</td>
                <td className="px-4 py-2 font-bold text-white">{trade.ticker}</td>
                <td className="px-4 py-2">{trade.entryPrice}</td>
                <td className="px-4 py-2 text-red-400">{trade.stopLoss}</td>
                <td className="px-4 py-2 text-green-400">{trade.exitPrice || '-'}</td>
                <td className={`px-4 py-2 font-bold ${Number(trade.rMultiple) >= 2 ? 'text-green-400' : Number(trade.rMultiple) < 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                  {trade.rMultiple}R
                </td>
                <td className="px-4 py-2">
                  <button onClick={() => deleteTrade(trade.id)} className="text-red-500 hover:text-red-300">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trades.length === 0 && <p className="text-center text-gray-500 mt-4">{labels.noTrades}</p>}
      </div>
    </div>
  );
}
