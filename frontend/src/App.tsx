import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Zap, MessageSquare, Grid, Settings, PieChart, Newspaper, Activity, Brain, Menu, X } from 'lucide-react';
import CommandCenter from './components/CommandCenter';
import MarketMap from './components/MarketMap';
import AgentChat from './components/AgentChat';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import TradingTerminal from './components/advanced/TradingTerminal';
import AdvancedPortfolioAnalytics from './components/advanced/AdvancedPortfolioAnalytics';
import RealTimeNewsCenter from './components/advanced/RealTimeNewsCenter';
import SuperAdvancedDashboard from './components/advanced/SuperAdvancedDashboard_simple';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: string;
}

interface AgentData {
  market_sentiment: any;
  news_intelligence: any;
  risk_assessor: any;
  signal_generator: any;
  compliance_guardian: any;
  executive_summary: any;
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ai-center' | 'trading' | 'portfolio' | 'news' | 'market' | 'chat' | 'analytics'>('dashboard');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [agentData, setAgentData] = useState<AgentData>({
    market_sentiment: null,
    news_intelligence: null,
    risk_assessor: null,
    signal_generator: null,
    compliance_guardian: null,
    executive_summary: null
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // WebSocket connection for real-time data
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: number;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:8001/ws/market-feed');
        
        ws.onopen = () => {
          console.log('✅ WebSocket connected');
          setIsConnected(true);
          
          // Subscribe to market data
          ws.send(JSON.stringify({
            type: 'subscribe',
            channel: 'market_data'
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'market_update') {
              setMarketData(data.data);
              setLastUpdate(new Date());
            }
          } catch (error) {
            console.error('WebSocket message parse error:', error);
          }
        };

        ws.onclose = () => {
          console.log('❌ WebSocket disconnected');
          setIsConnected(false);
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // AI Agent polling for real-time updates
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
        
        // Fetch all agent data in parallel
        const [
          marketSentiment,
          newsIntelligence,
          riskAssessment,
          signalGeneration,
          complianceCheck,
          executiveSummary
        ] = await Promise.all([
          fetch('http://localhost:8001/api/agents/market-sentinel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbols, timeframe: '1d' })
          }).then(res => res.json()).catch(err => ({ error: err.message })),
          
          fetch('http://localhost:8001/api/agents/news-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbols })
          }).then(res => res.json()).catch(err => ({ error: err.message })),
          
          fetch('http://localhost:8001/api/agents/risk-assessor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              portfolio: [
                { symbol: 'AAPL', quantity: 100, value: 17523 },
                { symbol: 'MSFT', quantity: 50, value: 16944 },
                { symbol: 'GOOGL', quantity: 25, value: 3364 }
              ]
            })
          }).then(res => res.json()).catch(err => ({ error: err.message })),
          
          fetch('http://localhost:8001/api/agents/signal-generator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbols, risk_tolerance: 'medium' })
          }).then(res => res.json()).catch(err => ({ error: err.message })),
          
          fetch('http://localhost:8001/api/agents/compliance-guardian', {
            method: 'GET'
          }).then(res => res.json()).catch(err => ({ error: err.message })),
          
          fetch('http://localhost:8001/api/agents/executive-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              marketData: marketData,
              analysisData: {} 
            })
          }).then(res => res.json()).catch(err => ({ error: err.message }))
        ]);

        setAgentData({
          market_sentiment: marketSentiment,
          news_intelligence: newsIntelligence,
          risk_assessor: riskAssessment,
          signal_generator: signalGeneration,
          compliance_guardian: complianceCheck,
          executive_summary: executiveSummary
        });
        
      } catch (error) {
        console.error('Error fetching agent data:', error);
      }
    };

    // Initial fetch
    fetchAgentData();
    
    // Set up polling every 10 seconds
    const interval = setInterval(fetchAgentData, 10000);
    
    return () => clearInterval(interval);
  }, [marketData]); // Re-run when market data changes

  const navigationItems = [
    { id: 'dashboard', label: 'Command Center', icon: <Grid className="w-5 h-5" /> },
    { id: 'ai-center', label: 'AI Intelligence', icon: <Brain className="w-5 h-5" /> },
    { id: 'trading', label: 'Trading Terminal', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'portfolio', label: 'Portfolio Analytics', icon: <PieChart className="w-5 h-5" /> },
    { id: 'news', label: 'News Center', icon: <Newspaper className="w-5 h-5" /> },
    { id: 'market', label: '3D Market Map', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="w-5 h-5" /> }
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <CommandCenter />
          </ErrorBoundary>
        );
      case 'ai-center':
        return (
          <ErrorBoundary>
            <SuperAdvancedDashboard />
          </ErrorBoundary>
        );
      case 'trading':
        return (
          <ErrorBoundary>
            <TradingTerminal />
          </ErrorBoundary>
        );
      case 'portfolio':
        return (
          <ErrorBoundary>
            <AdvancedPortfolioAnalytics />
          </ErrorBoundary>
        );
      case 'news':
        return (
          <ErrorBoundary>
            <RealTimeNewsCenter />
          </ErrorBoundary>
        );
      case 'market':
        return (
          <ErrorBoundary>
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
              <MarketMap />
            </div>
          </ErrorBoundary>
        );
      case 'chat':
        return (
          <ErrorBoundary>
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
              <div className="max-w-4xl mx-auto">
                <AgentChat />
              </div>
            </div>
          </ErrorBoundary>
        );
      case 'analytics':
        return (
          <ErrorBoundary>
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
              <AdvancedAnalytics />
            </div>
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <CommandCenter />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Mobile Navigation Header */}
      <nav className="bg-black/30 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                FinanceGPT Live
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-2 xl:space-x-4">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`flex items-center space-x-2 px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className="hidden xl:block">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Button + Status */}
            <div className="flex items-center space-x-3">
              {/* Connection Status - Always visible but responsive */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-gray-300">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 hidden md:block">
                  {lastUpdate.toLocaleTimeString()}
                </div>
              </div>

              {/* Mobile Status Indicator */}
              <div className="sm:hidden flex items-center">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-700 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center space-y-1 p-3 rounded-lg text-xs font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {item.icon}
                    <span className="text-center leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Mobile Status Information */}
              <div className="mt-4 pt-4 border-t border-gray-700 sm:hidden">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Status: {isConnected ? 'Connected' : 'Disconnected'}</span>
                  <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
