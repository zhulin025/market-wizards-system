// src/pages/index.js
import Head from 'next/head';
import TradingViewChart from '../components/TradingViewChart';
import TechnicalIndicators from '../components/TechnicalIndicators';
import AdvancedIndicators from '../components/AdvancedIndicators';
import NewsFeed from '../components/NewsFeed'; // Added
import { useState } from 'react';
import { useTranslation } from '../i18n';

export default function Home() {
  const [symbol, setSymbol] = useState('BTC-USD');
  const [timeframe, setTimeframe] = useState('1d');
  const { t, locale, setLocale } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content="AI-powered trading system based on Market Wizards strategies" />
      </Head>

      <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-50">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          🦞 Market Wizards AI
        </h1>
        <div className="flex gap-4 items-center">
            <select 
              value={locale} 
              onChange={(e) => setLocale(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
            >
              <option value="en">🇺🇸 English</option>
              <option value="zh">🇨🇳 中文</option>
            </select>
            <div className="flex gap-2">
                <input 
                  type="text" 
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 w-32 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Symbol"
                />
            </div>
        </div>
      </header>

      <main className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Chart & Technicals */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden h-[500px]">
             <TradingViewChart symbol={symbol} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TechnicalIndicators symbol={symbol} />
            <AdvancedIndicators symbol={symbol} />
          </div>
        </div>

        {/* Right Column: Intelligence Hub */}
        <div className="lg:col-span-1 space-y-6">
           <NewsFeed />
           
           {/* Placeholder for future "Deep Dive" Analysis */}
           <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center text-gray-500 text-sm">
              🤖 AI Analyst (Coming Soon)
              <br/>
              "Waiting for your command..."
           </div>
        </div>
      </main>
    </div>
  );
}
