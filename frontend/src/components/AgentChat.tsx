import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Brain, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agent?: string;
  data?: any;
}

interface Agent {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  specialty: string;
}

const AgentChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('auto');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents: Agent[] = [
    { id: 'market_sentinel', name: 'Market Sentinel', icon: <TrendingUp className="w-4 h-4" />, color: 'text-blue-400', specialty: 'Market Analysis' },
    { id: 'news_intelligence', name: 'News Intelligence', icon: <Brain className="w-4 h-4" />, color: 'text-purple-400', specialty: 'News Analysis' },
    { id: 'risk_assessor', name: 'Risk Assessor', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-400', specialty: 'Risk Management' },
    { id: 'signal_generator', name: 'Signal Generator', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-400', specialty: 'Trading Signals' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: '1',
      type: 'agent',
      content: 'Welcome to FinanceGPT Live! I\'m your AI assistant. Ask me about market trends, risk analysis, or trading signals. How can I help you today?',
      timestamp: new Date(),
      agent: 'system'
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        {
          content: "Based on current market analysis, I'm seeing strong bullish momentum in tech stocks. Apple (AAPL) is showing a breakout pattern above $175 resistance level.",
          agent: 'market_sentinel',
          data: { confidence: 94.2, signal: 'bullish', timeframe: '1D' }
        },
        {
          content: "Recent news sentiment analysis indicates positive outlook for renewable energy sector. Tesla's latest earnings report exceeded expectations by 12%.",
          agent: 'news_intelligence',
          data: { sentiment: 0.75, articles_analyzed: 245 }
        },
        {
          content: "Portfolio risk assessment shows current VaR at 2.3% with diversification score of 85%. Recommended position sizing for volatile assets: 5-7%.",
          agent: 'risk_assessor',
          data: { var_95: 2.3, diversification: 85, recommendation: 'moderate' }
        },
        {
          content: "New trading signal generated: BUY NVDA at $456.78 with target $485 and stop-loss at $440. Expected reward-to-risk ratio: 2.1:1.",
          agent: 'signal_generator',
          data: { action: 'BUY', symbol: 'NVDA', target: 485, stop_loss: 440, confidence: 87 }
        }
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: randomResponse.content,
        timestamp: new Date(),
        agent: randomResponse.agent,
        data: randomResponse.data
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAgentInfo = (agentId: string) => {
    return agents.find(a => a.id === agentId);
  };

  const quickQuestions = [
    "What's the market sentiment today?",
    "Show me high-risk stocks",
    "Any breaking news affecting tech stocks?",
    "Generate trading signals for FAANG stocks",
    "What's my portfolio risk level?",
    "Analyze NVDA technical patterns"
  ];

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-gray-700 h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Financial Assistant</h3>
            <p className="text-sm text-gray-400">Powered by 6 specialized agents</p>
          </div>
        </div>
        
        {/* Agent Selector */}
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm border border-gray-600"
          title="Select AI Agent"
          aria-label="Select AI agent to chat with"
        >
          <option value="auto">Auto-select Agent</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-blue-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`rounded-2xl px-4 py-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-100'
              }`}>
                {/* Agent Info */}
                {message.type === 'agent' && message.agent && message.agent !== 'system' && (
                  <div className="flex items-center space-x-2 mb-2 text-xs">
                    {getAgentInfo(message.agent)?.icon}
                    <span className={getAgentInfo(message.agent)?.color}>
                      {getAgentInfo(message.agent)?.name}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">
                      {getAgentInfo(message.agent)?.specialty}
                    </span>
                  </div>
                )}

                <p className="text-sm leading-relaxed">{message.content}</p>

                {/* Data Pills */}
                {message.data && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(message.data).map(([key, value]) => (
                      <div key={key} className="bg-gray-700 rounded-full px-2 py-1 text-xs">
                        <span className="text-gray-400">{key}:</span>
                        <span className="text-white ml-1">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="typing-dot-1"></div>
                  <div className="typing-dot-2"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickQuestions.slice(0, 3).map((question, index) => (
            <button
              key={index}
              onClick={() => setInputValue(question)}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about markets, risks, signals, or news..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 flex items-center justify-center transition-colors"
            title="Send message"
            aria-label="Send message to AI agent"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
