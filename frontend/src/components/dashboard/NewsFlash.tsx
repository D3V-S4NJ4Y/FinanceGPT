import React from 'react';

interface NewsFlashProps {
  className?: string;
}

export const NewsFlash: React.FC<NewsFlashProps> = ({ className }) => {
  const newsItems = [
    {
      headline: "Fed Signals Dovish Stance on Interest Rates",
      sentiment: "positive",
      impact: "high",
      time: "15 min ago"
    },
    {
      headline: "Tech Giants Report Strong Q3 Earnings",
      sentiment: "positive",
      impact: "medium",
      time: "1 hour ago"
    },
    {
      headline: "Oil Prices Surge Amid Supply Concerns",
      sentiment: "negative",
      impact: "medium",
      time: "2 hours ago"
    }
  ];

  return (
    <div className={`news-flash ${className || ''}`}>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Market News</h3>
        <div className="space-y-3">
          {newsItems.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-3">
              <div className="text-sm font-medium text-white line-clamp-2">
                {item.headline}
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  item.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.sentiment}
                </span>
                <span className="text-xs text-gray-400">Impact: {item.impact}</span>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <button className="text-xs text-blue-400 hover:text-blue-300">
            View All News →
          </button>
        </div>
      </div>
    </div>
  );
};
