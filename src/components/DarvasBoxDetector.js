// src/components/DarvasBoxDetector.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from './LanguageProvider';

export default function DarvasBoxDetector({ symbol }) {
  const { t, locale } = useTranslation();
  const [boxes, setBoxes] = useState([]);
  const [status, setStatus] = useState('LOADING'); // LOADING, DETECTED, NONE

  // Simulate Darvas Box calculation (In a real app, this would process historical data)
  useEffect(() => {
    // Mock logic: randomly determine if a box is forming
    const mockAnalyze = () => {
      const isBoxForming = Math.random() > 0.4;
      if (isBoxForming) {
        setBoxes([
          { top: 68500, bottom: 65000, status: 'Active' },
          { top: 65000, bottom: 62000, status: 'Broken' }
        ]);
        setStatus('DETECTED');
      } else {
        setBoxes([]);
        setStatus('NONE');
      }
    };

    setStatus('LOADING');
    setTimeout(mockAnalyze, 1000);
  }, [symbol]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-bold mb-3 flex items-center text-yellow-400">
        📦 {locale === 'zh' ? '达瓦斯箱体 (Darvas Box)' : 'Darvas Box Theory'}
      </h3>
      
      <div className="text-sm text-gray-400 mb-4">
        {locale === 'zh' 
          ? '基于 Nicolas Darvas 的动量策略。寻找价格在窄幅区间震荡后的突破。'
          : 'Based on Nicolas Darvas momentum strategy. Identifying breakouts from consolidation ranges.'}
      </div>

      {status === 'LOADING' && <div className="animate-pulse h-10 bg-gray-700 rounded"></div>}
      
      {status === 'NONE' && (
        <div className="text-gray-500 italic">
          {locale === 'zh' ? '当前未检测到有效箱体结构。' : 'No valid box structure detected.'}
        </div>
      )}

      {status === 'DETECTED' && (
        <div className="space-y-3">
          {boxes.map((box, idx) => (
            <div key={idx} className={`p-3 rounded border ${idx === 0 ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-700/30'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`font-bold ${idx === 0 ? 'text-green-400' : 'text-gray-500'}`}>
                  {idx === 0 ? (locale === 'zh' ? '当前箱体' : 'Current Box') : (locale === 'zh' ? '历史箱体' : 'History Box')}
                </span>
                <span className="text-xs bg-gray-900 px-2 py-1 rounded">
                  {idx === 0 ? 'Watching' : 'Passed'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Top (Buy):</span>
                  <div className="font-mono text-white">${box.top.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Bottom (Stop):</span>
                  <div className="font-mono text-white">${box.bottom.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-2 text-xs text-green-300 flex items-center">
            <span className="mr-1">💡</span>
            {locale === 'zh' ? '策略：突破箱顶买入，跌破箱底止损。' : 'Strategy: Buy break of Top, Stop Loss at Bottom.'}
          </div>
        </div>
      )}
    </div>
  );
}
