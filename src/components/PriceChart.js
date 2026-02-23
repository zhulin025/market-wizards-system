import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function PriceChart({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [priceData, setPriceData] = useState('');
  const [chartData, setChartData] = useState(null);

  const labels = t || {
    priceChart: "Price Chart",
    enterData: "Enter price data (CSV: Date,Close)",
    drawChart: "Draw Chart",
    clearChart: "Clear",
  };

  const parseData = () => {
    const lines = priceData.trim().split('\n');
    const data = [];
    
    for (const line of lines) {
      const parts = line.split(/[,;\t]/);
      if (parts.length >= 2) {
        const close = parseFloat(parts[parts.length - 1]);
        if (!isNaN(close)) {
          data.push(close);
        }
      }
    }
    
    if (data.length < 2) {
      alert(isZh ? '数据不足' : 'Not enough data');
      return;
    }
    
    setChartData(data.reverse()); // Oldest first
  };

  const clearChart = () => {
    setChartData(null);
    setPriceData('');
  };

  // Simple canvas chart rendering
  const renderChart = () => {
    if (!chartData || chartData.length === 0) return null;
    
    const canvas = document.getElementById('priceChartCanvas');
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    const prices = chartData;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / prices.length;
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.fillText(price.toFixed(2), 5, y + 3);
    }
    
    // Draw price line
    ctx.strokeStyle = '#26a69a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    prices.forEach((price, i) => {
      const x = padding + i * barWidth;
      const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Fill area under the line
    ctx.lineTo(padding + (prices.length - 1) * barWidth, padding + chartHeight);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.closePath();
    ctx.fillStyle = 'rgba(38, 166, 154, 0.1)';
    ctx.fill();
    
    // Draw volume bars at bottom
    const volumeHeight = 30;
    const maxVolume = prices.length > 20 ? prices.slice(0, 20).reduce((a, b) => a + Math.abs(b), 0) / 20 : prices[0];
    
    prices.slice(0, 20).forEach((_, i) => {
      const x = padding + i * barWidth;
      const volHeight = (Math.abs(prices[i] || 0) / maxVolume) * volumeHeight * 0.3;
      ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.fillRect(x, height - padding - volHeight, barWidth * 0.8, volHeight);
    });
    
    // Current price label
    const currentPrice = prices[prices.length - 1];
    ctx.fillStyle = '#26a69a';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`$${currentPrice.toFixed(2)}`, width - 80, padding - 10);
  };

  React.useEffect(() => {
    if (chartData) {
      renderChart();
    }
  }, [chartData]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-green-400">📊 {labels.priceChart}</h2>
      
      {!chartData ? (
        <>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">{labels.enterData}</label>
            <textarea 
              value={priceData}
              onChange={(e) => setPriceData(e.target.value)}
              placeholder={isZh ? '2024-01-01,100.50\n2024-01-02,101.25\n...' : '2024-01-01,100.50\n2024-01-02,101.25\n...'}
              className="w-full h-32 bg-gray-700 text-white px-3 py-2 rounded font-mono text-xs"
            />
          </div>
          
          <button 
            onClick={parseData}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
          >
            {labels.drawChart}
          </button>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <button 
              onClick={clearChart}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← {labels.clearChart}
            </button>
            <span className="text-sm text-gray-400">
              {isZh ? '数据点' : 'Data points'}: {chartData.length}
            </span>
          </div>
          
          <canvas 
            id="priceChartCanvas" 
            width={700} 
            height={300}
            className="w-full rounded border border-gray-700"
          />
          
          {/* Simple stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="bg-gray-900 p-2 rounded text-center">
              <div className="text-xs text-gray-400">{isZh ? '最高' : 'High'}</div>
              <div className="text-green-400 font-bold">${Math.max(...chartData).toFixed(2)}</div>
            </div>
            <div className="bg-gray-900 p-2 rounded text-center">
              <div className="text-xs text-gray-400">{isZh ? '最低' : 'Low'}</div>
              <div className="text-red-400 font-bold">${Math.min(...chartData).toFixed(2)}</div>
            </div>
            <div className="bg-gray-900 p-2 rounded text-center">
              <div className="text-xs text-gray-400">{isZh ? '当前' : 'Current'}</div>
              <div className="text-white font-bold">${chartData[chartData.length - 1].toFixed(2)}</div>
            </div>
            <div className="bg-gray-900 p-2 rounded text-center">
              <div className="text-xs text-gray-400">{isZh ? '变化' : 'Change'}</div>
              <div className={`font-bold ${chartData[chartData.length - 1] >= chartData[0] ? 'text-green-400' : 'text-red-400'}`}>
                {((chartData[chartData.length - 1] - chartData[0]) / chartData[0] * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
