import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Newspaper,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  ExternalLink,
  Filter,
  Search,
  Eye
} from 'lucide-react';

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  symbols: string[];
  category: string;
  url: string;
  imageUrl?: string;
}

interface MarketEvent {
  type: 'earnings' | 'economic' | 'announcement' | 'alert';
  title: string;
  description: string;
  time: Date;
  severity: 'high' | 'medium' | 'low';
  symbols?: string[];
}

export default function RealTimeNewsCenter() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  const categories = ['all', 'markets', 'earnings', 'economic', 'technology', 'policy'];
  const sentiments = ['all', 'positive', 'negative', 'neutral'];

  useEffect(() => {
    generateMockNews();
    generateMockEvents();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        addNewNewsItem();
      }
      if (Math.random() > 0.8) {
        addNewEvent();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateMockNews = () => {
    const mockNews: NewsItem[] = [
      {
        id: '1',
        headline: 'Federal Reserve Signals Potential Rate Cut in Q2 2025',
        summary: 'Fed officials hint at monetary policy adjustments amid economic data suggesting cooling inflation.',
        source: 'Reuters',
        timestamp: new Date(Date.now() - 15 * 60000),
        sentiment: 'positive',
        impact: 'high',
        symbols: ['SPY', 'QQQ', 'DXY'],
        category: 'economic',
        url: '#'
      },
      {
        id: '2',
        headline: 'Apple Reports Record Q4 Revenue, Beats Expectations',
        summary: 'Apple Inc. announces strong quarterly results driven by iPhone 15 sales and services growth.',
        source: 'Bloomberg',
        timestamp: new Date(Date.now() - 30 * 60000),
        sentiment: 'positive',
        impact: 'high',
        symbols: ['AAPL'],
        category: 'earnings',
        url: '#'
      },
      {
        id: '3',
        headline: 'AI Chip Demand Drives NVIDIA to New Highs',
        summary: 'NVIDIA continues to benefit from artificial intelligence boom with data center revenue surge.',
        source: 'CNBC',
        timestamp: new Date(Date.now() - 45 * 60000),
        sentiment: 'positive',
        impact: 'medium',
        symbols: ['NVDA'],
        category: 'technology',
        url: '#'
      },
      {
        id: '4',
        headline: 'Oil Prices Surge on Middle East Tensions',
        summary: 'Crude oil futures jump 3% as geopolitical concerns affect global supply outlook.',
        source: 'WSJ',
        timestamp: new Date(Date.now() - 60 * 60000),
        sentiment: 'negative',
        impact: 'medium',
        symbols: ['XOM', 'CVX', 'USO'],
        category: 'markets',
        url: '#'
      },
      {
        id: '5',
        headline: 'Tesla Announces Expansion into Indian Market',
        summary: 'Electric vehicle manufacturer reveals plans for manufacturing facility in India by 2026.',
        source: 'Financial Times',
        timestamp: new Date(Date.now() - 90 * 60000),
        sentiment: 'positive',
        impact: 'medium',
        symbols: ['TSLA'],
        category: 'markets',
        url: '#'
      }
    ];
    setNews(mockNews);
  };

  const generateMockEvents = () => {
    const mockEvents: MarketEvent[] = [
      {
        type: 'economic',
        title: 'NFP Data Release',
        description: 'Non-Farm Payrolls data expected at 8:30 AM EST',
        time: new Date(Date.now() + 60 * 60000),
        severity: 'high'
      },
      {
        type: 'earnings',
        title: 'Microsoft Earnings',
        description: 'Q4 earnings call scheduled for 4:30 PM EST',
        time: new Date(Date.now() + 4 * 60 * 60000),
        severity: 'high',
        symbols: ['MSFT']
      },
      {
        type: 'alert',
        title: 'Unusual Options Activity',
        description: 'High call volume detected in GOOGL',
        time: new Date(Date.now() - 10 * 60000),
        severity: 'medium',
        symbols: ['GOOGL']
      }
    ];
    setEvents(mockEvents);
  };

  const addNewNewsItem = () => {
    const headlines = [
      'Breaking: Major Tech Merger Announced',
      'Crypto Market Sees Significant Movement',
      'Banking Sector Shows Strong Performance',
      'Energy Stocks Rally on Supply Concerns',
      'Healthcare Innovation Drives Sector Growth'
    ];

    const newItem: NewsItem = {
      id: Date.now().toString(),
      headline: headlines[Math.floor(Math.random() * headlines.length)],
      summary: 'Breaking news update with market implications...',
      source: 'Live Wire',
      timestamp: new Date(),
      sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
      impact: Math.random() > 0.7 ? 'high' : 'medium',
      symbols: ['SPY'],
      category: 'markets',
      url: '#'
    };

    setNews(prev => [newItem, ...prev].slice(0, 20));
  };

  const addNewEvent = () => {
    const eventTitles = [
      'Market Alert: High Volatility Detected',
      'Economic Data: GDP Revision',
      'Corporate Action: Stock Split Announced'
    ];

    const newEvent: MarketEvent = {
      type: 'alert',
      title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
      description: 'Real-time market event notification',
      time: new Date(),
      severity: 'medium'
    };

    setEvents(prev => [newEvent, ...prev].slice(0, 10));
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-400/20';
      case 'negative': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
    const matchesSearch = searchTerm === '' || 
      item.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symbols.some(symbol => symbol.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSentiment && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-900 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Real-Time News Center</h1>
          <div className="text-gray-400 text-sm sm:text-base">Live market news, events, and sentiment analysis</div>
        </div>
        
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6 h-full">
        {/* Filters and Search */}
        <div className="xl:col-span-1 space-y-3 lg:space-y-4 order-2 xl:order-1">
          {/* Search */}
          <div className="bg-black/40 rounded-xl p-3 sm:p-4 border border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search news, symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-black/40 rounded-xl p-3 sm:p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-3 flex items-center text-sm sm:text-base">
              <Filter className="w-4 h-4 mr-2" />
              Categories
            </h3>
            <div className="space-y-1 sm:space-y-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sentiment Filter */}
          <div className="bg-black/40 rounded-xl p-3 sm:p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Sentiment</h3>
            <div className="space-y-1 sm:space-y-2">
              {sentiments.map(sentiment => (
                <button
                  key={sentiment}
                  onClick={() => setSentimentFilter(sentiment)}
                  className={`w-full text-left px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                    sentimentFilter === sentiment
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Market Events */}
          <div className="bg-black/40 rounded-xl p-3 sm:p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-3 flex items-center text-sm sm:text-base">
              <Clock className="w-4 h-4 mr-2" />
              Market Events
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {events.slice(0, 5).map((event, index) => (
                <div key={index} className="p-2 sm:p-3 bg-gray-800/50 rounded-lg">
                  <div className={`text-xs sm:text-sm font-medium ${getSeverityColor(event.severity)}`}>
                    {event.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {event.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(event.time)}
                  </div>
                  {event.symbols && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.symbols.map(symbol => (
                        <span key={symbol} className="text-xs bg-blue-600 text-white px-1 sm:px-2 py-1 rounded">
                          {symbol}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* News Feed */}
        <div className="xl:col-span-3 order-1 xl:order-2">
          <div className="bg-black/40 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-700 h-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Latest News ({filteredNews.length})
              </h2>
              <button className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm flex items-center">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Mark all as read
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredNews.map((item) => (
                <div key={item.id} className={`p-3 sm:p-4 rounded-lg border-l-4 ${getImpactColor(item.impact)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold leading-tight pr-2 sm:pr-4 text-sm sm:text-base">
                      {item.headline}
                    </h3>
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment === 'positive' ? <TrendingUp className="w-3 h-3" /> :
                         item.sentiment === 'negative' ? <TrendingDown className="w-3 h-3" /> :
                         <AlertCircle className="w-3 h-3" />}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">
                    {item.summary}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-gray-400">{item.source}</span>
                      <span className="text-gray-500">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.symbols.map(symbol => (
                          <span key={symbol} className="text-xs bg-blue-600 text-white px-1 sm:px-2 py-1 rounded">
                            {symbol}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm flex items-center whitespace-nowrap">
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Read more
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
