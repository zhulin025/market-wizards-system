// src/components/KellyCalculator.js
import React, { useState } from 'react';
import { useTranslation } from './LanguageProvider';

export default function KellyCalculator() {
  const { locale } = useTranslation();
  
  // State
  const [winRate, setWinRate] = useState(40); // p (percent)
  const [winLossRatio, setWinLossRatio] = useState(2.5); // b (reward to risk)
  const [kellyFraction, setKellyFraction] = useState(0.5); // Fractional Kelly default
  const [accountSize, setAccountSize] = useState(100000);

  // Formula: f* = (p(b+1) - 1) / b
  // p: probability of win (0-1)
  // b: odds received (win/loss ratio)
  const calculateKelly = () => {
    const p = winRate / 100;
    const b = winLossRatio;
    
    // Basic Kelly
    const fullKelly = (p * (b + 1) - 1) / b;
    
    // Adjusted
    const adjustedKelly = Math.max(0, fullKelly * kellyFraction);
    
    return {
      percentage: (adjustedKelly * 100).toFixed(2),
      amount: Math.floor(accountSize * adjustedKelly)
    };
  };

  const result = calculateKelly();
  const fullKellyPercent = ((winRate / 100 * (winLossRatio + 1) - 1) / winLossRatio);

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center text-purple-400">
        🧮 {locale === 'zh' ? '凯利公式 (Kelly Criterion)' : 'Kelly Criterion'}
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            {locale === 'zh' ? '胜率 (Win Rate %)' : 'Win Rate (%)'}
          </label>
          <input 
            type="number" 
            value={winRate}
            onChange={(e) => setWinRate(Number(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            {locale === 'zh' ? '盈亏比 (Reward/Risk)' : 'Reward/Risk Ratio'}
          </label>
          <input 
            type="number" 
            value={winLossRatio}
            step="0.1"
            onChange={(e) => setWinLossRatio(Number(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs text-gray-400 mb-1 flex justify-between">
          <span>
            {locale === 'zh' ? '凯利分数 (Fractional Kelly)' : 'Kelly Fraction'}
          </span>
          <span className="text-purple-300 font-bold">{kellyFraction}x</span>
        </label>
        <input 
          type="range" 
          min="0.1" 
          max="1.0" 
          step="0.1"
          value={kellyFraction}
          onChange={(e) => setKellyFraction(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Conservative (0.25x)</span>
          <span>Thorp's Rec (0.5x)</span>
          <span>Aggressive (1.0x)</span>
        </div>
      </div>

      <div className="bg-gray-900 p-4 rounded border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">{locale === 'zh' ? '建议仓位' : 'Optimal Position'}:</span>
          <span className="text-2xl font-bold text-green-400">{result.percentage}%</span>
        </div>
        <div className="text-right text-sm text-gray-500">
          ${result.amount.toLocaleString()}
        </div>
        
        {/* Warnings based on Poundstone/Thorp */}
        {fullKellyPercent <= 0 && (
          <div className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">
            ⚠️ {locale === 'zh' ? '期望值为负！不要交易。' : 'Negative Expectancy! Do not trade.'}
          </div>
        )}
        {fullKellyPercent > 0.5 && kellyFraction > 0.5 && (
          <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
            ⚠️ {locale === 'zh' ? '警告：超过半凯利会导致波动剧烈。' : 'Warning: > Half-Kelly implies extreme volatility.'}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 italic">
        "Size matters. Survival > Profit." — William Poundstone
      </div>
    </div>
  );
}
