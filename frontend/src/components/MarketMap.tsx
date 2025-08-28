import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Globe } from 'lucide-react';

interface MarketBubble {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  sector: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

const MarketMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [selectedBubble, setSelectedBubble] = useState<MarketBubble | null>(null);
  const [marketBubbles, setMarketBubbles] = useState<MarketBubble[]>([]);
  const [viewMode, setViewMode] = useState<'sector' | 'performance' | 'volume'>('performance');

  const sectors = {
    'Technology': '#3B82F6',
    'Healthcare': '#10B981',
    'Finance': '#F59E0B',
    'Energy': '#EF4444',
    'Consumer': '#8B5CF6',
    'Industrial': '#6B7280'
  };

  // Helper function to get CSS class for colors
  const getColorClass = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      '#3B82F6': 'asset-color-blue',
      '#10B981': 'asset-color-green',
      '#F59E0B': 'asset-color-yellow',
      '#EF4444': 'asset-color-red',
      '#8B5CF6': 'asset-color-purple',
      '#6B7280': 'asset-color-gray'
    };
    return colorMap[color] || 'asset-color-gray';
  };

  useEffect(() => {
    const bubbles: MarketBubble[] = [
      { symbol: 'AAPL', price: 175.23, change: 1.42, volume: 45234567, marketCap: 2800, sector: 'Technology', x: 0, y: 0, size: 0, color: '' },
      { symbol: 'MSFT', price: 338.89, change: -0.36, volume: 32145678, marketCap: 2400, sector: 'Technology', x: 0, y: 0, size: 0, color: '' },
      { symbol: 'GOOGL', price: 134.56, change: 0.67, volume: 28934567, marketCap: 1600, sector: 'Technology', x: 0, y: 0, size: 0, color: '' },
      { symbol: 'TSLA', price: 251.34, change: 2.31, volume: 67234567, marketCap: 800, sector: 'Consumer', x: 0, y: 0, size: 0, color: '' },
      { symbol: 'NVDA', price: 456.78, change: -0.75, volume: 45123456, marketCap: 1100, sector: 'Technology', x: 0, y: 0, size: 0, color: '' },
      { symbol: 'JPM', price: 145.67, change: 0.23, volume: 12345678, marketCap: 420, sector: 'Finance', x: 0, y: 0, size: 0, color: '' },
      { symbol: 'JNJ', price: 162.45, change: -0.12, volume: 8765432, marketCap: 430, sector: 'Healthcare', x: 0, y: 0, size: 0, color: '' },
      { symbol: 'XOM', price: 98.23, change: 1.85, volume: 15678901, marketCap: 400, sector: 'Energy', x: 0, y: 0, size: 0, color: '' },
    ];

    // Position and style bubbles based on view mode
    bubbles.forEach((bubble, index) => {
      const angle = (index / bubbles.length) * 2 * Math.PI;
      const radius = 100 + Math.random() * 80;
      
      bubble.x = 300 + Math.cos(angle) * radius;
      bubble.y = 250 + Math.sin(angle) * radius;
      
      // Size based on market cap
      bubble.size = Math.max(20, Math.min(60, (bubble.marketCap / 3000) * 60));
      
      // Color based on view mode
      switch (viewMode) {
        case 'performance':
          bubble.color = bubble.change > 0 ? '#10B981' : bubble.change < 0 ? '#EF4444' : '#6B7280';
          break;
        case 'sector':
          bubble.color = sectors[bubble.sector as keyof typeof sectors] || '#6B7280';
          break;
        case 'volume':
          const volumeIntensity = Math.min(255, (bubble.volume / 70000000) * 255);
          bubble.color = `rgba(59, 130, 246, ${volumeIntensity / 255})`;
          break;
      }
    });

    setMarketBubbles(bubbles);
  }, [viewMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(107, 114, 128, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw bubbles
      marketBubbles.forEach((bubble) => {
        // Bubble shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // Bubble
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, 2 * Math.PI);
        ctx.fillStyle = bubble.color;
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Bubble border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Symbol text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(bubble.symbol, bubble.x, bubble.y - 5);

        // Change text
        ctx.font = '10px Arial';
        ctx.fillStyle = bubble.change > 0 ? '#10B981' : bubble.change < 0 ? '#EF4444' : '#6B7280';
        ctx.fillText(`${bubble.change > 0 ? '+' : ''}${bubble.change.toFixed(2)}%`, bubble.x, bubble.y + 8);

        // Animated rings for active stocks
        if (Math.abs(bubble.change) > 1) {
          const time = Date.now() * 0.005;
          const ringRadius = bubble.size + 10 + Math.sin(time + bubble.x) * 5;
          ctx.strokeStyle = `rgba(${bubble.change > 0 ? '16, 185, 129' : '239, 68, 68'}, 0.3)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, ringRadius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [marketBubbles]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedBubble = marketBubbles.find(bubble => {
      const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
      return distance <= bubble.size;
    });

    setSelectedBubble(clickedBubble || null);
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center text-white">
          <Globe className="w-6 h-6 mr-2 text-blue-400" />
          3D Market Visualization
        </h2>
        <div className="flex space-x-2">
          {(['performance', 'sector', 'volume'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={500}
          className="w-full h-auto bg-gray-900/50 rounded-lg cursor-pointer"
          onClick={handleCanvasClick}
        />

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-sm">
          <h4 className="font-semibold text-white mb-2">Legend</h4>
          {viewMode === 'performance' && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Positive Change</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-300">Negative Change</span>
              </div>
            </div>
          )}
          {viewMode === 'sector' && (
            <div className="space-y-1">
              {Object.entries(sectors).map(([sector, color]) => (
                <div key={sector} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getColorClass(color)}`}></div>
                  <span className="text-gray-300">{sector}</span>
                </div>
              ))}
            </div>
          )}
          {viewMode === 'volume' && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full opacity-100"></div>
                <span className="text-gray-300">High Volume</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full opacity-50"></div>
                <span className="text-gray-300">Low Volume</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Bubble Info */}
        {selectedBubble && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 min-w-48">
            <h4 className="font-bold text-lg text-white mb-2">{selectedBubble.symbol}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span className="text-white">${selectedBubble.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Change:</span>
                <span className={selectedBubble.change > 0 ? 'text-green-400' : 'text-red-400'}>
                  {selectedBubble.change > 0 ? '+' : ''}{selectedBubble.change.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Volume:</span>
                <span className="text-white">{(selectedBubble.volume / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap:</span>
                <span className="text-white">${selectedBubble.marketCap}B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sector:</span>
                <span className="text-white">{selectedBubble.sector}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Market Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Gainers</span>
          </div>
          <p className="text-xl font-bold text-white">
            {marketBubbles.filter(b => b.change > 0).length}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-center space-x-2 text-red-400">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-semibold">Decliners</span>
          </div>
          <p className="text-xl font-bold text-white">
            {marketBubbles.filter(b => b.change < 0).length}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-center space-x-2 text-blue-400">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-semibold">Total Vol</span>
          </div>
          <p className="text-xl font-bold text-white">
            {(marketBubbles.reduce((sum, b) => sum + b.volume, 0) / 1000000000).toFixed(1)}B
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketMap;
