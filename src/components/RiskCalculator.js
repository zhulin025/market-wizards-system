import React, { useState } from 'react';

export default function RiskCalculator({ t }) {
  const labels = t || {
    accountSize: "Account Size ($)",
    riskPerTrade: "Risk per Trade (%)",
    stopLossPercent: "Stop Loss (%)",
    sharePrice: "Share Price ($)",
    riskAmount: "Risk Amount",
    maxPositionSize: "Max Position Size",
    maxShares: "Max Shares",
    percentageOfAccount: "% of Account",
    highConcentration: "⚠️ High Concentration",
  };

  const [accountSize, setAccountSize] = useState(100000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopLossPercent, setStopLossPercent] = useState(5);
  const [sharePrice, setSharePrice] = useState(100);

  const calculatePosition = () => {
    const riskAmount = accountSize * (riskPercent / 100);
    const positionSize = riskAmount / (stopLossPercent / 100);
    const shares = Math.floor(positionSize / sharePrice);
    
    return {
      riskAmount: riskAmount.toFixed(2),
      positionSize: positionSize.toFixed(2),
      shares: shares,
      percentageOfAccount: ((positionSize / accountSize) * 100).toFixed(1)
    };
  };

  const results = calculatePosition();

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-emerald-400">🛡️ {labels.riskManagement || "Risk Management (1-2% Rule)"}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">{labels.accountSize}</label>
          <input 
            type="number" 
            value={accountSize}
            onChange={(e) => setAccountSize(Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">{labels.riskPerTrade}</label>
          <input 
            type="number" 
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">{labels.stopLossPercent}</label>
          <input 
            type="number" 
            value={stopLossPercent}
            onChange={(e) => setStopLossPercent(Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">{labels.sharePrice}</label>
          <input 
            type="number" 
            value={sharePrice}
            onChange={(e) => setSharePrice(Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="bg-gray-900 p-4 rounded border border-gray-700">
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-gray-400">{labels.riskAmount}:</span>
          <span className="text-white font-mono">${results.riskAmount}</span>
          
          <span className="text-gray-400">{labels.maxPositionSize}:</span>
          <span className="text-white font-mono">${results.positionSize}</span>
          
          <span className="text-gray-400">{labels.maxShares}:</span>
          <span className="text-emerald-400 font-bold font-mono">{results.shares}</span>
          
          <span className="text-gray-400">{labels.percentageOfAccount}:</span>
          <span className={`font-mono ${Number(results.percentageOfAccount) > 25 ? 'text-red-400' : 'text-blue-400'}`}>
            {results.percentageOfAccount}%
            {Number(results.percentageOfAccount) > 25 && ` ${labels.highConcentration}`}
          </span>
        </div>
      </div>
    </div>
  );
}
