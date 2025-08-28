import { useState, useEffect } from 'react';

export interface RealTimeData {
  marketData: any[];
  newsData: any[];
  agentSignals: any[];
  isConnected: boolean;
  lastUpdate: string;
}

export const useRealTimeData = () => {
  const [data, setData] = useState<RealTimeData>({
    marketData: [],
    newsData: [],
    agentSignals: [],
    isConnected: false,
    lastUpdate: new Date().toISOString()
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate WebSocket connection
    const connect = () => {
      setIsLoading(true);
      
      try {
        // Mock real-time data updates
        const interval = setInterval(() => {
          setData(prevData => ({
            ...prevData,
            marketData: [
              { symbol: 'AAPL', price: 150 + Math.random() * 10, change: Math.random() * 4 - 2 },
              { symbol: 'GOOGL', price: 2800 + Math.random() * 100, change: Math.random() * 4 - 2 },
              { symbol: 'MSFT', price: 300 + Math.random() * 20, change: Math.random() * 4 - 2 },
            ],
            newsData: [
              { 
                headline: 'Market Update', 
                sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
                timestamp: new Date().toISOString()
              }
            ],
            agentSignals: [
              { 
                agent: 'MarketSentinel', 
                signal: 'BUY', 
                confidence: Math.random(),
                timestamp: new Date().toISOString()
              }
            ],
            isConnected: true,
            lastUpdate: new Date().toISOString()
          }));
        }, 5000);

        setIsLoading(false);
        setError(null);

        return () => clearInterval(interval);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed');
        setIsLoading(false);
      }
    };

    const cleanup = connect();
    return cleanup;
  }, []);

  return {
    data,
    isLoading,
    error,
    reconnect: () => window.location.reload()
  };
};
