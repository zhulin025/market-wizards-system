import React, { useState, useEffect } from 'react';
import { useTranslation } from './LanguageProvider'; // Changed from useLanguage

export default function TradingViewChart({ t: propT }) { // Rename propT to avoid conflict if we use t from hook
  const { locale, t } = useTranslation(); // Use useTranslation and locale
  const isZh = locale === 'zh';
  
  const [ticker, setTicker] = useState('AAPL');
  const [chartType, setChartType] = useState('stock');

  // Use hook t if available, otherwise fallback to prop or default object
  // But wait, the component receives t as a prop? 
  // The original code was: const labels = t || { ... }
  // Let's stick to using the hook t since it's cleaner.

  const labels = {
    tradingViewChart: t('tradingViewChart') || "TradingView Chart",
    enterTicker: t('enterTicker') || "Enter Symbol",
    loadChart: t('loadChart') || "Load Chart",
    chartType: t('chartType') || "Chart Type",
    fullscreen: t('fullscreen') || "Fullscreen",
  };

  const chartTypes = [
    { id: 'stock', label: isZh ? '股票' : 'Stock', TradingViewType: 'stock' },
    { id: 'futures', label: isZh ? '期货' : 'Futures', TradingViewType: 'futures' },
    { id: 'forex', label: isZh ? '外汇' : 'Forex', TradingViewType: 'forex' },
    { id: 'crypto', label: isZh ? '加密货币' : 'Crypto', TradingViewType: 'crypto' },
  ];

  // Load TradingView widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        initChart();
      }
    };
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
    };
  }, []);

  const initChart = () => {
    if (!window.TradingView || !document.getElementById('tradingview_chart')) return;
    
    new window.TradingView.widget({
      width: '100%',
      height: 500,
      symbol: ticker.toUpperCase(),
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: chartType === 'crypto' ? '3' : '1',
      locale: isZh ? 'zh' : 'en',
      toolbar_bg: '#1e1e1e',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: 'tradingview_chart',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
      overrides: {
        'mainSeriesProperties.candleStyle.upColor': '#26a69a',
        'mainSeriesProperties.candleStyle.downColor': '#ef5350',
        'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
        'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350',
      },
    });
  };

  const loadChart = () => {
    initChart();
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-blue-400">📈 TradingView {labels.tradingViewChart}</h2>
      
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input 
          type="text" 
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && loadChart()}
          placeholder={labels.enterTicker}
          className="bg-gray-700 text-white px-4 py-2 rounded font-bold uppercase w-32"
        />
        
        <select 
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          {chartTypes.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
        
        <button 
          onClick={loadChart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
        >
          {labels.loadChart}
        </button>
        
        <a 
          href={`https://www.tradingview.com/chart/?symbol=${ticker.toUpperCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          {labels.fullscreen} ↗
        </a>
      </div>
      
      {/* TradingView Widget */}
      <div id="tradingview_chart" className="w-full rounded overflow-hidden border border-gray-700"></div>
      
      {/* Quick Symbols */}
      <div className="mt-4">
        <div className="text-xs text-gray-400 mb-2">{isZh ? '快速选择:' : 'Quick Symbols:'}</div>
        <div className="flex flex-wrap gap-2">
          {['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'AMZN', 'META', 'BTCUSD', 'ETHUSD'].map(sym => (
            <button
              key={sym}
              onClick={() => { setTicker(sym); setTimeout(loadChart, 100); }}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded text-gray-300"
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-500/30 text-xs text-blue-300">
        💡 {isZh ? '使用 TradingView 强大的图表工具进行技术分析' : 'Use TradingView powerful charting tools for technical analysis'}
      </div>
    </div>
  );
}
