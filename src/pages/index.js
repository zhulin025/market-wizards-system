import Head from 'next/head';
import Link from 'next/link';
import TradingViewChart from '../components/TradingViewChart';
import TechnicalIndicators from '../components/TechnicalIndicators';
import AdvancedIndicators from '../components/AdvancedIndicators';
import Screener from '../components/Screener';
import RiskCalculator from '../components/RiskCalculator';
import KellyCalculator from '../components/KellyCalculator'; // Added
import ProbabilityEstimator from '../components/ProbabilityEstimator'; // Added
import Journal from '../components/Journal';
import DarvasBoxDetector from '../components/DarvasBoxDetector'; 
import { useState, useEffect } from 'react';
import { useTranslation } from '../components/LanguageProvider';
import { getRandomWisdom } from '../data/wisdom';

export default function Home() {
  const [symbol, setSymbol] = useState('BTC-USD');
  const [timeframe, setTimeframe] = useState('1d');
  const [dailyWisdom, setDailyWisdom] = useState(null);
  const { t, locale, setLocale } = useTranslation();

  useEffect(() => {
    setDailyWisdom(getRandomWisdom());
  }, []);

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
            {/* AI Intelligence Button */}
            <Link 
              href="/ai"
              className="px-4 py-2 rounded bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium flex items-center gap-2 transition-all shadow-md"
            >
              <span className="text-lg">🧠</span>
              {locale === 'zh' ? 'AI 情报' : 'AI Intel'}
            </Link>

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

      {/* Wisdom Banner */}
      {dailyWisdom && (
        <div className="bg-blue-900/20 border-b border-blue-800/50 py-2 px-4 text-center text-xs md:text-sm text-blue-200">
          <span className="font-bold mr-2">📚 Daily Wisdom:</span>
          "{dailyWisdom.quote}" — <span className="italic text-blue-400">{dailyWisdom.author}</span>
        </div>
      )}

      <main className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden h-[500px]">
             <TradingViewChart symbol={symbol} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TechnicalIndicators symbol={symbol} />
            <AdvancedIndicators symbol={symbol} />
          </div>
          
          {/* Strategy Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <DarvasBoxDetector symbol={symbol} />
             <Screener />
          </div>

          {/* Quant Row (New) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <RiskCalculator />
             <KellyCalculator /> {/* Added */}
          </div>

          <Journal />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
           {/* Probability Tool (New) */}
           <ProbabilityEstimator />

           <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-lg font-bold mb-4">{t('quickTips')}</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
                {(t('tips') || []).map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
           </div>

           <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-lg font-bold mb-4">{t('ironRules')}</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-red-400">
                {(t('rules') || []).map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
           </div>
        </div>
      </main>
    </div>
  );
}
