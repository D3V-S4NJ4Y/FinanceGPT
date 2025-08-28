import React from 'react';

interface SentimentPulseProps {
  timeframe?: string;
  className?: string;
}

export const SentimentPulse: React.FC<SentimentPulseProps> = ({ timeframe, className }) => {
  const sentimentScore = 0.68; // Mock sentiment score

  return (
    <div className={`sentiment-pulse ${className || ''}`}>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Market Sentiment</h3>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-2xl font-bold text-green-400">
              {(sentimentScore * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">Bullish</div>
          </div>
          <div className="w-16 h-16">
            <svg className="transform -rotate-90" width="64" height="64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#374151"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#10b981"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28 * sentimentScore} ${2 * Math.PI * 28}`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Based on news analysis and social media trends
        </div>
      </div>
    </div>
  );
};
