import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function VCPDetector({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [priceData, setPriceData] = useState('');
  const [result, setResult] = useState(null);

  const parseData = () => {
    // Format: Date,Open,High,Low,Close,Volume (CSV-like)
    const lines = priceData.trim().split('\n');
    const data = [];
    
    for (const line of lines) {
      const parts = line.split(/[,;\t]/);
      if (parts.length >= 5) {
        const close = parseFloat(parts[4] || parts[3]);
        const high = parseFloat(parts[2]);
        const low = parseFloat(parts[3]);
        if (!isNaN(close)) {
          data.push({ close, high, low });
        }
      }
    }
    
    if (data.length < 20) {
      setResult({ error: isZh ? '数据不足，至少需要20条' : 'Not enough data, need at least 20 bars' });
      return;
    }
    
    // Detect VCP patterns
    const contractions = [];
    for (let i = 1; i < data.length; i++) {
      const peak = Math.max(...data.slice(i - 5, i).map(d => d.high));
      const trough = Math.min(...data.slice(i - 5, i).map(d => d.low));
      const range = peak - trough;
      const currentRange = data[i].high - data[i].low;
      
      if (currentRange < range * 0.5) { // 50% or less of average range
        contractions.push({
          index: i,
          range: currentRange,
          pctOfAvg: (currentRange / range * 100).toFixed(1)
        });
      }
    }
    
    setResult({
      contractions,
      hasVCP: contractions.length >= 2,
      strength: contractions.length >= 3 ? 'STRONG' : contractions.length >= 2 ? 'MODERATE' : 'WEAK'
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-orange-400">📊 {isZh ? 'VCP 形态检测' : 'VCP Pattern Detector'}</h2>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          {isZh ? '粘贴价格数据 (CSV格式: Date,Open,High,Low,Close,Volume)' : 'Paste price data (CSV: Date,Open,High,Low,Close,Volume)'}
        </label>
        <textarea 
          value={priceData}
          onChange={(e) => setPriceData(e.target.value)}
          placeholder={isZh ? '2024-01-01,100,105,99,103,1000000\n2024-01-02,103,107,101,106,1200000...' : '2024-01-01,100,105,99,103,1000000\n2024-01-02,103,107,101,106,1200000...'}
          className="w-full h-32 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xs"
        />
      </div>
      
      <button 
        onClick={parseData}
        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
      >
        {isZh ? '检测 VCP' : 'Detect VCP'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-700">
          {result.error ? (
            <p className="text-red-400">{result.error}</p>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-4">
                <span className={`text-2xl font-bold ${result.hasVCP ? 'text-green-400' : 'text-yellow-400'}`}>
                  {result.hasVCP ? '✅ VCP Detected' : '⚠️ No Clear VCP'}
                </span>
                <span className={`px-3 py-1 rounded font-bold ${
                  result.strength === 'STRONG' ? 'bg-green-500 text-black' :
                  result.strength === 'MODERATE' ? 'bg-yellow-500 text-black' :
                  'bg-gray-500 text-white'
                }`}>
                  {result.strength}
                </span>
              </div>
              {result.contractions.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    {isZh ? `找到 ${result.contractions.length} 个收缩点:` : `Found ${result.contractions.length} contraction(s):`}
                  </p>
                  <div className="space-y-1">
                    {result.contractions.slice(-5).map((c, i) => (
                      <div key={i} className="text-xs font-mono text-gray-500">
                        Bar {c.index}: {c.pctOfAvg}% of average range
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
