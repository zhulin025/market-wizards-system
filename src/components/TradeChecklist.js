import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function TradeChecklist({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [checks, setChecks] = useState({
    // Trend
    trendConfirmed: false,
    priceAboveKeyMA: false,
    // Fundamentals
    earningsGrowth: false,
    salesGrowth: false,
    // Technical
    vcpForming: false,
    tightConsolidation: false,
    volumeSqueeze: false,
    // Risk
    clearStopLoss: false,
    positionSized: false,
    riskRewardGood: false,
    // Psychology
    noRevenge: false,
    noFomo: false,
    patient: false,
  });

  const toggleCheck = (key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const categories = {
    trend: {
      title: isZh ? '📈 趋势确认' : '📈 Trend Confirmation',
      items: {
        trendConfirmed: isZh ? '股价处于上涨趋势（阶段2）' : 'Stock in uptrend (Stage 2)',
        priceAboveKeyMA: isZh ? '股价在50日/200日均线上方' : 'Price above 50/200 MA',
      }
    },
    fundamentals: {
      title: isZh ? '📊 基本面' : '📊 Fundamentals',
      items: {
        earningsGrowth: isZh ? '盈利增长 > 25%' : 'Earnings growth > 25%',
        salesGrowth: isZh ? '营收增长 > 20%' : 'Sales growth > 20%',
      }
    },
    technical: {
      title: isZh ? '📐 技术形态' : '📐 Technical Pattern',
      items: {
        vcpForming: isZh ? 'VCP 形态正在形成' : 'VCP pattern forming',
        tightConsolidation: isZh ? '收缩整理，波动收窄' : 'Tight consolidation, contraction',
        volumeSqueeze: isZh ? '成交量萎缩（买入前）' : 'Volume drying up (before breakout)',
      }
    },
    risk: {
      title: isZh ? '⛔ 风险管理' : '⛔ Risk Management',
      items: {
        clearStopLoss: isZh ? '有明确的止损位' : 'Clear stop loss defined',
        positionSized: isZh ? '仓位大小已确定 (1-2%风险)' : 'Position sized (1-2% risk)',
        riskReward: isZh ? '风险回报比 > 2:1' : 'Risk/Reward > 2:1',
      }
    },
    psychology: {
      title: isZh ? '🧠 心理纪律' : '🧠 Psychology & Discipline',
      items: {
        noRevenge: isZh ? '没有报复性交易心态' : 'No revenge trading mindset',
        noFomo: isZh ? '没有FOMO追高' : 'No FOMO buying',
        patient: isZh ? '耐心等待最佳入场点' : 'Patient for best entry',
      }
    }
  };

  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const score = (passedChecks / totalChecks) * 100;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-pink-400">✅ {isZh ? '交易前检查清单' : 'Pre-Trade Checklist'}</h2>
      
      <div className="mb-4 flex items-center gap-4">
        <div className={`px-4 py-2 rounded font-bold text-lg ${
          score === 100 ? 'bg-green-500 text-black' :
          score >= 70 ? 'bg-yellow-500 text-black' :
          'bg-red-500 text-white'
        }`}>
          {isZh ? '完成度' : 'Completion'}: {score.toFixed(0)}%
        </div>
        <span className="text-gray-400 text-sm">
          {passedChecks}/{totalChecks} {isZh ? '项已检查' : 'items checked'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(categories).map(([catKey, category]) => (
          <div key={catKey} className="bg-gray-900 p-4 rounded border border-gray-700">
            <h3 className="font-bold text-gray-200 mb-3">{category.title}</h3>
            <div className="space-y-2">
              {Object.entries(category.items).map(([itemKey, label]) => (
                <label key={itemKey} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-1 rounded transition">
                  <input 
                    type="checkbox" 
                    checked={checks[itemKey]}
                    onChange={() => toggleCheck(itemKey)}
                    className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500 focus:ring-offset-gray-800"
                  />
                  <span className={`text-sm ${checks[itemKey] ? 'text-white' : 'text-gray-500'}`}>
                    {label}
                  </span>
                  {checks[itemKey] && <span className="text-green-400 text-xs">✓</span>}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {score < 100 && (
        <div className="mt-4 p-3 bg-red-900/30 rounded border border-red-500/30 text-xs text-red-300">
          ⚠️ {isZh ? '建议完成所有检查后再入场！' : 'Complete all checks before entering a trade!'}
        </div>
      )}
    </div>
  );
}
