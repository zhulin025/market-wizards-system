import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

export default function DataExport({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [exportType, setExportType] = useState('trades');
  const [storageStats, setStorageStats] = useState({ trades: 0, positions: 0, alerts: 0 });

  const labels = t || {
    dataExport: "Data Export",
    selectData: "Select Data to Export",
    format: "Format",
    export: "Export",
    trades: "Trade History",
    positions: "Open Positions",
    alerts: "Price Alerts",
    all: "All Data",
  };

  useEffect(() => {
    // Load storage stats on client side only
    if (typeof window !== 'undefined') {
      setStorageStats({
        trades: JSON.parse(localStorage.getItem('mw-journal-trades') || '[]').length,
        positions: JSON.parse(localStorage.getItem('mw-positions') || '[]').length,
        alerts: JSON.parse(localStorage.getItem('mw-alerts') || '[]').length,
      });
    }
  }, []);

  const getStorageData = (key) => {
    if (typeof window === 'undefined') return '[]';
    return localStorage.getItem(key) || '[]';
  };

  const exportData = () => {
    let data = null;
    let filename = '';
    let mimeType = '';
    
    switch (exportType) {
      case 'trades':
        data = getStorageData('mw-journal-trades');
        filename = `trades_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
        
      case 'positions':
        data = getStorageData('mw-positions');
        filename = `positions_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
        
      case 'alerts':
        data = getStorageData('mw-alerts');
        filename = `alerts_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
        
      case 'all':
        const allData = {
          trades: JSON.parse(getStorageData('mw-journal-trades')),
          positions: JSON.parse(getStorageData('mw-positions')),
          alerts: JSON.parse(getStorageData('mw-alerts')),
          exportedAt: new Date().toISOString(),
        };
        data = JSON.stringify(allData, null, 2);
        filename = `market_wizards_all_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
        
      case 'trades_csv':
        const tradesData = JSON.parse(getStorageData('mw-journal-trades'));
        const csvHeader = 'Date,Ticker,Entry,Stop,Exit,R-Multiple,Notes\n';
        const csvData = tradesData.map(trade => 
          `${trade.date},${trade.ticker},${trade.entryPrice},${trade.stopLoss},${trade.exitPrice || ''},${trade.rMultiple || ''},${trade.notes || ''}`
        ).join('\n');
        data = csvHeader + csvData;
        filename = `trades_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
        
      default:
        return;
    }
    
    // Create and download file
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.trades) {
          localStorage.setItem('mw-journal-trades', JSON.stringify(data.trades));
        }
        if (data.positions) {
          localStorage.setItem('mw-positions', JSON.stringify(data.positions));
        }
        if (data.alerts) {
          localStorage.setItem('mw-alerts', JSON.stringify(data.alerts));
        }
        
        alert(isZh ? '数据导入成功！' : 'Data imported successfully!');
      } catch (err) {
        alert(isZh ? '导入失败：无效的JSON文件' : 'Import failed: Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm(isZh ? '确定要清除所有数据吗？此操作不可恢复！' : 'Are you sure you want to clear all data? This cannot be undone!')) {
      localStorage.removeItem('mw-journal-trades');
      localStorage.removeItem('mw-positions');
      localStorage.removeItem('mw-alerts');
      alert(isZh ? '所有数据已清除' : 'All data cleared');
    }
  };

  const exportTypes = [
    { id: 'trades', label: isZh ? '交易记录' : 'Trade History', icon: '📝' },
    { id: 'positions', label: isZh ? '当前持仓' : 'Open Positions', icon: '💼' },
    { id: 'alerts', label: isZh ? '价格提醒' : 'Price Alerts', icon: '🔔' },
    { id: 'trades_csv', label: isZh ? '交易记录 (CSV)' : 'Trades (CSV)', icon: '📊' },
    { id: 'all', label: isZh ? '所有数据' : 'All Data', icon: '📦' },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">📤 {labels.dataExport}</h2>
      
      {/* Export Options */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">{labels.selectData}</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          {exportTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setExportType(type.id)}
              className={`p-3 rounded border text-center transition ${
                exportType === type.id 
                  ? 'border-cyan-500 bg-cyan-500/20 text-white' 
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-xl mb-1">{type.icon}</div>
              <div className="text-xs font-medium">{type.label}</div>
            </button>
          ))}
        </div>
        
        <button 
          onClick={exportData}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded"
        >
          {labels.export} ↓
        </button>
      </div>
      
      {/* Import */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <h3 className="text-sm font-bold text-gray-300 mb-2">{isZh ? '导入数据 (JSON)' : 'Import Data (JSON)'}</h3>
        <input 
          type="file" 
          accept=".json"
          onChange={importData}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-cyan-600 file:text-white
            hover:file:bg-cyan-700
            file:cursor-pointer file:pointer-events-auto"
        />
      </div>
      
      {/* Clear Data */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <button 
          onClick={clearAllData}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded"
        >
          {isZh ? '清除所有数据' : 'Clear All Data'}
        </button>
      </div>
      
      {/* Storage Info */}
      <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-700 text-xs text-gray-400">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-gray-500">{isZh ? '交易记录' : 'Trades'}:</span>
            <span className="text-white ml-1">{storageStats.trades}</span>
          </div>
          <div>
            <span className="text-gray-500">{isZh ? '持仓' : 'Positions'}:</span>
            <span className="text-white ml-1">{storageStats.positions}</span>
          </div>
          <div>
            <span className="text-gray-500">{isZh ? '提醒' : 'Alerts'}:</span>
            <span className="text-white ml-1">{storageStats.alerts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
