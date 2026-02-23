import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function ProfitTarget({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [entryPrice, setEntryPrice] = useState(100);
  const [stopLoss, setStopLoss] = useState(95);
  const [riskReward, setRiskReward] = useState(3);

  const calculateTargets = () => {
    const risk = entryPrice - stopLoss;
    const reward = risk * riskReward;
    const target1R = entryPrice + risk;
    const target2R = entryPrice + (risk * 2);
    const target3R = entryPrice + (risk * 3);
    const target4R = entryPrice + (risk * 4);
    
    return {
      risk: risk.toFixed(2),
      reward: reward.toFixed(2),
      target1R: target1R.toFixed(2),
      target2R: target2R.toFixed(2),
      target3R: target3R.toFixed(2),
      target4R: target4R.toFixed(2),
      riskPercent: ((risk / entryPrice) * 100).toFixed(1),
      rewardPercent: ((reward / entryPrice) * 100).toFixed(1),
    };
  };

  const results = calculateTargets();

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-yellow-400">🎯 {isZh ? '利润目标计算器' : 'Profit Target Calculator'}</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">{isZh ? '买入价' : 'Entry Price'}</label>
          <input 
            type="number" 
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">{isZh ? '止损价' : 'Stop Loss'}</label>
          <input 
            type="number" 
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">{isZh ? '目标R倍数' : 'Target R-Multiple'}</label>
          <input 
            type="number" 
            value={riskReward}
            onChange={(e) => setRiskReward(Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      <div className="bg-gray-900 p-4 rounded border border-gray-700">
        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          <span className="text-gray-400">{isZh ? '风险 (R)' : 'Risk (R)'}:</span>
          <span className="text-red-400 font-mono">${results.risk} ({results.riskPercent}%)</span>
          
          <span className="text-gray-400">{isZh ? '潜在利润' : 'Potential Reward'}:</span>
          <span className="text-green-400 font-mono">${results.reward} ({results.rewardPercent}%)</span>
        </div>
        
        <div className="border-t border-gray-700 pt-4">
          <p className="text-sm text-gray-400 mb-2">{isZh ? '目标价位 (Minervini 法则)' : 'Price Targets (Minervini Rule)'}:</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-bold">1R</span>
              <span className="text-white font-mono">${results.target1R}</span>
              <span className="text-xs text-gray-500">{isZh ? '保本' : 'Breakeven'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-400 font-bold">2R</span>
              <span className="text-white font-mono">${results.target2R}</span>
              <span className="text-xs text-gray-500">{isZh ? '最小目标' : 'Min Target'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-500 font-bold">3R</span>
              <span className="text-white font-mono">${results.target3R}</span>
              <span className="text-xs text-gray-500">{isZh ? '理想目标' : 'Ideal Target'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400 font-bold">4R+</span>
              <span className="text-white font-mono">${results.target4R}+</span>
              <span className="text-xs text-gray-500">{isZh ? '强势股' : 'Strong Stock'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-500/30 text-xs text-blue-300">
        <p className="font-bold mb-1">💡 {isZh ? 'Minervini 法则:' : 'Minervini Rule:'}</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{isZh ? '至少 2R 才考虑卖出部分' : 'Sell partial at 2R'}</li>
          <li>{isZh ? '3R 是理想目标位' : '3R is ideal target'}</li>
          <li>{isZh ? '使用移动止损保护利润' : 'Use trailing stop to protect profits'}</li>
        </ul>
      </div>
    </div>
  );
}
