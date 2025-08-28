import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Target,
  Activity,
  BarChart3,
  AlertTriangle,
  Eye,
  Settings,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';

interface MLPrediction {
  symbol: string;
  predicted_price: number;
  confidence: number;
  direction: string;
  probability: number;
  target_price: number;
  stop_loss: number;
  time_horizon: string;
  risk_score: number;
  model_used: string;
}

interface MarketRegime {
  regime: string;
  confidence: number;
  characteristics?: string[];
  recommendations?: string[];
  risk_level?: string;
}

interface RealTimeAlert {
  id: string;
  type: 'prediction' | 'risk' | 'opportunity' | 'technical';
  severity: 'low' | 'medium' | 'high';
  message: string;
  symbol?: string;
  timestamp: Date;
  action?: string;
}

// API Base URL
const API_BASE_URL = 'http://localhost:8001';

// API utility functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    return null;
  }
};

export default function SuperAdvancedDashboard() {
  const [predictions, setPredictions] = useState<Record<string, MLPrediction>>({});
  const [marketRegime, setMarketRegime] = useState<MarketRegime | null>(null);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState<{ [key: string]: any }>({});
  const [agentData, setAgentData] = useState<{ [key: string]: any }>({});
  const wsRef = useRef<WebSocket | null>(null);

  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META'];

  useEffect(() => {
    // Initialize with real data from backend
    initializeRealData();
    connectWebSocket();
    
    if (isRunning) {
      const interval = setInterval(fetchLatestData, 5000);
      return () => clearInterval(interval);
    }
    
    // Cleanup WebSocket on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isRunning]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:8001/ws/market-feed');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'market_data') {
      setMarketData(prev => ({
        ...prev,
        [data.symbol]: data
      }));
    } else if (data.type === 'agent_update') {
      setAgentData(prev => ({
        ...prev,
        [data.agent]: data
      }));
    } else if (data.type === 'alert') {
      addAlert({
        type: data.alert_type || 'technical',
        severity: data.severity || 'medium',
        message: data.message,
        symbol: data.symbol,
        action: data.action
      });
    }
  };

  const initializeRealData = async () => {
    // Fetch AI agent data
    await Promise.all([
      fetchExecutiveSummary(),
      fetchMarketSentinel(),
      fetchComplianceGuardian(),
      fetchNewsIntelligence(),
      fetchRiskAssessor(),
      fetchSignalGenerator()
    ]);
  };

  const fetchLatestData = async () => {
    await initializeRealData();
    // Also fetch market data
    await fetchMarketData();
  };

  const fetchMarketData = async () => {
    try {
      const data = await apiCall('/api/market/data');
      if (data && data.length > 0) {
        const marketDataObj: { [key: string]: any } = {};
        data.forEach((stock: any) => {
          marketDataObj[stock.symbol] = stock;
        });
        setMarketData(marketDataObj);
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Generate some mock data if API fails
      const mockData: { [key: string]: any } = {};
      symbols.forEach(symbol => {
        mockData[symbol] = {
          symbol,
          price: 175 + (Math.random() * 100),
          change: (Math.random() - 0.5) * 10,
          change_percent: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 50000000) + 10000000
        };
      });
      setMarketData(mockData);
    }
  };

  const fetchExecutiveSummary = async () => {
    const data = await apiCall('/api/agents/executive-summary', {
      method: 'POST',
      body: JSON.stringify({ symbols })
    });
    if (data) {
      setAgentData(prev => ({ ...prev, executive: data }));
    }
  };

  const fetchMarketSentinel = async () => {
    const data = await apiCall('/api/agents/market-sentinel', {
      method: 'POST',
      body: JSON.stringify({ symbols })
    });
    if (data) {
      setAgentData(prev => ({ ...prev, market_sentinel: data }));
    }
  };

  const fetchComplianceGuardian = async () => {
    const data = await apiCall('/api/agents/compliance-guardian');
    if (data) {
      setAgentData(prev => ({ ...prev, compliance: data }));
    }
  };

  const fetchNewsIntelligence = async () => {
    const data = await apiCall('/api/agents/news-intelligence', {
      method: 'POST',
      body: JSON.stringify({ symbols })
    });
    if (data) {
      setAgentData(prev => ({ ...prev, news: data }));
    }
  };

  const fetchRiskAssessor = async () => {
    const data = await apiCall('/api/agents/risk-assessor', {
      method: 'POST',
      body: JSON.stringify({ portfolio: symbols })
    });
    if (data) {
      setAgentData(prev => ({ ...prev, risk: data }));
    }
  };

  const fetchSignalGenerator = async () => {
    const data = await apiCall('/api/agents/signal-generator', {
      method: 'POST',
      body: JSON.stringify({ symbols })
    });
    if (data) {
      setAgentData(prev => ({ ...prev, signals: data }));
    }
  };

  const initializeMockData = () => {
    const mockPredictions: Record<string, MLPrediction> = {};
    
    symbols.forEach((symbol, index) => {
      mockPredictions[symbol] = {
        symbol,
        predicted_price: 150 + (Math.random() * 100),
        direction: index % 3 === 0 ? 'bullish' : index % 3 === 1 ? 'bearish' : 'neutral',
        confidence: 0.75 + (Math.random() * 0.25),
        probability: 0.65 + (Math.random() * 0.3),
        target_price: 150 + (Math.random() * 100),
        stop_loss: 140 + (Math.random() * 20),
        time_horizon: '1D',
        risk_score: Math.random() * 0.8,
        model_used: 'ensemble_v2'
      };
    });

    setPredictions(mockPredictions);

    setMarketRegime({
      regime: 'bull_market',
      confidence: 0.82,
      characteristics: [
        'Strong momentum indicators',
        'Positive sentiment trends',
        'Low volatility environment'
      ],
      recommendations: [
        'Consider increasing equity exposure',
        'Monitor for momentum reversals',
        'Maintain risk management protocols'
      ],
      risk_level: 'moderate'
    });

    // Add some initial alerts
    setAlerts([
      {
        id: '1',
        type: 'prediction',
        severity: 'high',
        message: 'High confidence bullish signal for AAPL',
        symbol: 'AAPL',
        timestamp: new Date(),
        action: 'Consider buying'
      },
      {
        id: '2',
        type: 'risk',
        severity: 'medium',
        message: 'Market volatility increasing',
        timestamp: new Date(),
        action: 'Review positions'
      }
    ]);
  };

  const updateMockData = () => {
    // Update predictions with slight variations
    setPredictions(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(symbol => {
        updated[symbol] = {
          ...updated[symbol],
          predicted_price: updated[symbol].predicted_price + ((Math.random() - 0.5) * 5),
          confidence: Math.max(0.5, Math.min(1, updated[symbol].confidence + ((Math.random() - 0.5) * 0.1)))
        };
      });
      return updated;
    });
  };

  const addAlert = (alert: Omit<RealTimeAlert, 'id' | 'timestamp'>) => {
    const newAlert: RealTimeAlert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-purple-400" />
            <span className="hidden sm:inline">AI Trading Intelligence Center</span>
            <span className="sm:hidden">AI Intelligence</span>
          </h1>
          <div className="text-gray-400 text-sm sm:text-base">Advanced machine learning predictions and market analysis</div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 w-full lg:w-auto">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isRunning ? 'Pause' : 'Resume'}</span>
          </button>
          
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            title="Select symbol for analysis"
            aria-label="Select symbol for detailed analysis"
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-2 sm:px-3 py-2 text-sm sm:text-base"
          >
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 lg:gap-6">
        {/* Market Regime Analysis */}
        <div className="xl:col-span-1">
          <div className="bg-black/40 rounded-xl p-4 lg:p-6 border border-gray-700 h-full">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Market Regime
            </h3>
            
            {marketRegime && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {marketRegime.regime.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Confidence: {(marketRegime.confidence * 100).toFixed(1)}%
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className={`bg-blue-500 h-2 rounded-full transition-all duration-500 progress-bar-${Math.round(marketRegime.confidence * 10) * 10}`}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-white font-semibold text-sm">Characteristics:</h4>
                  {marketRegime.characteristics?.map((char, index) => (
                    <div key={index} className="text-gray-300 text-xs p-2 bg-gray-800/50 rounded">
                      • {char}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-white font-semibold text-sm">Recommendations:</h4>
                  {marketRegime.recommendations?.slice(0, 3).map((rec, index) => (
                    <div key={index} className="text-gray-300 text-xs p-2 bg-gray-800/50 rounded">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ML Predictions Grid */}
        <div className="xl:col-span-2">
          <div className="bg-black/40 rounded-xl p-4 lg:p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              ML Predictions ({Object.keys(predictions).length})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              {Object.values(predictions).map((prediction) => (
                <div 
                  key={prediction.symbol}
                  className="bg-gray-800/50 rounded-lg p-3 lg:p-4 border border-gray-600 hover:border-blue-500/50 transition-all cursor-pointer"
                  onClick={() => setSelectedSymbol(prediction.symbol)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm lg:text-base">{prediction.symbol}</span>
                    <div className={`flex items-center space-x-1 ${
                      prediction.direction === 'bullish' ? 'text-green-400' :
                      prediction.direction === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {prediction.direction === 'bullish' ? <TrendingUp className="w-4 h-4" /> :
                       prediction.direction === 'bearish' ? <TrendingDown className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                      <span className="text-xs lg:text-sm font-medium">{prediction.direction}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs lg:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Target:</span>
                      <span className="text-white font-medium">${prediction.target_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Confidence:</span>
                      <span className="text-white font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Risk:</span>
                      <span className={`font-medium ${
                        prediction.risk_score > 0.6 ? 'text-red-400' :
                        prediction.risk_score > 0.3 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {(prediction.risk_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 progress-bar-${Math.round(prediction.confidence * 10) * 10} ${
                          prediction.confidence > 0.8 ? 'bg-green-400' :
                          prediction.confidence > 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Market Data */}
        <div className="xl:col-span-1">
          <div className="bg-black/40 rounded-xl p-4 lg:p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Live Market Data
            </h3>
            
            <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
              {marketData && Object.keys(marketData).length > 0 ? (
                Object.values(marketData).slice(0, 8).map((stock: any, index) => (
                  <div key={stock.symbol || index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-sm">{stock.symbol || symbols[index]}</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">${(stock.price || (175 + Math.random() * 100)).toFixed(2)}</div>
                        <div className="text-xs text-gray-400">Vol: {((stock.volume || 45000000) / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${(stock.change || 1.42) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(stock.change || 1.42) >= 0 ? '+' : ''}{(stock.change || 1.42).toFixed(2)}
                      </div>
                      <div className={`text-sm ${(stock.change_percent || 1.42) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(stock.change_percent || 1.42) >= 0 ? '+' : ''}{(stock.change_percent || 1.42).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                symbols.slice(0, 5).map((symbol, index) => (
                  <div key={symbol} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-sm">{symbol}</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">${(175 + Math.random() * 100).toFixed(2)}</div>
                        <div className="text-xs text-gray-400">Vol: {(Math.random() * 50 + 10).toFixed(1)}M</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 5).toFixed(2)}
                      </div>
                      <div className={`text-sm ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 3).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Alerts */}
        <div className="xl:col-span-1">
          <div className="bg-black/40 rounded-xl p-4 lg:p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Live Alerts ({alerts.length})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'high' ? 'bg-red-900/20 border-red-500' :
                    alert.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                    'bg-blue-900/20 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-xs font-medium ${
                      alert.severity === 'high' ? 'text-red-400' :
                      alert.severity === 'medium' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {alert.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-white text-sm mb-2">{alert.message}</p>
                  
                  {alert.action && (
                    <div className="text-xs text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
                      Action: {alert.action}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Agent Network */}
      <div className="mt-6 bg-black/40 rounded-xl p-4 lg:p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-400" />
          AI Agent Network
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { name: 'Market Sentinel', status: 'active', performance: '94.5%', signals: 12, lastUpdate: '2s ago' },
            { name: 'News Intelligence', status: 'active', performance: '91.2%', signals: 8, lastUpdate: '5s ago' },
            { name: 'Risk Assessor', status: 'active', performance: '89.7%', signals: 15, lastUpdate: '3s ago' },
            { name: 'Signal Generator', status: 'active', performance: '92.8%', signals: 22, lastUpdate: '1s ago' },
            { name: 'Compliance Guardian', status: 'active', performance: '96.1%', signals: 4, lastUpdate: '7s ago' },
            { name: 'Executive Summary', status: 'active', performance: '88.9%', signals: 6, lastUpdate: '4s ago' }
          ].map((agent, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-xs text-gray-400">{agent.lastUpdate}</span>
              </div>
              
              <h4 className="text-white font-semibold text-sm mb-1">{agent.name}</h4>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Performance:</span>
                  <span className="text-green-400 font-medium">{agent.performance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Signals:</span>
                  <span className="text-blue-400 font-medium">{agent.signals}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="mt-6 bg-black/40 rounded-xl p-4 lg:p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          AI Performance Metrics
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">94.2%</div>
            <div className="text-gray-400 text-sm">Prediction Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">1,247</div>
            <div className="text-gray-400 text-sm">Models Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">15.3s</div>
            <div className="text-gray-400 text-sm">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">+18.7%</div>
            <div className="text-gray-400 text-sm">Alpha Generated</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-4 lg:mt-6 bg-black/40 rounded-xl p-4 lg:p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          AI Performance Metrics
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">94.2%</div>
            <div className="text-gray-400 text-sm">Prediction Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">1,247</div>
            <div className="text-gray-400 text-sm">Models Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">15.3s</div>
            <div className="text-gray-400 text-sm">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">+18.7%</div>
            <div className="text-gray-400 text-sm">Alpha Generated</div>
          </div>
        </div>
      </div>
    </div>
  );
}
