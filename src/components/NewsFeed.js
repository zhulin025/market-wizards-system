// src/components/NewsFeed.js
import { useState, useEffect } from 'react';

export default function NewsFeed() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('/api/intelligence/fetch');
                const data = await res.json();
                if (data.success) {
                    setNews(data.data);
                }
            } catch (error) {
                console.error("Failed to load news feed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="p-4 bg-gray-900 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg text-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🗞️</span> Market Intelligence
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {news.map((item) => (
                    <div key={item.id} className="p-3 bg-gray-800 rounded-md border-l-4 border-blue-500 hover:bg-gray-750 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-semibold text-blue-400 uppercase">{item.source}</span>
                            <span className="text-xs text-gray-500">{new Date(item.published_at).toLocaleTimeString()}</span>
                        </div>
                        <h3 className="text-sm font-medium mb-1 line-clamp-2">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">
                                {item.title}
                            </a>
                        </h3>
                        {item.sentiment && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                item.sentiment === 'bullish' ? 'bg-green-900 text-green-300' :
                                item.sentiment === 'bearish' ? 'bg-red-900 text-red-300' :
                                'bg-gray-700 text-gray-400'
                            }`}>
                                {item.sentiment}
                            </span>
                        )}
                        <p className="text-xs text-gray-400 mt-2 line-clamp-3">{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
