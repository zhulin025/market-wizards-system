import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function AdvancedIndicators({ t }) {
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
        const open = parseFloat(parts[1]);
        const volume = parseFloat(parts[5] || 0);
        if (!isNaN(close)) {
          data.push({ open, high, low, close, volume });
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
    
    // Helper functions
    const sma = (arr, period) => {
      if (arr.length < period) return null;
      return arr.slice(0, period).reduce((a, b) => a + b, 0) / period;
    };
    
    const ema = (arr, period) => {
      if (arr.length < period) return null;
      const multiplier = 2 / (period + 1);
      let emaVal = arr.slice(0, period).reduce((a, b) => a + b, 0) / period;
      for (let i = period; i < arr.length; i++) {
        emaVal = (arr[i] - emaVal) * multiplier + emaVal;
      }
      return emaVal;
    };
    
    // Bollinger Bands
    const calculateBB = (period = 20, stdDev = 2) => {
      if (closes.length < period) return null;
      const smaVal = sma(closes, period);
      const slice = closes.slice(0, period);
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - smaVal, 2), 0) / period;
      const std = Math.sqrt(variance);
      return { upper: smaVal + stdDev * std, middle: smaVal, lower: smaVal - stdDev * std };
    };
    
    // Stochastic Oscillator
    const calculateStochastic = (period = 14) => {
      if (closes.length < period) return null;
      const sliceHighs = highs.slice(0, period);
      const sliceLows = lows.slice(0, period);
      const highest = Math.max(...sliceHighs);
      const lowest = Math.min(...sliceLows);
      const k = ((closes[0] - lowest) / (highest - lowest)) * 100;
      return k;
    };
    
    // ADX (Average Directional Index)
    const calculateADX = (period = 14) => {
      if (data.length < period * 2) return null;
      
      let plusDM = [], minusDM = [], tr = [];
      for (let i = 1; i < data.length; i++) {
        const highDiff = data[i].high - data[i-1].high;
        const lowDiff = data[i-1].low - data[i].low;
        plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
        minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
        tr.push(Math.max(
          data[i].high - data[i].low,
          Math.abs(data[i].high - data[i-1].close),
          Math.abs(data[i].low - data[i-1].close)
        ));
      }
      
      const smoothedTR = tr.slice(0, period).reduce((a, b) => a + b, 0);
      const smoothedPlusDM = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
      const smoothedMinusDM = minusDM.slice(0, period).reduce((a, b) => a + b, 0);
      
      const plusDI = (smoothedPlusDM / smoothedTR) * 100;
      const minusDI = (smoothedMinusDM / smoothedTR) * 100;
      const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
      const adx = dx; // Simplified
      
      return { adx, plusDI, minusDI };
    };
    
    // VWAP (Volume Weighted Average Price)
    const calculateVWAP = () => {
      if (data.length < 1) return null;
      let cumVolPrice = 0, cumVol = 0;
      for (let i = 0; i < Math.min(data.length, 20); i++) {
        const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
        cumVolPrice += typicalPrice * data[i].volume;
        cumVol += data[i].volume;
      }
      return cumVol > 0 ? cumVolPrice / cumVol : null;
    };
    
    // Fibonacci Retracement
    const calculateFibonacci = () => {
      const high = Math.max(...highs.slice(0, 50));
      const low = Math.min(...lows.slice(0, 50));
      const diff = high - low;
      return {
        level0: high,
        level236: high - diff * 0.236,
        level382: high - diff * 0.382,
        level500: high - diff * 0.500,
        level618: high - diff * 0.618,
        level786: high - diff * 0.786,
        level100: low,
      };
    };
    
    // OBV (On-Balance Volume)
    const calculateOBV = () => {
      let obv = 0;
      for (let i = 1; i < Math.min(closes.length, 20); i++) {
        if (closes[i] > closes[i-1]) obv += volumes[i];
        else if (closes[i] < closes[i-1]) obv -= volumes[i];
      }
      return obv;
    };
    
    // Current values
    const bb = calculateBB(20, 2);
    const stoch = calculateStochastic(14);
    const adx = calculateADX(14);
    const vwap = calculateVWAP();
    const fib = calculateFibonacci();
    const obv = calculateOBV();
    
    // Generate signals
    const signals = [];
    const currentPrice = closes[0];
    
    // BB Signals
    if (bb) {
      if (currentPrice < bb.lower) signals.push({ type: 'BUY', reason: isZh ? 'BB超卖' : 'BB Oversold' });
      else if (currentPrice > bb.upper) signals.push({ type: 'SELL', reason: isZh ? 'BB超买' : 'BB Overbought' });
    }
    
    // Stochastic Signals
    if (stoch) {
      if (stoch < 20) signals.push({ type: 'BUY', reason: isZh ? 'Stochastic超卖' : 'Stoch Oversold' });
      else if (stoch > 80) signals.push({ type: 'SELL', reason: isZh ? 'Stochastic超买' : 'Stoch Overbought' });
    }
    
    // ADX Signals
    if (adx) {
      if (adx.adx > 25) signals.push({ type: 'INFO', reason: isZh ? '趋势强' : 'Strong Trend' });
      if (adx.plusDI > adx.plusDI) signals.push({ type: 'BUY', reason: isZh ? '+DI > -DI' : '+DI > -DI' });
    }
    
    // VWAP Signal
    if (vwap) {
      if (currentPrice > vwap) signals.push({ type: 'BUY', reason: isZh ? '价格 > VWAP' : 'Price > VWAP' });
      else signals.push({ type: 'SELL', reason: isZh ? '价格 < VWAP' : 'Price < VWAP' });
    }
    
    setResult({
      indicators: {
        bb, stoch, adx, vwap, fib, obv,
        sma20: sma(closes, 20),
        sma50: sma(closes, 50),
        sma200: sma(closes, 200),
        ema12: ema(closes, 12),
        ema26: ema(closes, 26),
        rsi: calculateRSI(closes, 14),
        currentPrice,
      },
      signals,
    });
  };

  const calculateRSI = (closes, period = 14) => {
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

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-purple-400">📊 {isZh ? '高级技术指标' : 'Advanced Technical Indicators'}</h2>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          {isZh ? '粘贴价格数据 (CSV: Date,Open,High,Low,Close,Volume)' : 'Paste price data (CSV: Date,Open,High,Low,Close,Volume)'}
        </label>
        <textarea 
          value={priceData}
          onChange={(e) => setPriceData(e.target.value)}
          placeholder={isZh ? '2024-01-01,100,105,99,103,1000000\n...' : '2024-01-01,100,105,99,103,1000000\n...'}
          className="w-full h-24 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
        />
      </div>
      
      <button 
        onClick={calculateIndicators}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
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
                  <p className="text-sm text-gray-400 mb-2">{isZh ? '信号分析' : 'Signal Analysis'}:</p>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Bollinger Bands */}
                <div className="bg-gray-900 p-3 rounded border border-gray-700 col-span-2">
                  <div className="text-xs text-gray-400 mb-2">{isZh ? '布林带 (BB)' : 'Bollinger Bands'}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-red-400">Upper:</span>
                      <div className="font-bold text-white">${result.indicators.bb?.upper?.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Middle:</span>
                      <div className="font-bold text-white">${result.indicators.bb?.middle?.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-green-400">Lower:</span>
                      <div className="font-bold text-white">${result.indicators.bb?.lower?.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Stochastic */}
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">{isZh ? '随机指标' : 'Stochastic %K'}</div>
                  <div className={`text-2xl font-bold ${result.indicators.stoch > 80 ? 'text-red-400' : result.indicators.stoch < 20 ? 'text-green-400' : 'text-white'}`}>
                    {result.indicators.stoch?.toFixed(1)}
                  </div>
                </div>
                
                {/* ADX */}
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">ADX</div>
                  <div className={`text-2xl font-bold ${result.indicators.adx?.adx > 25 ? 'text-yellow-400' : 'text-white'}`}>
                    {result.indicators.adx?.adx?.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    +DI: {result.indicators.adx?.plusDI?.toFixed(1)} | -DI: {result.indicators.adx?.minusDI?.toFixed(1)}
                  </div>
                </div>
                
                {/* Moving Averages */}
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">SMA 20</div>
                  <div className="text-lg font-bold text-white">${result.indicators.sma20?.toFixed(2)}</div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">SMA 50</div>
                  <div className="text-lg font-bold text-white">${result.indicators.sma50?.toFixed(2)}</div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">SMA 200</div>
                  <div className="text-lg font-bold text-white">${result.indicators.sma200?.toFixed(2)}</div>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">VWAP</div>
                  <div className="text-lg font-bold text-cyan-400">${result.indicators.vwap?.toFixed(2)}</div>
                </div>
                
                {/* RSI */}
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">RSI (14)</div>
                  <div className={`text-2xl font-bold ${result.indicators.rsi > 70 ? 'text-red-400' : result.indicators.rsi < 30 ? 'text-green-400' : 'text-white'}`}>
                    {result.indicators.rsi?.toFixed(1)}
                  </div>
                </div>
                
                {/* OBV */}
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">OBV</div>
                  <div className="text-lg font-bold text-white">{result.indicators.obv?.toLocaleString()}</div>
                </div>
                
                {/* Fibonacci */}
                <div className="bg-gray-900 p-3 rounded border border-gray-700 col-span-2">
                  <div className="text-xs text-gray-400 mb-2">{isZh ? '斐波那契回撤' : 'Fibonacci Retracement'}</div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><span className="text-red-400">0%:</span> ${result.indicators.fib?.level0?.toFixed(0)}</div>
                    <div><span className="text-yellow-400">23.6%:</span> ${result.indicators.fib?.level236?.toFixed(0)}</div>
                    <div><span className="text-yellow-400">38.2%:</span> ${result.indicators.fib?.level382?.toFixed(0)}</div>
                    <div><span className="text-green-400">61.8%:</span> ${result.indicators.fib?.level618?.toFixed(0)}</div>
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
