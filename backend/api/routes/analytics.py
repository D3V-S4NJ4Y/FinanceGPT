"""
📊 Analytics API Routes
======================
Advanced financial analytics and insights
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/portfolio/performance")
async def get_portfolio_performance(
    portfolio_id: str = Query("main", description="Portfolio identifier"),
    period: str = Query("1mo", description="Analysis period: 1d,1w,1mo,3mo,6mo,1y")
):
    """
    📈 Get comprehensive portfolio performance analytics
    
    Returns detailed performance metrics, attribution, and risk analysis
    """
    try:
        # Mock performance data - in production, calculate from actual positions
        periods = {
            "1d": 1, "1w": 7, "1mo": 30, "3mo": 90, "6mo": 180, "1y": 365
        }
        
        days = periods.get(period, 30)
        
        # Generate mock time series
        dates = [(datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days, 0, -1)]
        
        # Mock portfolio returns
        daily_returns = np.random.normal(0.0008, 0.02, days)  # 0.08% daily mean, 2% volatility
        cumulative_returns = np.cumprod(1 + daily_returns) - 1
        portfolio_values = 1000000 * (1 + cumulative_returns)
        
        # Mock benchmark returns (slightly lower)
        benchmark_returns = np.random.normal(0.0005, 0.015, days)
        benchmark_cumulative = np.cumprod(1 + benchmark_returns) - 1
        
        # Calculate metrics
        portfolio_return = float(cumulative_returns[-1])
        benchmark_return = float(benchmark_cumulative[-1])
        excess_return = portfolio_return - benchmark_return
        
        volatility = float(np.std(daily_returns) * np.sqrt(252))  # Annualized
        sharpe_ratio = float((np.mean(daily_returns) * 252) / (np.std(daily_returns) * np.sqrt(252)))
        
        max_drawdown = float(np.min(cumulative_returns - np.maximum.accumulate(cumulative_returns)))
        
        performance_data = {
            "portfolio_id": portfolio_id,
            "period": period,
            "summary": {
                "total_return": f"{portfolio_return:.2%}",
                "annualized_return": f"{(portfolio_return * 365/days):.2%}",
                "benchmark_return": f"{benchmark_return:.2%}",
                "excess_return": f"{excess_return:.2%}",
                "volatility": f"{volatility:.2%}",
                "sharpe_ratio": f"{sharpe_ratio:.2f}",
                "max_drawdown": f"{max_drawdown:.2%}",
                "current_value": f"${portfolio_values[-1]:,.0f}"
            },
            "time_series": [
                {
                    "date": dates[i],
                    "portfolio_value": float(portfolio_values[i]),
                    "portfolio_return": float(cumulative_returns[i]),
                    "benchmark_return": float(benchmark_cumulative[i]),
                    "daily_return": float(daily_returns[i])
                }
                for i in range(len(dates))
            ],
            "attribution": {
                "asset_allocation": "+0.45%",
                "stock_selection": "+1.23%", 
                "interaction_effect": "-0.12%",
                "total_active_return": f"{excess_return:.2%}"
            }
        }
        
        return {
            "success": True,
            "data": performance_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Portfolio performance error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/portfolio/risk")
async def get_portfolio_risk_analytics(portfolio_id: str = Query("main")):
    """
    🚨 Get comprehensive portfolio risk analytics
    
    Returns VaR, stress tests, correlation analysis, and risk attribution
    """
    try:
        # Mock risk analytics
        risk_data = {
            "portfolio_id": portfolio_id,
            "risk_metrics": {
                "var_95_1day": {"value": "$23,450", "percentage": "2.35%"},
                "var_99_1day": {"value": "$35,670", "percentage": "3.57%"},
                "expected_shortfall": {"value": "$42,180", "percentage": "4.22%"},
                "beta": 1.15,
                "correlation_to_market": 0.78,
                "tracking_error": "3.2%",
                "information_ratio": 0.67
            },
            "risk_decomposition": {
                "systematic_risk": "65%",
                "idiosyncratic_risk": "35%",
                "sector_contributions": {
                    "Technology": "28%",
                    "Healthcare": "18%", 
                    "Financials": "15%",
                    "Consumer Discretionary": "12%",
                    "Other": "27%"
                }
            },
            "stress_tests": [
                {
                    "scenario": "2008 Financial Crisis",
                    "portfolio_impact": "-32.5%",
                    "benchmark_impact": "-38.2%",
                    "relative_performance": "+5.7%"
                },
                {
                    "scenario": "COVID-19 Market Crash",
                    "portfolio_impact": "-28.1%", 
                    "benchmark_impact": "-33.9%",
                    "relative_performance": "+5.8%"
                },
                {
                    "scenario": "Interest Rate Shock (+200bp)",
                    "portfolio_impact": "-12.3%",
                    "benchmark_impact": "-15.7%", 
                    "relative_performance": "+3.4%"
                }
            ],
            "concentration_analysis": {
                "top_5_positions": "42.3%",
                "top_10_positions": "63.7%",
                "effective_number_of_stocks": 18.5,
                "concentration_score": "Medium"
            }
        }
        
        return {
            "success": True,
            "data": risk_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Portfolio risk analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/market/correlation")
async def get_market_correlation_analysis(
    symbols: str = Query(..., description="Comma-separated symbols"),
    period: str = Query("6mo", description="Analysis period")
):
    """
    🔗 Get correlation analysis between assets
    
    Returns correlation matrix, clustering, and diversification metrics
    """
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        
        if len(symbol_list) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 symbols allowed")
            
        # Mock correlation matrix
        n = len(symbol_list)
        correlation_matrix = np.random.rand(n, n)
        correlation_matrix = (correlation_matrix + correlation_matrix.T) / 2  # Make symmetric
        np.fill_diagonal(correlation_matrix, 1.0)  # Diagonal = 1
        
        # Ensure correlations are in valid range [-1, 1]
        correlation_matrix = np.clip(correlation_matrix * 2 - 0.5, -1, 1)
        
        # Format correlation matrix
        formatted_matrix = {}
        for i, symbol1 in enumerate(symbol_list):
            formatted_matrix[symbol1] = {}
            for j, symbol2 in enumerate(symbol_list):
                formatted_matrix[symbol1][symbol2] = round(float(correlation_matrix[i, j]), 3)
                
        # Find highest and lowest correlations
        correlations = []
        for i in range(n):
            for j in range(i+1, n):
                correlations.append({
                    "pair": f"{symbol_list[i]}-{symbol_list[j]}",
                    "correlation": round(float(correlation_matrix[i, j]), 3)
                })
                
        correlations.sort(key=lambda x: x["correlation"])
        
        correlation_analysis = {
            "symbols": symbol_list,
            "period": period,
            "correlation_matrix": formatted_matrix,
            "summary": {
                "average_correlation": round(float(np.mean(correlation_matrix[np.triu_indices(n, k=1)])), 3),
                "highest_correlation": correlations[-1],
                "lowest_correlation": correlations[0],
                "diversification_ratio": round(float(1 - np.mean(correlation_matrix[np.triu_indices(n, k=1)])), 3)
            },
            "clusters": [
                {
                    "name": "High Growth Tech",
                    "symbols": symbol_list[:3] if len(symbol_list) >= 3 else symbol_list,
                    "avg_internal_correlation": 0.72
                },
                {
                    "name": "Value/Defensive", 
                    "symbols": symbol_list[3:6] if len(symbol_list) >= 6 else [],
                    "avg_internal_correlation": 0.45
                }
            ] if len(symbol_list) >= 3 else []
        }
        
        return {
            "success": True,
            "data": correlation_analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Correlation analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sentiment/analysis")
async def get_sentiment_analysis(
    symbols: Optional[str] = Query(None, description="Symbols to analyze"),
    sources: str = Query("all", description="Sentiment sources: news,social,analyst")
):
    """
    😊 Get comprehensive sentiment analysis
    
    Returns sentiment scores from multiple sources and aggregated insights
    """
    try:
        if symbols:
            symbol_list = [s.strip().upper() for s in symbols.split(",")]
        else:
            symbol_list = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]  # Default symbols
            
        sentiment_data = {}
        
        for symbol in symbol_list:
            # Mock sentiment scores
            news_sentiment = np.random.uniform(-1, 1)
            social_sentiment = np.random.uniform(-1, 1) 
            analyst_sentiment = np.random.uniform(-1, 1)
            
            # Weighted composite
            composite_sentiment = (news_sentiment * 0.4 + social_sentiment * 0.3 + analyst_sentiment * 0.3)
            
            sentiment_data[symbol] = {
                "composite_score": round(float(composite_sentiment), 3),
                "composite_label": _sentiment_label(composite_sentiment),
                "sources": {
                    "news": {
                        "score": round(float(news_sentiment), 3),
                        "label": _sentiment_label(news_sentiment),
                        "article_count": np.random.randint(5, 25)
                    },
                    "social": {
                        "score": round(float(social_sentiment), 3),
                        "label": _sentiment_label(social_sentiment),
                        "mention_count": np.random.randint(100, 1000)
                    },
                    "analyst": {
                        "score": round(float(analyst_sentiment), 3),
                        "label": _sentiment_label(analyst_sentiment),
                        "rating_count": np.random.randint(3, 15)
                    }
                },
                "trend": {
                    "direction": np.random.choice(["improving", "stable", "declining"]),
                    "strength": np.random.choice(["weak", "moderate", "strong"])
                },
                "key_themes": [
                    "Earnings expectations",
                    "Growth prospects", 
                    "Competitive position"
                ][:np.random.randint(1, 4)]
            }
            
        # Market-wide sentiment
        market_sentiment = {
            "overall_sentiment": round(float(np.mean([data["composite_score"] for data in sentiment_data.values()])), 3),
            "sentiment_distribution": {
                "bullish": sum(1 for data in sentiment_data.values() if data["composite_score"] > 0.2),
                "neutral": sum(1 for data in sentiment_data.values() if -0.2 <= data["composite_score"] <= 0.2),
                "bearish": sum(1 for data in sentiment_data.values() if data["composite_score"] < -0.2)
            },
            "market_mood": "Risk-on" if np.mean([data["composite_score"] for data in sentiment_data.values()]) > 0.1 else "Risk-off"
        }
        
        return {
            "success": True,
            "data": {
                "symbol_sentiment": sentiment_data,
                "market_sentiment": market_sentiment,
                "sources_analyzed": sources,
                "sentiment_methodology": "Composite scoring with source weighting"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/technical/indicators")
async def get_technical_indicators(
    symbol: str,
    indicators: str = Query("sma,ema,rsi,macd", description="Comma-separated indicators")
):
    """
    📊 Get technical indicators for a symbol
    
    Returns various technical analysis indicators and signals
    """
    try:
        indicator_list = [i.strip().lower() for i in indicators.split(",")]
        
        # Mock technical indicators
        current_price = np.random.uniform(100, 300)
        
        technical_data = {
            "symbol": symbol.upper(),
            "current_price": round(current_price, 2),
            "indicators": {},
            "signals": [],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if "sma" in indicator_list:
            sma_20 = current_price * np.random.uniform(0.95, 1.05)
            sma_50 = current_price * np.random.uniform(0.90, 1.10)
            
            technical_data["indicators"]["sma"] = {
                "sma_20": round(sma_20, 2),
                "sma_50": round(sma_50, 2),
                "price_vs_sma20": f"{((current_price - sma_20) / sma_20 * 100):+.1f}%",
                "price_vs_sma50": f"{((current_price - sma_50) / sma_50 * 100):+.1f}%"
            }
            
            if current_price > sma_20 > sma_50:
                technical_data["signals"].append({
                    "indicator": "SMA",
                    "signal": "BULLISH",
                    "description": "Price above both SMA20 and SMA50"
                })
                
        if "rsi" in indicator_list:
            rsi = np.random.uniform(20, 80)
            
            technical_data["indicators"]["rsi"] = {
                "value": round(rsi, 1),
                "interpretation": "Overbought" if rsi > 70 else "Oversold" if rsi < 30 else "Neutral"
            }
            
            if rsi < 30:
                technical_data["signals"].append({
                    "indicator": "RSI",
                    "signal": "BULLISH",
                    "description": "RSI indicates oversold conditions"
                })
            elif rsi > 70:
                technical_data["signals"].append({
                    "indicator": "RSI", 
                    "signal": "BEARISH",
                    "description": "RSI indicates overbought conditions"
                })
                
        if "macd" in indicator_list:
            macd_line = np.random.uniform(-5, 5)
            signal_line = macd_line + np.random.uniform(-2, 2)
            histogram = macd_line - signal_line
            
            technical_data["indicators"]["macd"] = {
                "macd_line": round(macd_line, 2),
                "signal_line": round(signal_line, 2), 
                "histogram": round(histogram, 2),
                "crossover": "Bullish" if macd_line > signal_line else "Bearish"
            }
            
        # Overall technical rating
        bullish_signals = sum(1 for s in technical_data["signals"] if s["signal"] == "BULLISH")
        bearish_signals = sum(1 for s in technical_data["signals"] if s["signal"] == "BEARISH")
        
        if bullish_signals > bearish_signals:
            technical_rating = "BULLISH"
        elif bearish_signals > bullish_signals:
            technical_rating = "BEARISH" 
        else:
            technical_rating = "NEUTRAL"
            
        technical_data["overall_rating"] = technical_rating
        technical_data["signal_count"] = {"bullish": bullish_signals, "bearish": bearish_signals}
        
        return {
            "success": True,
            "data": technical_data
        }
        
    except Exception as e:
        logger.error(f"❌ Technical indicators error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _sentiment_label(score: float) -> str:
    """Convert sentiment score to label"""
    if score > 0.3:
        return "Very Positive"
    elif score > 0.1:
        return "Positive"
    elif score > -0.1:
        return "Neutral"
    elif score > -0.3:
        return "Negative"
    else:
        return "Very Negative"
