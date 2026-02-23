import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

export default function AlertSystem({ t }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({
    ticker: '',
    condition: 'price_above',
    value: '',
    enabled: true,
  });
  const [notificationPermission, setNotificationPermission] = useState('default');

  const labels = t || {
    alertSystem: "Alert System",
    ticker: "Symbol",
    condition: "Condition",
    value: "Value",
    addAlert: "Add Alert",
    noAlerts: "No alerts set",
    priceAbove: "Price Above",
    priceBelow: "Price Below",
    volumeAbove: "Volume Above",
    rsAbove: "RS Rating Above",
    deleteAlert: "Delete",
  };

  const conditions = [
    { id: 'price_above', label: isZh ? '价格高于' : 'Price Above', labelZh: '价格高于' },
    { id: 'price_below', label: isZh ? '价格低于' : 'Price Below', labelZh: '价格低于' },
    { id: 'volume_above', label: isZh ? '成交量高于' : 'Volume Above', labelZh: '成交量高于' },
    { id: 'rs_above', label: isZh ? 'RS评分高于' : 'RS Above', labelZh: 'RS评分高于' },
  ];

  useEffect(() => {
    // Load saved alerts
    const saved = localStorage.getItem('mw-alerts');
    if (saved) setAlerts(JSON.parse(saved));
    
    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem('mw-alerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const addAlert = () => {
    if (!form.ticker || !form.value) return;
    
    const newAlert = {
      id: Date.now(),
      ticker: form.ticker.toUpperCase(),
      condition: form.condition,
      value: Number(form.value),
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    
    setAlerts([...alerts, newAlert]);
    setForm({ ticker: '', condition: 'price_above', value: '', enabled: true });
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const toggleAlert = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const triggerNotification = (alert, price) => {
    if (notificationPermission === 'granted') {
      new Notification(`🦞 Alert: ${alert.ticker}`, {
        body: `${alert.condition} $${alert.value} - Current: $${price}`,
        icon: '/favicon.ico'
      });
    }
  };

  const getConditionLabel = (condition) => {
    const cond = conditions.find(c => c.id === condition);
    return isZh ? cond?.labelZh : cond?.label;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-red-400">🔔 {labels.alertSystem}</h2>
        
        {notificationPermission !== 'granted' && (
          <button 
            onClick={requestNotificationPermission}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-bold"
          >
            {isZh ? '启用通知' : 'Enable Notifications'}
          </button>
        )}
        
        {notificationPermission === 'granted' && (
          <span className="text-xs text-green-400">✓ {isZh ? '通知已启用' : 'Notifications Enabled'}</span>
        )}
      </div>
      
      {/* Add Alert Form */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <input 
          placeholder={labels.ticker}
          value={form.ticker}
          onChange={(e) => setForm({...form, ticker: e.target.value.toUpperCase()})}
          className="bg-gray-700 text-white px-3 py-2 rounded text-sm"
        />
        <select 
          value={form.condition}
          onChange={(e) => setForm({...form, condition: e.target.value})}
          className="bg-gray-700 text-white px-3 py-2 rounded text-sm"
        >
          {conditions.map(c => (
            <option key={c.id} value={c.id}>{isZh ? c.labelZh : c.label}</option>
          ))}
        </select>
        <input 
          placeholder={labels.value}
          type="number"
          value={form.value}
          onChange={(e) => setForm({...form, value: e.target.value})}
          className="bg-gray-700 text-white px-3 py-2 rounded text-sm"
        />
        <button 
          onClick={addAlert}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
        >
          {labels.addAlert}
        </button>
      </div>
      
      {/* Alerts List */}
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-center text-gray-500 py-4">{labels.noAlerts}</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between bg-gray-900 p-3 rounded border border-gray-700">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={alert.enabled}
                  onChange={() => toggleAlert(alert.id)}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white">{alert.ticker}</span>
                  <span className="text-gray-400 text-sm ml-2">
                    {getConditionLabel(alert.condition)} ${alert.value}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => deleteAlert(alert.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-500/30 text-xs text-blue-300">
        💡 {isZh ? '提示：系统会定期检查价格并触发浏览器通知' : 'Tip: System will check prices periodically and trigger browser notifications'}
      </div>
    </div>
  );
}
