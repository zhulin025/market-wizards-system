import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function BrokerIntegration({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [broker, setBroker] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [positions, setPositions] = useState([]);

  const labels = t || {
    brokerIntegration: "Broker Integration",
    selectBroker: "Select Broker",
    apiKey: "API Key",
    apiSecret: "API Secret",
    connect: "Connect",
    disconnect: "Disconnect",
    connecting: "Connecting...",
    connected: "Connected",
    syncPositions: "Sync Positions",
    syncError: "Sync Error",
  };

  const brokers = [
    { id: 'alpaca', name: 'Alpaca', nameZh: 'Alpaca', logo: '🟢', docs: 'https://alpaca.markets/docs' },
    { id: 'tdameritrade', name: 'TD Ameritrade', nameZh: '道明银行', logo: '🔴', docs: 'https://developer.tdameritrade.com' },
    { id: 'interactive_brokers', name: 'Interactive Brokers', nameZh: '盈透证券', logo: '🟡', docs: 'https://interactivebrokers.github.io' },
    { id: 'tradier', name: 'Tradier', nameZh: 'Tradier', logo: '🔵', docs: 'https://documentation.tradier.com' },
    { id: 'finnhub', name: 'Finnhub', nameZh: 'Finnhub', logo: '⚡', docs: 'https://finnhub.io/docs/api' },
  ];

  const handleConnect = async () => {
    if (!broker || !apiKey) {
      setError(isZh ? '请选择券商并输入API密钥' : 'Please select broker and enter API key');
      return;
    }
    
    setConnecting(true);
    setError('');
    
    // Simulate connection (in real app, this would make API calls)
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      
      // Mock positions data
      setPositions([
        { symbol: 'AAPL', shares: 100, avgCost: 175.50, currentPrice: 182.30, marketValue: 18230 },
        { symbol: 'MSFT', shares: 50, avgCost: 380.00, currentPrice: 415.20, marketValue: 20760 },
        { symbol: 'NVDA', shares: 25, avgCost: 450.00, currentPrice: 520.15, marketValue: 13003.75 },
      ]);
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setPositions([]);
    setApiKey('');
    setApiSecret('');
    setBroker('');
  };

  const syncPositions = async () => {
    if (!connected) return;
    
    // Simulate syncing
    setTimeout(() => {
      // In real app, would fetch latest positions from broker
      setPositions(prev => prev.map(p => ({
        ...p,
        currentPrice: p.currentPrice * (0.98 + Math.random() * 0.04)
      })));
    }, 1000);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-green-400">🔗 {labels.brokerIntegration}</h2>
      
      {!connected ? (
        <>
          {/* Broker Selection */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">{labels.selectBroker}</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {brokers.map(b => (
                <button
                  key={b.id}
                  onClick={() => setBroker(b.id)}
                  className={`p-3 rounded border text-center transition ${
                    broker === b.id 
                      ? 'border-green-500 bg-green-500/20 text-white' 
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{b.logo}</div>
                  <div className="text-xs font-medium">{isZh ? b.nameZh : b.name}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* API Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">{labels.apiKey}</label>
              <input 
                type="text" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={isZh ? '输入 API Key' : 'Enter API Key'}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{labels.apiSecret}</label>
              <input 
                type="password" 
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder={isZh ? '输入 API Secret' : 'Enter API Secret'}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          
          <button 
            onClick={handleConnect}
            disabled={connecting || !broker}
            className={`px-6 py-2 rounded font-bold text-white transition ${
              connecting || !broker 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {connecting ? labels.connecting : labels.connect}
          </button>
          
          <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-500/30 text-xs text-blue-300">
            <p className="font-bold mb-1">💡 {isZh ? '支持的券商' : 'Supported Brokers'}:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Alpaca - {isZh ? '最适合算法交易' : 'Best for algo trading'}</li>
              <li>TD Ameritrade - {isZh ? '美国本土券商' : 'US-based broker'}</li>
              <li>Interactive Brokers - {isZh ? '全球覆盖' : 'Global coverage'}</li>
              <li>Tradier - {isZh ? '低成本' : 'Low cost'}</li>
              <li>Finnhub - {isZh ? '免费实时行情' : 'Free real-time quotes'}</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          {/* Connected State */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{brokers.find(b => b.id === broker)?.logo}</span>
              <div>
                <div className="text-green-400 font-bold flex items-center gap-2">
                  ✓ {labels.connected}
                </div>
                <div className="text-xs text-gray-400">
                  {isZh ? 'API密钥已存储' : 'API key stored securely'}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={syncPositions}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
              >
                {labels.syncPositions}
              </button>
              <button 
                onClick={handleDisconnect}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-bold"
              >
                {labels.disconnect}
              </button>
            </div>
          </div>
          
          {/* Positions from Broker */}
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <h3 className="font-bold text-gray-200 mb-3">{isZh ? '实时持仓' : 'Live Positions'}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-800 text-gray-400 uppercase">
                  <tr>
                    <th className="px-3 py-2">{isZh ? '股票' : 'Symbol'}</th>
                    <th className="px-3 py-2">{isZh ? '股数' : 'Shares'}</th>
                    <th className="px-3 py-2">{isZh ? '成本' : 'Avg Cost'}</th>
                    <th className="px-3 py-2">{isZh ? '现价' : 'Current'}</th>
                    <th className="px-3 py-2">{isZh ? '市值' : 'Market Value'}</th>
                    <th className="px-3 py-2">{isZh ? '盈亏' : 'P/L'}</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, i) => {
                    const pl = (pos.currentPrice - pos.avgCost) * pos.shares;
                    const plPercent = ((pos.currentPrice - pos.avgCost) / pos.avgCost) * 100;
                    return (
                      <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="px-3 py-2 font-bold text-white">{pos.symbol}</td>
                        <td className="px-3 py-2">{pos.shares}</td>
                        <td className="px-3 py-2">${pos.avgCost.toFixed(2)}</td>
                        <td className="px-3 py-2">${pos.currentPrice.toFixed(2)}</td>
                        <td className="px-3 py-2">${pos.marketValue.toLocaleString()}</td>
                        <td className={`px-3 py-2 font-bold ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${pl.toFixed(0)} ({plPercent.toFixed(1)}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-900/30 rounded border border-yellow-500/30 text-xs text-yellow-300">
            ⚠️ {isZh ? '注意：此为演示模式，数据为模拟数据。真实API集成需要配置服务器端代理。' : 'Note: Demo mode with simulated data. Real API integration requires server-side proxy.'}
          </div>
        </>
      )}
    </div>
  );
}
