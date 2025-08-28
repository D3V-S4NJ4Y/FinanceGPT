/**
 * 🎯 Command Center - Main Dashboard Component
 * ============================================
 * 
 * The central control hub for FinanceGPT Live featuring:
 * - Real-time market overview
 * - AI agent status monitoring
 * - Live data streams and alerts
 * - Interactive analytics dashboard
 * - Advanced visualization components
 * 
 * Built for IIT Hackathon 2025 🏆
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Brain,
  Zap,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Clock,
  Users,
  Shield,
  Cpu,
  Database,
  Wifi,
  Settings
} from 'lucide-react';

// Import sub-components
import { MarketMap } from './MarketMap';
import { SentimentPulse } from './SentimentPulse';
import { RiskRadar } from './RiskRadar';
import { SignalStream } from './SignalStream';
import { NewsFlash } from './NewsFlash';

// Import hooks and stores
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { useMarketData } from '@/hooks/useMarketData';
import { useAgents } from '@/hooks/useAgents';
import { useWebSocket } from '@/hooks/useWebSocket';

// Import types
import type { MarketData, AgentStatus, Alert, Signal, MarketMapProps, SentimentPulseProps, Timeframe } from '@/types';

interface CommandCenterProps {
  className?: string;
}

interface DashboardStats {
  totalValue: number;
  dailyChange: number;
  activeAlerts: number;
  signalsGenerated: number;
  agentsOnline: number;
  dataPointsProcessed: number;
}

const CommandCenter: React.FC<CommandCenterProps> = ({ className = '' }) => {
  // State management
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '5m' | '1h' | '1d'>('5m');
  const [dashboardLayout, setDashboardLayout] = useState<'grid' | 'cards' | 'compact'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Custom hooks for real-time data
  const { 
    marketData, 
    isLoading: marketLoading,
    error: marketError 
  } = useMarketData();
  
  const { 
    agents, 
    signals,
    isLoading: agentsLoading,
    toggleAgent 
  } = useAgents();
  
  const { 
    messageHistory, 
    sendMessage, 
    isConnected: wsConnected 
  } = useWebSocket('ws://localhost:8000/ws/live-feed');
  
  const { 
    data: liveData, 
    isLoading: streamLoading 
  } = useRealTimeData();

  // Computed dashboard statistics
  const dashboardStats: DashboardStats = useMemo(() => {
    const allStocks = [...(marketData.stocks || []), ...(marketData.indices || []), ...(marketData.crypto || [])];
    const totalValue = allStocks.reduce((sum: number, stock) => sum + (stock.price * stock.volume), 0);
    const dailyChange = allStocks.reduce((sum: number, stock) => sum + stock.change, 0);
    const activeAlerts = alerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical').length;
    const signalsGenerated = signals?.length || 0;
    const agentsOnline = agents.filter(agent => agent.status === 'active').length;
    const dataPointsProcessed = liveData?.marketData?.length || 0;

    return {
      totalValue,
      dailyChange,
      activeAlerts,
      signalsGenerated,
      agentsOnline,
      dataPointsProcessed
    };
  }, [marketData, alerts, liveData, agents, signals]);

  // WebSocket message handling
  useEffect(() => {
    if (messageHistory.length > 0) {
      const latestMessage = messageHistory[messageHistory.length - 1];
      
      // Handle different message types
      switch (latestMessage.type) {
        case 'market_alert':
          setAlerts(prev => [latestMessage.data, ...prev.slice(0, 99)]);
          break;
        case 'agent_status':
          // Agent status updates handled by useAgents hook
          break;
        case 'live_data':
          // Handled by useRealTimeData hook
          break;
      }
    }
  }, [messageHistory]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      sendMessage({ type: 'refresh_request', timestamp: Date.now() });
    }, 3000); // 3-second updates - fast but not overwhelming

    return () => clearInterval(interval);
  }, [autoRefresh, sendMessage]);

  // Render status indicators
  const renderConnectionStatus = () => (
    <div className="flex items-center space-x-4">
      <div className={`flex items-center space-x-2 ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
        <Wifi size={16} />
        <span className="text-sm font-medium">WebSocket</span>
        <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>
      <div className={`flex items-center space-x-2 ${!marketError ? 'text-green-400' : 'text-red-400'}`}>
        <Database size={16} />
        <span className="text-sm font-medium">Market Data</span>
        <div className={`w-2 h-2 rounded-full ${!marketError ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>
      <div className={`flex items-center space-x-2 ${liveData.isConnected ? 'text-blue-400' : 'text-gray-400'}`}>
        <Activity size={16} />
        <span className="text-sm font-medium">Streaming</span>
        <div className={`w-2 h-2 rounded-full ${liveData.isConnected ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`} />
      </div>
    </div>
  );

  // Render dashboard header
  const renderHeader = () => (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="w-8 h-8 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">FinanceGPT Command Center</h1>
              <p className="text-slate-400 text-sm">Real-time Financial Intelligence Platform</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {renderConnectionStatus()}
          
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-slate-400" />
            <span className="text-slate-300 text-sm font-mono">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // Render key metrics cards
  const renderKeyMetrics = () => {
    const metrics = [
      {
        icon: DollarSign,
        label: 'Portfolio Value',
        value: `$${dashboardStats.totalValue.toLocaleString()}`,
        change: dashboardStats.dailyChange,
        color: dashboardStats.dailyChange >= 0 ? 'text-green-400' : 'text-red-400'
      },
      {
        icon: AlertTriangle,
        label: 'Active Alerts',
        value: dashboardStats.activeAlerts.toString(),
        change: 0,
        color: dashboardStats.activeAlerts > 0 ? 'text-yellow-400' : 'text-green-400'
      },
      {
        icon: Zap,
        label: 'Signals Generated',
        value: dashboardStats.signalsGenerated.toString(),
        change: 0,
        color: 'text-blue-400'
      },
      {
        icon: Cpu,
        label: 'Agents Online',
        value: `${dashboardStats.agentsOnline}/${agents.length}`,
        change: 0,
        color: dashboardStats.agentsOnline === agents.length ? 'text-green-400' : 'text-yellow-400'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <metric.icon size={20} className={metric.color} />
                  <span className="text-slate-300 text-sm font-medium">{metric.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                {metric.change !== 0 && (
                  <div className={`flex items-center space-x-1 mt-2 ${metric.color}`}>
                    {metric.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-sm font-medium">
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Render main dashboard grid
  const renderDashboardGrid = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Market Overview */}
      <div className="lg:col-span-2 space-y-6">
        {/* Market Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Globe className="mr-2 text-blue-400" />
              Market Landscape
            </h3>
            <div className="flex space-x-2">
              {['1m', '5m', '1h', '1d'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf as any)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedTimeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <MarketMap 
            data={marketData} 
            className="h-80"
          />
        </motion.div>

        {/* Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-xl font-bold text-white flex items-center mb-4">
            <BarChart3 className="mr-2 text-green-400" />
            Market Sentiment Pulse
          </h3>
          <SentimentPulse 
            timeframe={selectedTimeframe}
            className="h-64"
          />
        </motion.div>
      </div>

      {/* Right Column - Live Feeds and Controls */}
      <div className="space-y-6">
        {/* Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-xl font-bold text-white flex items-center mb-4">
            <Shield className="mr-2 text-red-400" />
            Risk Radar
          </h3>
          <RiskRadar className="h-48" />
        </motion.div>

        {/* Live Signals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-xl font-bold text-white flex items-center mb-4">
            <Activity className="mr-2 text-blue-400" />
            Live Signal Stream
          </h3>
          <SignalStream className="h-64" />
        </motion.div>

        {/* News Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-xl font-bold text-white flex items-center mb-4">
            <Globe className="mr-2 text-yellow-400" />
            News Flash
          </h3>
          <NewsFlash className="h-64" />
        </motion.div>
      </div>
    </div>
  );

  // Render agent status panel
  const renderAgentStatus = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-slate-800 rounded-xl p-6 border border-slate-700 mt-8"
    >
      <h3 className="text-xl font-bold text-white flex items-center mb-6">
        <Brain className="mr-2 text-purple-400" />
        AI Agent Command Center
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">{agent.name}</span>
              <div className={`w-3 h-3 rounded-full ${
                agent.status === 'active' ? 'bg-green-400' : 
                agent.status === 'inactive' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
            </div>
            <p className="text-slate-300 text-sm mb-3">{agent.description || 'AI Agent running smoothly'}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Messages</span>
                <span className="text-white">{agent.messageCount || agent.signalsCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Uptime</span>
                <span className="text-white">{agent.uptime || 24}h</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Success Rate</span>
                <span className="text-green-400">{agent.successRate || 95}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-slate-900 ${className}`}>
      {renderHeader()}
      
      <div className="p-6">
        {renderKeyMetrics()}
        {renderDashboardGrid()}
        {renderAgentStatus()}
      </div>

      {/* Alert Notifications */}
      <AnimatePresence>
        {alerts.slice(0, 3).map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`fixed right-6 bg-slate-800 border rounded-lg p-4 shadow-lg z-50 ${
              alert.type === 'error' ? 'border-red-500' :
              alert.type === 'warning' ? 'border-yellow-500' : 'border-green-500'
            }`}
            style={{ top: `${120 + index * 80}px` }}
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle 
                size={20} 
                className={
                  alert.type === 'error' ? 'text-red-400' :
                  alert.type === 'warning' ? 'text-yellow-400' : 'text-green-400'
                } 
              />
              <div>
                <p className="font-semibold text-white">{alert.title || alert.type.toUpperCase()}</p>
                <p className="text-sm text-slate-300">{alert.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { CommandCenter };
