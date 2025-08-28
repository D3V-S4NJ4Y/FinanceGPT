import { useState, useEffect } from 'react';

export interface MarketDataPoint {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface MarketData {
  stocks: MarketDataPoint[];
  indices: MarketDataPoint[];
  crypto: MarketDataPoint[];
}

export const useMarketData = (symbols: string[] = ['AAPL', 'GOOGL', 'MSFT', 'TSLA']) => {
  const [marketData, setMarketData] = useState<MarketData>({
    stocks: [],
    indices: [],
    crypto: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      
      // Mock market data - replace with actual API calls
      const mockData: MarketDataPoint[] = symbols.map(symbol => ({
        symbol,
        price: Math.random() * 1000 + 100,
        change: Math.random() * 20 - 10,
        changePercent: Math.random() * 5 - 2.5,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString()
      }));

      setMarketData({
        stocks: mockData.filter(item => ['AAPL', 'GOOGL', 'MSFT', 'TSLA'].includes(item.symbol)),
        indices: mockData.filter(item => ['SPY', 'QQQ', 'DIA'].includes(item.symbol)),
        crypto: mockData.filter(item => ['BTC', 'ETH', 'ADA'].includes(item.symbol))
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    
    return () => clearInterval(interval);
  }, [symbols.join(',')]);

  return {
    marketData,
    isLoading,
    error,
    refresh: fetchMarketData
  };
};
