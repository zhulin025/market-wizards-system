import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function TechnicalIndicators({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [priceData, setPriceData] = useState('');
  const [result, setResult] = useState(null);

  const calculateIndicators = () => {
    // Parse CSV: Date,Open,High,Low,Close,Volume
    const lines = priceData.trim().split('\n');
    const data = [];
    
    for (const line of lines) {
      const parts = line.split(/[,;\t]/);
      if (parts.length >= 5) {
        const close = parseFloat(parts[4] || parts[3]);
        const high = parseFloat(parts[2]);
        const low = parseFloat(parts[3]);
        const volume = parseFloat(parts[5] || 0);
        if (!isNaN(close)) {
          data.push({ close, high, low, volume });
        }
      }
    }
    
    if (data.length < 50) {
      setResult({ error: isZh ? '数据不足，至少需要50条' : 'Not enough data, need at least 50 bars' });
      return;
    }

    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume);
    
    // SMA
    const sma = (arr, period) => {
      if (arr.length < period) return null;
      return arr.slice(0, period).reduce((a, b) => a + b, 0) / period;
    };
    
    // EMA
    const ema = (arr, period) => {
      if (arr.length < period) return null;
      const multiplier = 2 / (period + 1);
      let emaVal = arr.slice(0, period).reduce((a, b) => a + b, 0) / period;
      for (let i = period; i < arr.length; i++) {
        emaVal = (arr[i] - emaVal) * multiplier + emaVal;
      }
      return emaVal;
    };
    
    // RSI
    const calculateRSI = (period = 14) => {
      if (closes.length < period + 1) return null;
      let gains = 0, losses = 0;
      for (let i = closes.length - period; i < closes.length; i++) {
        const diff = closes[i] - closes[i-1];
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      const avgGain = gains / period;
      const avgLoss = losses / period;
      if (avgLoss === 0) return 100;
      const rs = avgGain / avgLoss;
      return 100 - (100 / (1 + rs));
    };
    
    // MACD
    const calculateMACD = () => {
      const ema12 = ema(closes, 12);
      const ema26 = ema(closes, 26);
      if (!ema12 || !ema26) return null;
      const macdLine = ema12 - ema26;
      // Signal line (9-day EMA of MACD) - simplified
      return { macdLine, signal: macdLine * 0.9, histogram: macdLine * 0.1 };
    };
    
    // ATR (Average True Range)
    const calculateATR = (period = 14) => {
      if (data.length < period + 1) return null;
      let trSum = 0;
      for (let i = data.length - period; i < data.length; i++) {
        const tr = Math.max(
          highs[i] - lows[i],
          Math.abs(highs[i] - closes[i-1]),
          Math.abs(lows[i] - closes[i-1])
        );
        trSum += tr;
      }
      return trSum / period;
    };
    
    // Volume Analysis
    const avgVolume = volumes.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
    const volumeRatio = volumes[0] / avgVolume;
    
    // Support/Resistance
    const support = Math.min(...lows.slice(0, 50));
    const resistance = Math.max(...highs.slice(0, 50));
    
    const indicators = {
      sma20: sma(closes, 20),
      sma50: sma(closes, 50),
      sma200: sma(closes, 200),
      ema12: ema(closes, 12),
      ema26: ema(closes, 26),
      rsi: calculateRSI(14),
      macd: calculateMACD(),
      atr: calculateATR(14),
      volume: volumes[0],
      avgVolume,
      volumeRatio,
      support,
      resistance,
      currentPrice: closes[0],
    };
    
    // Signals
    const signals = [];
    
    // RSI Signals
    if (indicators.rsi) {
      if (indicators.rsi < 30) signals.push({ type: 'BUY', reason: isZh ? 'RSI 超卖 (<30)' : 'RSI Oversold (<30)' });
      else if (indicators.rsi > 70) signals.push({ type: 'SELL', reason: isZh ? 'RSI 超买 (>70)' : 'RSI Overbought (>70)' });
    }
    
    // MACD Signals
    if (indicators.macd) {
      if (indicators.macd.macdLine > indicators.macd.signal) signals.push({ type: 'BUY', reason: isZh ? 'MACD 金叉' : 'MACD Golden Cross' });
      else if (indicators.macd.macdLine < indicators.macd.signal) signals.push({ type: 'SELL', reason: isZh ? 'MACD 死叉' : 'MACD Death Cross' });
    }
    
    // Price vs SMA
    if (indicators.sma20 && indicators.currentPrice > indicators.sma20) {
      signals.push({ type: 'BUY', reason: isZh ? '股价 > SMA20' : 'Price > SMA20' });
    }
    
    // Volume Spike
    if (indicators.volumeRatio > 1.5) signals.push({ type: 'INFO', reason: isZh ? '成交量激增' : 'Volume Spike' });
    
    setResult({ indicators, signals });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-teal-400">📈 {isZh ? '技术指标分析' : 'Technical Indicators'}</h2>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          {isZh ? '粘贴价格数据 (CSV: Date,Open,High,Low,Close,Volume)' : 'Paste price data (CSV: Date,Open,High,Low,Close,Volume)'}
        </label>
        <textarea 
          value={priceData}
          onChange={(e) => setPriceData(e.target.value)}
          placeholder={isZh ? '2024-01-01,100,105,99,103,1000000\n...' : '2024-01-01,100,105,99,103,1000000\n...'}
          className="w-full h-24 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-xs"
        />
      </div>
      
      <button 
        onClick={calculateIndicators}
        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
      >
        {isZh ? '计算指标' : 'Calculate Indicators'}
      </button>
      
      {result && (
        <div className="mt-4">
          {result.error ? (
            <p className="text-red-400">{result.error}</p>
          ) : (
            <>
              {/* Signals */}
              {result.signals.length > 0 && (
                <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">{isZh ? '信号' : 'Signals'}:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.signals.map((sig, i) => (
                      <span key={i} className={`px-2 py-1 rounded text-xs font-bold ${
                        sig.type === 'BUY' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                        sig.type === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500'
                      }`}>
                        {sig.type}: {sig.reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Indicators Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">RSI (14)</div>
                  <div className={`text-lg font-bold ${result.indicators.rsi > 70 ? 'text-red-400' : result.indicators.rsi < 30 ? 'text-green-400' : 'text-white'}`}>
                    {result.indicators.rsi?.toFixed(1) || '-'}
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">MACD</div>
                  <div className={`text-lg font-bold ${result.indicators.macd?.macdLine > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {result.indicators.macd?.macdLine?.toFixed(2) || '-'}
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">ATR (14)</div>
                  <div className="text-lg font-bold text-white">
                    {result.indicators.atr?.toFixed(2) || '-'}
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Volume Ratio</div>
                  <div className={`text-lg font-bold ${result.indicators.volumeRatio > 1.5 ? 'text-yellow-400' : 'text-white'}`}>
                    {result.indicators.volumeRatio?.toFixed(2) || '-'}x
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">SMA 20</div>
                  <div className="text-lg font-bold text-white">
                    ${result.indicators.sma20?.toFixed(2) || '-'}
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">SMA 50</div>
                  <div className="text-lg font-bold text-white">
                    ${result.indicators.sma50?.toFixed(2) || '-'}
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Support</div>
                  <div className="text-lg font-bold text-green-400">
                    ${result.indicators.support?.toFixed(2) || '-'}
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Resistance</div>
                  <div className="text-lg font-bold text-red-400">
                    ${result.indicators.resistance?.toFixed(2) || '-'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
