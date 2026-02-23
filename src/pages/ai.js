// src/pages/ai.js
import Head from 'next/head';
import Link from 'next/link';
import NewsFeed from '../components/NewsFeed';
import { useTranslation } from '../components/LanguageProvider';

export default function AIPage() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Head>
        <title>AI Intelligence Hub - Market Wizards</title>
      </Head>

      <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-50">
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 hover:opacity-80 transition-opacity">
          🦞 Market Wizards AI
        </Link>
        <div className="flex gap-4 items-center">
            <Link 
              href="/"
              className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              ← {locale === 'zh' ? '返回交易台' : 'Back to Terminal'}
            </Link>
            <select 
              value={locale} 
              onChange={(e) => setLocale(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
            >
              <option value="en">🇺🇸 English</option>
              <option value="zh">🇨🇳 中文</option>
            </select>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-4xl space-y-6">
        <div className="text-center py-8">
            <h1 className="text-3xl font-bold mb-2">🧠 Market Intelligence Hub</h1>
            <p className="text-gray-400">
                {locale === 'zh' ? '由 AI 驱动的实时市场情报中心' : 'Real-time AI-powered market intelligence center'}
            </p>
        </div>

        {/* Intelligence Feed */}
        <NewsFeed />
        
        {/* Placeholder for Deep Dive */}
        <div className="p-8 bg-gray-800 rounded-lg border border-gray-700 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">Deep Dive Analyst</h3>
            <p className="text-gray-500 mb-4">
                {locale === 'zh' 
                    ? 'AI 深度分析功能即将上线。能够针对特定新闻进行搜索、推理并生成交易策略。' 
                    : 'AI Deep Dive analysis coming soon. Will search, reason, and generate trading strategies for specific news.'}
            </p>
            <button className="px-6 py-2 bg-blue-600/50 text-blue-200 rounded cursor-not-allowed">
                {locale === 'zh' ? '敬请期待' : 'Coming Soon'}
            </button>
        </div>
      </main>
    </div>
  );
}
