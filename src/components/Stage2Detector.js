import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function Stage2Detector({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [priceData, setPriceData] = useState('');
  const [result, setResult] = useState(null);

  const analyzeStage = () => {
    // Parse CSV data
    const lines = priceData.trim().split('\n');
    const data = [];
    
    for (const line of lines) {
      const parts = line.split(/[,;\t]/);
      if (parts.length >= 5) {
        const close = parseFloat(parts[4] || parts[3]);
        if (!isNaN(close)) {
          data.push(close);
        }
      }
    }
    
    if (data.length < 50) {
      setResult({ error: isZh ? '数据不足，至少需要50条' : 'Not enough data, need at least 50 bars' });
      return;
    }
    
    // Get recent prices
    const current = data[0];
    const ma50 = data.slice(0, 50).reduce((a, b) => a + b, 0) / 50;
    const ma150 = data.slice(0, 150).reduce((a, b) => a + b, 0) / Math.min(150, data.length);
    const ma200 = data.slice(0, 200).reduce((a, b) => a + b, 0) / Math.min(200, data.length);
    
    // Calculate 52-week high/low
    const yearHigh = Math.max(...data.slice(0, Math.min(252, data.length)));
    const yearLow = Math.min(...data.slice(0, Math.min(252, data.length)));
    
    // Stage 2 Criteria (Minervini)
    const criteria = {
      priceAbove200MA: current > ma200,
      ma150Above200MA: data.length >= 150 ? ma150 > ma200 : true,
      ma200TrendingUp: data.length >= 200 ? ma200 > (data.slice(200, 220).reduce((a, b) => a + b, 0) / 20) : true,
      priceAbove50MA: current > ma50,
      priceNearHigh: current >= yearHigh * 0.75,
      upTrend: current > data[20] && data[20] > data[60], // Higher highs & higher lows
    };
    
    const passedCount = Object.values(criteria).filter(Boolean).length;
    const stage = passedCount >= 5 ? 'STAGE_2' : passedCount >= 3 ? 'TRANSITIONAL' : 'STAGE_1_OR_4';
    
    const stageLabels = {
      STAGE_2: isZh ? '第二阶段 - 上涨趋势 📈' : 'Stage 2 - Uptrend 📈',
      TRANSITIONAL: isZh ? '过渡阶段 - 观望' : 'Transitional - Watch',
      STAGE_1_OR_4: isZh ? '第一/四阶段 - 下跌或盘整 📉' : 'Stage 1 or 4 - Downtrend/Congestion 📉',
    };
    
    setResult({
      stage,
      stageLabel: stageLabels[stage],
      score: passedCount,
      criteria,
      stats: { current, ma50, ma150, ma200, yearHigh, yearLow }
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">📈 {isZh ? '趋势阶段检测' : 'Stage 2 Trend Detector'}</h2>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          {isZh ? '粘贴收盘价数据 (每行一个价格)' : 'Paste closing prices (one per line)'}
        </label>
        <textarea 
          value={priceData}
          onChange={(e) => setPriceData(e.target.value)}
          placeholder={isZh ? '105.5\n104.2\n106.8\n...' : '105.5\n104.2\n106.8\n...'}
          className="w-full h-24 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
        />
      </div>
      
      <button 
        onClick={analyzeStage}
        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
      >
        {isZh ? '分析趋势' : 'Analyze Trend'}
      </button>
      
      {result && (
        <div className="mt-4">
          {result.error ? (
            <p className="text-red-400">{result.error}</p>
          ) : (
            <>
              <div className={`text-2xl font-bold mb-4 ${
                result.stage === 'STAGE_2' ? 'text-green-400' :
                result.stage === 'TRANSITIONAL' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {result.stageLabel}
              </div>
              
              <div className="space-y-2">
                {Object.entries(result.criteria).map(([key, passed]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {isZh ? {
                        priceAbove200MA: '股价 > 200日均线',
                        ma150Above200MA: '150日均线 > 200日均线',
                        ma200TrendingUp: '200日均线向上',
                        priceAbove50MA: '股价 > 50日均线',
                        priceNearHigh: '距52周高点 < 25%',
                        upTrend: '上升趋势 (高点低点抬升)',
                      }[key] : key}
                    </span>
                    <span className={passed ? 'text-green-400 font-bold' : 'text-red-400'}>
                      {passed ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-900 rounded text-xs font-mono text-gray-400 grid grid-cols-2 gap-2">
                <div>Current: <span className="text-white">{result.stats.current?.toFixed(2)}</span></div>
                <div>MA50: <span className="text-white">{result.stats.ma50?.toFixed(2)}</span></div>
                <div>MA150: <span className="text-white">{result.stats.ma150?.toFixed(2)}</span></div>
                <div>MA200: <span className="text-white">{result.stats.ma200?.toFixed(2)}</span></div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
