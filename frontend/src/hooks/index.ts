import { useState, useEffect } from 'react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  lastUpdate: string;
  performance: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface Signal {
  id: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  confidence: number;
  price: number;
  timestamp: string;
  agent: string;
}

// Custom hook for real-time data
export function useRealTimeData() {
  const [data, setData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Mock real-time data updates
    const interval = setInterval(() => {
      setData(prev => [...prev, { timestamp: new Date().toISOString(), value: Math.random() * 100 }]);
      setIsConnected(true);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { data, isConnected };
}

// Custom hook for market data
export function useMarketData() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock market data
    setTimeout(() => {
      setMarketData([
        {
          symbol: 'AAPL',
          price: 175.43,
          change: 2.15,
          changePercent: 1.24,
          volume: 45234567,
          timestamp: new Date().toISOString()
        },
        {
          symbol: 'MSFT',
          price: 384.52,
          change: -1.23,
          changePercent: -0.32,
          volume: 23456789,
          timestamp: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return { marketData, loading, error };
}

// Custom hook for AI agents
export function useAgents() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Mock agents data
    setAgents([
      {
        id: '1',
        name: 'Market Sentinel',
        status: 'active',
        lastUpdate: new Date().toISOString(),
        performance: 85.3
      },
      {
        id: '2',
        name: 'Risk Assessor',
        status: 'active',
        lastUpdate: new Date().toISOString(),
        performance: 78.9
      }
    ]);

    setAlerts([
      {
        id: '1',
        type: 'warning',
        message: 'High volatility detected in tech sector',
        timestamp: new Date().toISOString(),
        severity: 'medium'
      }
    ]);
  }, []);

  return { agents, alerts };
}

// Custom hook for WebSocket
export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);

  useEffect(() => {
    // Mock WebSocket connection
    const mockSocket = {
      readyState: WebSocket.OPEN,
      send: (data: string) => console.log('Sending:', data),
      close: () => console.log('Closing connection'),
      addEventListener: () => {},
      removeEventListener: () => {}
    } as any;

    setSocket(mockSocket);
    setReadyState(WebSocket.OPEN);

    // Mock incoming messages
    const interval = setInterval(() => {
      setLastMessage({
        type: 'market_update',
        data: { symbol: 'AAPL', price: Math.random() * 200 },
        timestamp: new Date().toISOString()
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [url]);

  return { socket, lastMessage, readyState };
}
