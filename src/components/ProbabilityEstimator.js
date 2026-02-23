// src/components/ProbabilityEstimator.js
import React, { useState } from 'react';
import { useTranslation } from './LanguageProvider';

export default function ProbabilityEstimator() {
  const { locale } = useTranslation();
  
  // Outside-In Methodology
  const [baseRate, setBaseRate] = useState(30); // The "Class" probability
  const [specificAdjustments, setSpecificAdjustments] = useState(0); // Adjustments based on specific evidence
  
  // Calculation
  // Simple heuristic Bayesian-like update for UI demo purposes
  // Real Bayesian: P(H|E) = P(E|H)*P(H) / P(E)
  // Simplified: Anchor on Base Rate, adjust by max +/- 20% based on specifics
  const finalProb = Math.min(99, Math.max(1, baseRate + specificAdjustments));

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg mt-6">
      <h3 className="text-xl font-bold mb-4 flex items-center text-blue-400">
        🎲 {locale === 'zh' ? 'Tetlock 概率校准 (Outside-In)' : 'Tetlock Forecasting'}
      </h3>

      {/* Step 1: Outside View */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-300 mb-1">
          1. {locale === 'zh' ? '外部视角 (Base Rate)' : 'Outside View (Base Rate)'}
        </label>
        <p className="text-xs text-gray-500 mb-2">
          {locale === 'zh' 
            ? '类似形态（如突破200日均线）在历史上的平均胜率是多少？' 
            : 'What is the historical success rate for this class of setup?'}
        </p>
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={baseRate}
            onChange={(e) => setBaseRate(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-blue-300 font-mono w-12 text-right">{baseRate}%</span>
        </div>
      </div>

      {/* Step 2: Inside View */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-300 mb-1">
          2. {locale === 'zh' ? '内部视角 (Specifics)' : 'Inside View (Specifics)'}
        </label>
        <p className="text-xs text-gray-500 mb-2">
          {locale === 'zh' 
            ? '当前情况有哪些特殊因素支持或反对？(贝叶斯更新)' 
            : 'What specific factors support or oppose this trade? (Bayesian update)'}
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => setSpecificAdjustments(prev => prev - 5)}
            className="px-3 py-1 bg-red-900/30 text-red-400 rounded border border-red-800 hover:bg-red-900/50"
          >
            👎 Weakness (-5%)
          </button>
          <button 
            onClick={() => setSpecificAdjustments(prev => prev + 5)}
            className="px-3 py-1 bg-green-900/30 text-green-400 rounded border border-green-800 hover:bg-green-900/50"
          >
            👍 Strength (+5%)
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Adjustment: <span className={specificAdjustments > 0 ? 'text-green-400' : 'text-red-400'}>
            {specificAdjustments > 0 ? '+' : ''}{specificAdjustments}%
          </span>
        </div>
      </div>

      {/* Final Probability */}
      <div className="bg-gray-900 p-4 rounded border border-gray-600 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">{locale === 'zh' ? '最终置信度' : 'Final Confidence'}:</span>
          <span className={`text-2xl font-bold ${finalProb > 70 ? 'text-green-400' : finalProb < 30 ? 'text-red-400' : 'text-yellow-400'}`}>
            {finalProb}%
          </span>
        </div>
        
        {/* Brier Score Hint */}
        <div className="mt-2 text-xs text-gray-500 border-t border-gray-800 pt-2 flex justify-between">
          <span>Target Brier Score: &lt; 0.25</span>
          <span>Signal vs Noise</span>
        </div>
      </div>
    </div>
  );
}
