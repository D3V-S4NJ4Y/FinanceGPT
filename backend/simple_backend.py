"""
Simplified FinanceGPT Backend for Hackathon Demo
Minimal dependencies version without complex imports
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import random
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="FinanceGPT Live API",
    description="Advanced Real-Time Financial AI Platform - IIT Hackathon 2025",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket manager for real-time updates
class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.market_data_task = None
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
    async def broadcast(self, message: dict):
        for connection in self.active_connections.copy():
            try:
                await connection.send_text(json.dumps(message))
            except:
                self.active_connections.remove(connection)

# Global WebSocket manager
websocket_manager = WebSocketManager()

# Sample market data
SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'SPY', 'QQQ']

def generate_market_data():
    """Generate realistic mock market data"""
    data = []
    for symbol in SYMBOLS:
        base_price = {
            'AAPL': 175.00, 'MSFT': 338.00, 'GOOGL': 134.50, 'AMZN': 127.00, 'TSLA': 248.00,
            'META': 296.00, 'NVDA': 430.00, 'NFLX': 390.00, 'SPY': 445.00, 'QQQ': 375.00
        }.get(symbol, 100.0)
        
        # Add some realistic price movement
        change_percent = random.uniform(-3.0, 3.0)
        current_price = base_price * (1 + change_percent / 100)
        change = current_price - base_price
        
        data.append({
            'symbol': symbol,
            'price': round(current_price, 2),
            'change': round(change, 2),
            'change_percent': round(change_percent, 2),
            'volume': random.randint(1000000, 50000000),
            'timestamp': datetime.now().isoformat()
        })
    
    return data

# Background task to send market updates
async def market_data_streamer():
    """Stream market data updates every 2 seconds"""
    while True:
        try:
            market_data = generate_market_data()
            await websocket_manager.broadcast({
                'type': 'market_update',
                'data': market_data,
                'timestamp': datetime.now().isoformat()
            })
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Error in market data streamer: {e}")
            await asyncio.sleep(1)

# Start background task when app starts
@app.on_event("startup")
async def startup_event():
    """Start background tasks"""
    asyncio.create_task(market_data_streamer())

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "FinanceGPT Live API - IIT Hackathon 2025",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Market data endpoint
@app.get("/api/market-data")
async def get_market_data():
    """Get current market data"""
    data = generate_market_data()
    return {
        "success": True,
        "data": {
            "stocks": data[:8],
            "indices": data[8:],
            "crypto": []
        },
        "timestamp": datetime.now().isoformat()
    }

# AI Agent endpoints with mock responses
@app.post("/api/agents/market-sentinel")
async def market_sentinel(request: Dict[Any, Any]):
    """Market Sentinel AI Agent"""
    await asyncio.sleep(0.5)  # Simulate processing time
    
    return {
        "success": True,
        "agent": "market_sentinel",
        "data": {
            "sentiment": "bullish",
            "confidence": 0.78,
            "signals": ["strong_momentum", "volume_surge", "technical_breakout"],
            "analysis": [
                {
                    "title": "Strong Bullish Momentum Detected",
                    "content": "Technical indicators show strong upward momentum across major tech stocks. RSI levels indicate continuation potential with MACD showing positive divergence.",
                    "confidence": 85,
                    "timestamp": datetime.now().isoformat()
                },
                {
                    "title": "Volume Analysis",
                    "content": "Unusual volume patterns detected in AAPL (+45%) and MSFT (+32%) suggest institutional accumulation. Options flow indicates bullish positioning.",
                    "confidence": 78,
                    "timestamp": datetime.now().isoformat()
                }
            ]
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/agents/news-intelligence")
async def news_intelligence(request: Dict[Any, Any]):
    """News Intelligence AI Agent"""
    await asyncio.sleep(0.7)
    
    return {
        "success": True,
        "agent": "news_intelligence", 
        "data": {
            "sentiment": "positive",
            "score": 72,
            "articles": [
                {
                    "title": "AI Chip Demand Surges as Tech Giants Expand Infrastructure",
                    "source": "Financial Times",
                    "sentiment": "positive",
                    "impact": 8.5,
                    "relevance": ["NVDA", "AAPL", "MSFT"]
                },
                {
                    "title": "Federal Reserve Signals Measured Approach to Rate Changes",
                    "source": "Reuters",
                    "sentiment": "positive",
                    "impact": 7.2,
                    "relevance": ["SPY", "QQQ"]
                }
            ],
            "summary": "Overall positive sentiment driven by AI infrastructure spending and supportive monetary policy expectations."
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/agents/risk-assessor")
async def risk_assessor(request: Dict[Any, Any]):
    """Risk Assessor AI Agent"""
    await asyncio.sleep(0.6)
    
    return {
        "success": True,
        "agent": "risk_assessor",
        "data": {
            "portfolio_risk": 65,
            "var_95": -45000,
            "expected_shortfall": -62000,
            "diversification_score": 78,
            "concentration_risk": "HIGH",
            "recommendations": [
                "Consider reducing tech sector concentration (currently 76%)",
                "Add defensive positions to balance growth exposure",
                "Monitor correlation increases during market stress",
                "Implement position sizing based on volatility"
            ],
            "volatility": 22.5,
            "sharpe_ratio": 1.34,
            "max_drawdown": -8.5
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/agents/signal-generator")
async def signal_generator(request: Dict[Any, Any]):
    """Signal Generator AI Agent"""
    await asyncio.sleep(0.8)
    
    return {
        "success": True,
        "agent": "signal_generator",
        "data": {
            "signals": [
                {
                    "symbol": "AAPL",
                    "action": "BUY",
                    "confidence": 82,
                    "price_target": 195.00,
                    "stop_loss": 165.00,
                    "reasoning": "Strong fundamentals + technical breakout above resistance. iPhone 16 cycle driving growth.",
                    "timeframe": "3-6 months"
                },
                {
                    "symbol": "NVDA", 
                    "action": "HOLD",
                    "confidence": 75,
                    "price_target": 480.00,
                    "stop_loss": 380.00,
                    "reasoning": "AI datacenter demand robust but valuation stretched. Wait for pullback to add.",
                    "timeframe": "6-12 months"
                },
                {
                    "symbol": "TSLA",
                    "action": "SELL",
                    "confidence": 68,
                    "price_target": 200.00,
                    "reasoning": "EV competition intensifying, margin pressure visible. Technical breakdown likely.",
                    "timeframe": "2-4 months"
                }
            ],
            "market_regime": "RISK_ON",
            "sector_rotation": "Technology outperforming, Energy underperforming"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/agents/compliance-guardian")
async def compliance_guardian():
    """Compliance Guardian AI Agent"""
    await asyncio.sleep(0.4)
    
    return {
        "success": True,
        "agent": "compliance_guardian",
        "data": {
            "status": "MONITORING",
            "alerts": [
                {
                    "level": "medium",
                    "type": "CONCENTRATION_RISK",
                    "message": "Portfolio concentration in Technology sector exceeds 70% threshold",
                    "regulation": "Internal Risk Management Policy 2.1",
                    "action_required": True,
                    "recommended_action": "Reduce tech allocation or add hedging positions"
                },
                {
                    "level": "low",
                    "type": "LIQUIDITY_CHECK",
                    "message": "All positions maintain adequate liquidity profiles",
                    "regulation": "SEC Rule 22e-4 Liquidity Risk Management",
                    "action_required": False
                }
            ],
            "compliance_score": 85,
            "last_audit": datetime.now().isoformat()
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/agents/executive-summary")
async def executive_summary(request: Dict[Any, Any]):
    """Executive Summary AI Agent"""
    await asyncio.sleep(1.0)
    
    return {
        "success": True,
        "agent": "executive_summary",
        "data": {
            "summary": f"""
**Daily Market Summary - {datetime.now().strftime('%B %d, %Y')}**

🎯 **Market Outlook**: Cautiously optimistic with strong technical momentum in tech sector
📈 **Portfolio Performance**: +1.25% today, outperforming S&P 500 (+0.85%)
🏦 **Risk Assessment**: Moderate risk profile, concentration risk in Technology (76%)
📰 **News Sentiment**: 72% positive, driven by AI infrastructure and Fed policy expectations
⚡ **Trading Signals**: 1 BUY (AAPL), 1 HOLD (NVDA), 1 SELL (TSLA) - High conviction signals
🛡️ **Compliance Status**: 1 medium alert (sector concentration), otherwise compliant
💡 **Key Recommendation**: Consider tactical rebalancing to reduce tech concentration while maintaining growth exposure

**Action Items**:
- Monitor AAPL breakout for entry opportunity
- Evaluate defensive positions for portfolio balance
- Review compliance thresholds for concentration limits
            """.strip(),
            "key_metrics": {
                "portfolio_value": 1250000,
                "daily_pnl": 15420,
                "ytd_return": 18.7,
                "risk_score": 65
            }
        },
        "timestamp": datetime.now().isoformat()
    }

# WebSocket endpoint for real-time data
@app.websocket("/ws/market-feed")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time market data"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle client messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe":
                # Send initial market data
                initial_data = generate_market_data()
                await websocket.send_text(json.dumps({
                    "type": "market_update",
                    "data": initial_data,
                    "timestamp": datetime.now().isoformat()
                }))
                
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

# System status endpoint
@app.get("/api/status")
async def system_status():
    """Get system status"""
    return {
        "status": "operational",
        "services": {
            "api": "online",
            "websocket": "online",
            "market_data": "streaming",
            "ai_agents": "operational"
        },
        "active_connections": len(websocket_manager.active_connections),
        "uptime": "operational",
        "timestamp": datetime.now().isoformat()
    }

# ========================
# 🤖 ADVANCED ML ENDPOINTS  
# ========================

@app.post("/api/ml/predict/{symbol}")
async def get_ml_prediction_endpoint(symbol: str):
    """Get advanced ML prediction for a symbol"""
    try:
        # Mock advanced ML prediction
        prediction = {
            "symbol": symbol,
            "predicted_price": round(150 + random.uniform(-20, 30), 2),
            "confidence": round(0.7 + random.uniform(-0.2, 0.3), 3),
            "direction": random.choice(["bullish", "bearish", "neutral"]),
            "probability": round(0.6 + random.uniform(-0.1, 0.3), 3),
            "target_price": round(150 + random.uniform(-15, 40), 2),
            "stop_loss": round(150 + random.uniform(-30, 10), 2),
            "time_horizon": "1-5 days",
            "risk_score": round(random.uniform(0.1, 0.8), 3),
            "model_used": random.choice(["ensemble", "random_forest", "gradient_boosting"]),
            "features_importance": {
                "RSI": round(random.uniform(0.05, 0.25), 3),
                "MACD": round(random.uniform(0.03, 0.20), 3),
                "Bollinger_Position": round(random.uniform(0.02, 0.15), 3),
                "Volume_Ratio": round(random.uniform(0.01, 0.12), 3),
                "Price_Momentum": round(random.uniform(0.02, 0.18), 3),
                "Volatility": round(random.uniform(0.01, 0.10), 3)
            }
        }
        
        return JSONResponse({
            "status": "success",
            "prediction": prediction,
            "timestamp": datetime.utcnow().isoformat(),
            "model_version": "v2.1.0"
        })
        
    except Exception as e:
        return JSONResponse({
            "status": "error",
            "error": str(e)
        }, status_code=500)

@app.post("/api/ml/portfolio-optimization")
async def portfolio_optimization_endpoint(request: dict):
    """Get portfolio optimization recommendations"""
    try:
        symbols = request.get("symbols", ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"])
        risk_tolerance = request.get("risk_tolerance", 0.5)
        
        # Mock portfolio optimization
        optimization = {
            "status": "success",
            "portfolio_metrics": {
                "expected_return": round(12.5 + random.uniform(-3, 8), 2),
                "risk_score": round(0.3 + random.uniform(-0.1, 0.4), 3),
                "sharpe_estimate": round(1.2 + random.uniform(-0.4, 0.8), 2),
                "diversification": len(symbols)
            },
            "optimal_weights": {
                symbol: round(random.uniform(0.1, 0.3), 3) for symbol in symbols
            },
            "rebalancing_suggestions": [
                {
                    "symbol": symbol,
                    "recommended_weight": round(random.uniform(15, 25), 1),
                    "direction": random.choice(["bullish", "bearish", "neutral"]),
                    "confidence": round(0.7 + random.uniform(-0.2, 0.2), 3),
                    "expected_return": round(random.uniform(-5, 15), 2),
                    "risk_score": round(random.uniform(0.1, 0.6), 3),
                    "predicted_price": round(150 + random.uniform(-30, 50), 2)
                } for symbol in symbols[:5]
            ],
            "risk_tolerance": risk_tolerance,
            "total_symbols_analyzed": len(symbols)
        }
        
        # Normalize weights to sum to 1
        total_weight = sum(optimization["optimal_weights"].values())
        if total_weight > 0:
            optimization["optimal_weights"] = {
                symbol: weight / total_weight 
                for symbol, weight in optimization["optimal_weights"].items()
            }
        
        return JSONResponse(optimization)
        
    except Exception as e:
        return JSONResponse({
            "status": "error",
            "error": str(e)
        }, status_code=500)

@app.get("/api/ml/market-regime")
async def market_regime_endpoint():
    """Get current market regime analysis"""
    try:
        regimes = ["bull_market", "bear_market", "high_volatility", "neutral"]
        regime = random.choice(regimes)
        
        analysis = {
            "regime": regime,
            "confidence": round(0.6 + random.uniform(-0.1, 0.3), 3),
            "indicators": {
                "SPY": {
                    "trend_strength": round(random.uniform(0.1, 0.8), 3),
                    "volatility": round(random.uniform(0.01, 0.05), 4),
                    "rsi": round(30 + random.uniform(-10, 40), 1),
                    "bollinger_position": round(random.uniform(0.1, 0.9), 3)
                },
                "QQQ": {
                    "trend_strength": round(random.uniform(0.1, 0.8), 3),
                    "volatility": round(random.uniform(0.01, 0.06), 4),
                    "rsi": round(30 + random.uniform(-10, 40), 1),
                    "bollinger_position": round(random.uniform(0.1, 0.9), 3)
                },
                "VIX": {
                    "trend_strength": round(random.uniform(0.2, 0.9), 3),
                    "volatility": round(random.uniform(0.02, 0.08), 4),
                    "rsi": round(40 + random.uniform(-20, 30), 1),
                    "bollinger_position": round(random.uniform(0.2, 0.8), 3)
                }
            },
            "analysis_time": datetime.utcnow().isoformat(),
            "recommendations": get_regime_recommendations(regime)
        }
        
        return JSONResponse(analysis)
        
    except Exception as e:
        return JSONResponse({
            "status": "error",
            "error": str(e)
        }, status_code=500)

def get_regime_recommendations(regime: str) -> List[str]:
    """Get recommendations based on market regime"""
    recommendations = {
        "bull_market": [
            "Consider increasing equity exposure",
            "Focus on growth stocks and momentum strategies",
            "Reduce cash positions gradually",
            "Monitor for signs of market overheating"
        ],
        "bear_market": [
            "Increase defensive positions",
            "Consider value stocks and dividend strategies",
            "Maintain higher cash reserves",
            "Look for oversold opportunities"
        ],
        "high_volatility": [
            "Reduce position sizes",
            "Focus on risk management",
            "Consider volatility-based strategies",
            "Avoid momentum trades"
        ],
        "neutral": [
            "Maintain balanced portfolio",
            "Focus on quality stocks",
            "Regular rebalancing",
            "Monitor market developments closely"
        ]
    }
    
    return recommendations.get(regime, recommendations["neutral"])

@app.get("/api/ml/technical-analysis/{symbol}")
async def technical_analysis_endpoint(symbol: str):
    """Get comprehensive technical analysis"""
    try:
        analysis = {
            "symbol": symbol,
            "timestamp": datetime.utcnow().isoformat(),
            "indicators": {
                "RSI": {
                    "value": round(30 + random.uniform(-15, 40), 2),
                    "signal": random.choice(["buy", "sell", "hold"]),
                    "strength": round(random.uniform(0.5, 1.0), 2)
                },
                "MACD": {
                    "value": round(random.uniform(-2, 2), 3),
                    "signal": random.choice(["buy", "sell", "hold"]),
                    "histogram": round(random.uniform(-1, 1), 3)
                },
                "Bollinger_Bands": {
                    "position": round(random.uniform(0, 1), 3),
                    "signal": random.choice(["buy", "sell", "hold"]),
                    "squeeze": random.choice([True, False])
                },
                "Stochastic": {
                    "k": round(random.uniform(20, 80), 2),
                    "d": round(random.uniform(20, 80), 2),
                    "signal": random.choice(["buy", "sell", "hold"])
                },
                "Williams_R": {
                    "value": round(random.uniform(-80, -20), 2),
                    "signal": random.choice(["buy", "sell", "hold"])
                }
            },
            "support_resistance": {
                "support_levels": [
                    round(140 + random.uniform(-10, 0), 2),
                    round(135 + random.uniform(-5, 0), 2),
                    round(130 + random.uniform(-5, 0), 2)
                ],
                "resistance_levels": [
                    round(160 + random.uniform(0, 10), 2),
                    round(165 + random.uniform(0, 10), 2),
                    round(170 + random.uniform(0, 15), 2)
                ]
            },
            "trend_analysis": {
                "short_term": random.choice(["bullish", "bearish", "neutral"]),
                "medium_term": random.choice(["bullish", "bearish", "neutral"]),
                "long_term": random.choice(["bullish", "bearish", "neutral"]),
                "trend_strength": round(random.uniform(0.3, 0.9), 2)
            },
            "overall_signal": random.choice(["strong_buy", "buy", "hold", "sell", "strong_sell"]),
            "confidence": round(0.6 + random.uniform(-0.1, 0.3), 2)
        }
        
        return JSONResponse({
            "status": "success",
            "analysis": analysis
        })
        
    except Exception as e:
        return JSONResponse({
            "status": "error",
            "error": str(e)
        }, status_code=500)

if __name__ == "__main__":
    print("🚀 Starting FinanceGPT Live - Hackathon Demo")
    print("📡 Real-time market data streaming enabled")
    print("🤖 All AI agents operational")
    print("🌐 WebSocket connections ready")
    print("💫 Running on http://localhost:8001")
    
    uvicorn.run(
        "simple_backend:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
