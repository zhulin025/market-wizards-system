import React, { useState } from 'react';

export default function Screener({ t }) {
  const defaultCriteria = t?.criteria || {
    priceAbove200MA: "1. Price > 200 MA",
    ma150Above200MA: "2. 150 MA > 200 MA",
    ma200TrendingUp: "3. 200 MA Trending Up",
    priceAbove50MA: "4. Price > 50 MA",
    priceAboveLow25: "5. > 25% off Low",
    priceNearHigh25: "6. < 25% off High",
    rsRatingAbove70: "7. RS Rating > 70",
    earningsGrowth: "8. Earnings Growth (Manual)",
  };

  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [dataSource, setDataSource] = useState('auto');
  const [debugInfo, setDebugInfo] = useState('');
  
  const [criteria, setCriteria] = useState({
    priceAbove200MA: false,
    ma150Above200MA: false,
    ma200TrendingUp: false,
    priceAbove50MA: false,
    priceAboveLow25: false,
    priceNearHigh25: false,
    rsRatingAbove70: false,
    earningsGrowth: false,
  });

  const analyzeTicker = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setStats(null);
    setDebugInfo(`Calling API for ${ticker}...`);

    try {
      const sourceParam = dataSource !== 'auto' ? `&source=${dataSource}` : '';
      const res = await fetch(`/api/analyze?ticker=${ticker}${sourceParam}`);
      const data = await res.json();
      
      if (res.ok) {
        setDebugInfo(`Success! Source: ${data.dataSource || 'Unknown'}`);
        setStats(data.stats); 
        setCriteria(prev => ({
          ...prev,
          priceAbove200MA: data.criteria.priceAbove200MA,
          ma150Above200MA: data.criteria.ma150Above200MA,
          ma200TrendingUp: data.criteria.ma200TrendingUp,
          priceAbove50MA: data.criteria.priceAbove50MA,
          priceAboveLow25: data.criteria.priceAboveLow25,
          priceNearHigh25: data.criteria.priceNearHigh25,
          rsRatingAbove70: data.criteria.rsRatingAbove70,
          earningsGrowth: false, 
        }));
      } else {
        const errMsg = data.error || 'Failed to analyze';
        setError(errMsg);
        setDebugInfo(`Error: ${errMsg}`);
      }
    } catch (err) {
      setError('Network/Server Error');
      setDebugInfo(`Catch: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleCriterion = (key) => {
    setCriteria(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const passedCount = Object.values(criteria).filter(Boolean).length;
  const totalCount = Object.keys(criteria).length;
  const score = (passedCount / totalCount) * 100;

  const criteriaList = [
    { key: 'priceAbove200MA', label: defaultCriteria.priceAbove200MA },
    { key: 'ma150Above200MA', label: defaultCriteria.ma150Above200MA },
    { key: 'ma200TrendingUp', label: defaultCriteria.ma200TrendingUp },
    { key: 'priceAbove50MA', label: defaultCriteria.priceAbove50MA },
    { key: 'priceAboveLow25', label: defaultCriteria.priceAboveLow25 },
    { key: 'priceNearHigh25', label: defaultCriteria.priceNearHigh25 },
    { key: 'rsRatingAbove70', label: defaultCriteria.rsRatingAbove70 },
    { key: 'earningsGrowth', label: defaultCriteria.earningsGrowth },
  ];

  const sources = [
    { id: 'auto', label: 'Auto', labelZh: '自动选择', color: 'gray' },
    { id: 'yahoo', label: 'Yahoo', labelZh: 'Yahoo', color: 'purple' },
    { id: 'alphavantage', label: 'Alpha Vantage', labelZh: 'Alpha Vantage', color: 'blue' },
    { id: 'finnhub', label: 'Finnhub', labelZh: 'Finnhub', color: 'green' },
    { id: 'marketstack', label: 'Marketstack', labelZh: 'Marketstack', color: 'orange' },
    { id: 'alpaca', label: 'Alpaca', labelZh: 'Alpaca', color: 'cyan' },
    { id: 'itick', label: 'iTick', labelZh: 'iTick', color: 'teal' },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative">
      <h2 className="text-xl font-bold mb-4 text-blue-400">🔍 {t?.sepaScreener || "SEPA Screener (Auto)"}</h2>
      
      {/* Data Source Selector */}
      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Data Source:</div>
        <div className="flex flex-wrap gap-2">
          {sources.map(s => (
            <button
              key={s.id}
              onClick={() => setDataSource(s.id)}
              className={`px-3 py-1 rounded text-xs font-bold transition ${
                dataSource === s.id 
                  ? s.id === 'auto' ? 'bg-gray-500 text-white' :
                    s.id === 'yahoo' ? 'bg-purple-500 text-white' :
                    s.id === 'alphavantage' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {s.id === 'auto' ? s.labelZh : s.labelZh}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4 flex items-center gap-2">
        <input 
          type="text" 
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder={t?.enterTicker || "Ticker"}
          className="bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24 font-bold uppercase"
          onKeyPress={(e) => e.key === 'Enter' && analyzeTicker()}
        />
        <button 
          onClick={analyzeTicker}
          disabled={loading}
          className={`px-4 py-2 rounded font-bold text-white transition ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? '⏳' : (t?.analyze || 'Analyze')}
        </button>
        <div className={`px-3 py-2 rounded font-bold ml-auto ${score === 100 ? 'bg-green-500 text-black' : score >= 80 ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>
          {t?.score || 'Score'}: {score.toFixed(0)}%
        </div>
      </div>

      {error && <p className="text-red-400 text-xs mb-2 bg-red-900/20 p-2 rounded border border-red-500/50 font-mono">{error}</p>}
      {debugInfo && !error && <p className="text-gray-500 text-xs mb-2 font-mono">{debugInfo}</p>}

      {stats && (
        <div className="mb-4 p-3 bg-gray-900/50 rounded text-xs grid grid-cols-2 gap-2 text-gray-400 font-mono border border-gray-700">
          <div>{t?.rsRating || 'RS Rating'}: <span className="text-yellow-400 font-bold">{stats.rsRating}</span></div>
          <div>{t?.currentPrice || 'Current'}: <span className="text-white font-bold">{stats.price?.toFixed(2)}</span></div>
          <div>50 MA: <span className="text-white">{stats.ma50?.toFixed(2)}</span></div>
          <div>150 MA: <span className="text-white">{stats.ma150?.toFixed(2)}</span></div>
          <div>200 MA: <span className="text-white">{stats.ma200?.toFixed(2)}</span></div>
          <div>{t?.week52High || '52W High'}: <span className="text-white">{stats.yearHigh?.toFixed(2)}</span></div>
          <div>{t?.week52Low || '52W Low'}: <span className="text-white">{stats.yearLow?.toFixed(2)}</span></div>
        </div>
      )}

      <div className="space-y-2">
        {criteriaList.map((item) => (
          <label key={item.key} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-700 rounded transition group">
            <input 
              type="checkbox" 
              checked={criteria[item.key]}
              onChange={() => toggleCriterion(item.key)}
              className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
            />
            <span className={`text-sm flex-1 transition ${criteria[item.key] ? 'text-white font-medium' : 'text-gray-500'}`}>
              {item.label}
            </span>
            {criteria[item.key] && <span className="text-green-400 text-xs font-bold">PASS</span>}
          </label>
        ))}
      </div>
    </div>
  );
}
