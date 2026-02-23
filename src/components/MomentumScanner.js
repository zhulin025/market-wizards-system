import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function MomentumScanner({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [tickers, setTickers] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const labels = t || {
    momentumScanner: "Momentum Scanner",
    enterTickers: "Enter tickers (comma separated)",
    scan: "Scan",
    scanning: "Scanning...",
    noResults: "No results yet",
    strength: "Strength",
    trend: "Trend",
    volume: "Volume",
    score: "Score",
    price: "Price",
    change: "Change",
  };

  const scanTickers = async () => {
    if (!tickers.trim()) return;
    
    const tickerList = tickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
    if (tickerList.length === 0) return;
    
    setLoading(true);
    setError('');
    setResults([]);
    
    const scanResults = [];
    
    for (const ticker of tickerList) {
      try {
        const res = await fetch(`/api/analyze?ticker=${ticker}`);
        const data = await res.json();
        
        if (res.ok) {
          // Calculate momentum score
          let score = 0;
          const checks = [];
          
          if (data.criteria.priceAbove200MA) { score += 20; checks.push('P>200MA'); }
          if (data.criteria.ma150Above200MA) { score += 15; checks.push('MA150>200'); }
          if (data.criteria.ma200TrendingUp) { score += 10; checks.push('MA200↑'); }
          if (data.criteria.priceAbove50MA) { score += 15; checks.push('P>50MA'); }
          if (data.criteria.priceAboveLow25) { score += 10; checks.push('>25%↑'); }
          if (data.criteria.priceNearHigh25) { score += 10; checks.push('<25%↓'); }
          if (data.criteria.rsRatingAbove70) { score += 20; checks.push('RS>70'); }
          
          const change = ((data.price - data.stats.yearLow) / (data.stats.yearHigh - data.stats.yearLow) * 100);
          
          scanResults.push({
            ticker,
            score,
            price: data.price,
            change: change.toFixed(1),
            rsRating: data.stats.rsRating,
            yearHigh: data.stats.yearHigh,
            yearLow: data.stats.yearLow,
            checks,
            status: score >= 70 ? 'HOT' : score >= 50 ? 'WARM' : 'COLD'
          });
        }
      } catch (e) {
        console.error(`Error scanning ${ticker}:`, e);
      }
    }
    
    // Sort by score
    scanResults.sort((a, b) => b.score - a.score);
    setResults(scanResults);
    setLoading(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-rose-400">🔥 {labels.momentumScanner}</h2>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">{labels.enterTickers}</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={tickers}
            onChange={(e) => setTickers(e.target.value.toUpperCase())}
            placeholder="AAPL, MSFT, GOOGL, NVDA, TSLA..."
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button 
            onClick={scanTickers}
            disabled={loading}
            className={`px-6 py-2 rounded font-bold text-white transition ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'}`}
          >
            {loading ? labels.scanning : labels.scan}
          </button>
        </div>
      </div>
      
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-900 text-gray-400 uppercase font-medium">
              <tr>
                <th className="px-3 py-2">{labels.ticker}</th>
                <th className="px-3 py-2">{labels.score}</th>
                <th className="px-3 py-2">{labels.price}</th>
                <th className="px-3 py-2">{labels.change}</th>
                <th className="px-3 py-2">RS</th>
                <th className="px-3 py-2">52W</th>
                <th className="px-3 py-2">Checks</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-3 py-2">
                    <span className="font-bold text-white">{r.ticker}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                      r.status === 'HOT' ? 'bg-red-500 text-white' :
                      r.status === 'WARM' ? 'bg-yellow-500 text-black' :
                      'bg-gray-500 text-white'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-700 rounded overflow-hidden">
                        <div 
                          className={`h-full ${r.score >= 70 ? 'bg-green-500' : r.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${r.score}%` }}
                        />
                      </div>
                      <span className="font-bold text-white">{r.score}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white">${r.price?.toFixed(2)}</td>
                  <td className={`px-3 py-2 font-bold ${Number(r.change) > 50 ? 'text-green-400' : 'text-gray-400'}`}>
                    {r.change}%
                  </td>
                  <td className="px-3 py-2">
                    <span className={`font-bold ${r.rsRating >= 70 ? 'text-green-400' : r.rsRating >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {r.rsRating}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-400">
                    <span className="text-green-400">{r.yearHigh?.toFixed(0)}</span>
                    {' / '}
                    <span className="text-red-400">{r.yearLow?.toFixed(0)}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.checks.map((c, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {results.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-8">{isZh ? '输入股票代码开始扫描...' : 'Enter tickers above to start scanning...'}</p>
      )}
    </div>
  );
}
