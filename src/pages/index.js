import Head from 'next/head';
import { LanguageProvider, useLanguage } from '../components/LanguageProvider';
import RiskCalculator from '../components/RiskCalculator';
import Screener from '../components/Screener';
import Journal from '../components/Journal';
import VCPDetector from '../components/VCPDetector';
import Stage2Detector from '../components/Stage2Detector';
import ProfitTarget from '../components/ProfitTarget';
import TradeChecklist from '../components/TradeChecklist';
import PositionManager from '../components/PositionManager';
import TechnicalIndicators from '../components/TechnicalIndicators';
import MomentumScanner from '../components/MomentumScanner';
import Backtester from '../components/Backtester';
import AdvancedIndicators from '../components/AdvancedIndicators';
import BrokerIntegration from '../components/BrokerIntegration';
import AlertSystem from '../components/AlertSystem';
import DataExport from '../components/DataExport';
import TradingViewChart from '../components/TradingViewChart';
import PriceChart from '../components/PriceChart';

function Header() {
  const { lang, toggleLang, t } = useLanguage();
  
  return (
    <header className="bg-gray-800 border-b border-gray-700 py-4 px-6 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          🦞 Market Wizards System
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLang}
            className="px-3 py-1 rounded-full text-sm font-bold bg-gray-700 hover:bg-gray-600 text-yellow-400 transition"
          >
            {lang === 'zh' ? '🇺🇸 EN' : '🇨🇳 中'}
          </button>
          <nav className="space-x-4 text-sm font-medium text-gray-300">
            <span className="hover:text-white transition cursor-pointer">{t.dashboard}</span>
            <span className="hover:text-white transition cursor-pointer">{t.screener}</span>
            <span className="hover:text-white transition cursor-pointer">{t.journal}</span>
            <span className="text-gray-600">|</span>
            <span className="text-emerald-400">{t.status}: {t.live}</span>
          </nav>
        </div>
      </div>
    </header>
  );
}

function QuickTips() {
  const { t } = useLanguage();
  
  return (
    <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-gray-200 mb-2">💡 {t.quickTips}</h3>
      <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
        {t.tips.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}

function IronRules() {
  const { t } = useLanguage();
  
  return (
    <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-red-500">
      <h3 className="text-lg font-bold text-gray-200 mb-2">⛔ {t.ironRules}</h3>
      <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
        {t.rules.map((rule, i) => (
          <li key={i}>{rule}</li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-12 text-center text-gray-500 text-sm">
      <p>{t.footer}</p>
    </footer>
  );
}

function HomeContent() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Head>
        <title>Market Wizards Trading System</title>
        <meta name="description" content="SEPA & VCP Trading System - Based on Mark Minervini" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Core Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
             <Screener t={t} />
             <QuickTips />
          </div>
          <div>
            <RiskCalculator t={t} />
            <IronRules />
          </div>
        </div>

        {/* Section 2: Analysis Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <VCPDetector t={t} />
          <Stage2Detector t={t} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ProfitTarget t={t} />
          <TradeChecklist t={t} />
        </div>

        {/* Section 3: Advanced Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <MomentumScanner t={t} />
          <TechnicalIndicators t={t} />
        </div>

        <div className="mb-8">
          <AdvancedIndicators t={t} />
        </div>

        {/* Section 4: Charts & Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <TradingViewChart t={t} />
          <PriceChart t={t} />
        </div>

        {/* Section 5: Portfolio Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <PositionManager t={t} />
          <BrokerIntegration t={t} />
        </div>

        {/* Section 6: Backtesting */}
        <div className="mb-8">
          <Backtester t={t} />
        </div>

        {/* Section 7: Alerts & Export */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <AlertSystem t={t} />
          <DataExport t={t} />
        </div>

        {/* Bottom Section: Journal */}
        <div className="mt-8">
          <Journal t={t} />
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}
