import { useState, useEffect } from 'react';

export interface AgentSignal {
  id: string;
  agentName: string;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'WARNING';
  confidence: number;
  description: string;
  timestamp: string;
  symbol?: string;
  metadata?: Record<string, any>;
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastUpdate: string;
  signalsCount: number;
  description?: string;
  messageCount?: number;
  uptime?: number;
  successRate?: number;
}

export const useAgents = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([
    { 
      id: '1',
      name: 'Market Sentinel', 
      status: 'active', 
      lastUpdate: new Date().toISOString(), 
      signalsCount: 0,
      description: 'Real-time market monitoring',
      messageCount: 245,
      uptime: 24,
      successRate: 98
    },
    { 
      id: '2',
      name: 'News Intelligence', 
      status: 'active', 
      lastUpdate: new Date().toISOString(), 
      signalsCount: 0,
      description: 'News sentiment analysis',
      messageCount: 189,
      uptime: 23,
      successRate: 95
    },
    { 
      id: '3',
      name: 'Risk Assessor', 
      status: 'active', 
      lastUpdate: new Date().toISOString(), 
      signalsCount: 0,
      description: 'Portfolio risk analysis',
      messageCount: 67,
      uptime: 24,
      successRate: 97
    },
    { 
      id: '4',
      name: 'Signal Generator', 
      status: 'active', 
      lastUpdate: new Date().toISOString(), 
      signalsCount: 0,
      description: 'Trading signal generation',
      messageCount: 134,
      uptime: 22,
      successRate: 93
    },
    { 
      id: '5',
      name: 'Compliance Guardian', 
      status: 'active', 
      lastUpdate: new Date().toISOString(), 
      signalsCount: 0,
      description: 'Regulatory compliance monitoring',
      messageCount: 45,
      uptime: 24,
      successRate: 99
    },
    { 
      id: '6',
      name: 'Executive Summary', 
      status: 'active', 
      lastUpdate: new Date().toISOString(), 
      signalsCount: 0,
      description: 'Executive reporting and insights',
      messageCount: 28,
      uptime: 24,
      successRate: 96
    }
  ]);

  const [signals, setSignals] = useState<AgentSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgentData = async () => {
    try {
      setIsLoading(true);
      
      // Mock agent signals - replace with actual API calls
      const mockSignals: AgentSignal[] = [
        {
          id: '1',
          agentName: 'Market Sentinel',
          signal: 'BUY',
          confidence: 0.85,
          description: 'Strong bullish momentum detected',
          timestamp: new Date().toISOString(),
          symbol: 'AAPL'
        },
        {
          id: '2',
          agentName: 'News Intelligence',
          signal: 'WARNING',
          confidence: 0.72,
          description: 'Negative sentiment spike in tech sector',
          timestamp: new Date().toISOString(),
          symbol: 'TECH'
        }
      ];

      setSignals(mockSignals);
      
      // Update agent status
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'active' as const,
        lastUpdate: new Date().toISOString(),
        signalsCount: mockSignals.filter(s => s.agentName === agent.name).length
      })));
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
    
    // Refresh data every 10 seconds
    const interval = setInterval(fetchAgentData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleAgent = (agentName: string) => {
    setAgents(prev => prev.map(agent => 
      agent.name === agentName 
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
        : agent
    ));
  };

  return {
    agents,
    signals,
    isLoading,
    error,
    toggleAgent,
    refresh: fetchAgentData
  };
};
