import React from 'react';

interface MarketMapProps {
  data?: any;
  className?: string;
}

export const MarketMap: React.FC<MarketMapProps> = ({ data, className }) => {
  return (
    <div className={`market-map ${className || ''}`}>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Market Heatmap</h3>
        <div className="grid grid-cols-3 gap-2">
          {/* Mock heatmap data */}
          {[
            { symbol: 'AAPL', change: 2.3, color: 'bg-green-600' },
            { symbol: 'MSFT', change: 1.8, color: 'bg-green-500' },
            { symbol: 'GOOGL', change: -0.5, color: 'bg-red-500' },
            { symbol: 'AMZN', change: 0.9, color: 'bg-green-400' },
            { symbol: 'TSLA', change: -1.2, color: 'bg-red-600' },
            { symbol: 'NVDA', change: 3.4, color: 'bg-green-700' }
          ].map(item => (
            <div
              key={item.symbol}
              className={`${item.color} p-3 rounded text-white text-center`}
            >
              <div className="font-bold text-sm">{item.symbol}</div>
              <div className="text-xs">{item.change > 0 ? '+' : ''}{item.change}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
