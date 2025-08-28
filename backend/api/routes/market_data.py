"""
🔌 API Routes - Market Data Endpoints
=====================================
Real-time market data API with advanced analytics
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import asyncio
import logging

logger = logging.getLogger(__name__)

# Request models
class MarketDataRequest(BaseModel):
    symbols: List[str] = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
    timeframe: str = '1d'

router = APIRouter(prefix="/api/market", tags=["Market Data"])

# Popular trading symbols
POPULAR_SYMBOLS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX",
    "AMD", "INTC", "BABA", "UBER", "ZOOM", "SQ", "PYPL", "DIS"
]

@router.post("/data")
async def get_market_data_bulk(request: MarketDataRequest):
    """
    Get market data for multiple symbols - Frontend compatible endpoint
    """
    try:
        market_data = {
            "stocks": [],
            "indices": [],
            "crypto": []
        }
        
        for symbol in request.symbols:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period=request.timeframe)
                
                if not hist.empty:
                    latest = hist.iloc[-1]
                    prev = hist.iloc[-2] if len(hist) > 1 else latest
                    
                    stock_data = {
                        "symbol": symbol,
                        "price": float(latest['Close']),
                        "change": float(latest['Close'] - prev['Close']),
                        "changePercent": float(((latest['Close'] - prev['Close']) / prev['Close']) * 100),
                        "volume": int(latest['Volume']),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    # Categorize symbols
                    if symbol in ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA"]:
                        market_data["stocks"].append(stock_data)
                    elif symbol in ["SPY", "QQQ", "DIA", "IWM"]:
                        market_data["indices"].append(stock_data)
                    elif symbol in ["BTC-USD", "ETH-USD", "ADA-USD"]:
                        market_data["crypto"].append(stock_data)
                    else:
                        market_data["stocks"].append(stock_data)
                        
            except Exception as e:
                logger.warning(f"Failed to fetch data for {symbol}: {e}")
                continue
        
        return {
            "success": True,
            "data": market_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching bulk market data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str):
    """
    🎯 Get real-time stock quote
    
    Returns comprehensive market data for a single symbol
    """
    try:
        ticker = yf.Ticker(symbol.upper())
        
        # Get current data
        info = ticker.info
        hist = ticker.history(period="1d", interval="1m")
        
        if hist.empty:
            raise HTTPException(status_code=404, message=f"Symbol {symbol} not found")
            
        current_price = hist['Close'].iloc[-1]
        prev_close = info.get('previousClose', current_price)
        
        quote_data = {
            "symbol": symbol.upper(),
            "current_price": float(current_price),
            "previous_close": float(prev_close),
            "change": float(current_price - prev_close),
            "change_percent": float((current_price - prev_close) / prev_close * 100),
            "volume": int(hist['Volume'].iloc[-1]) if not pd.isna(hist['Volume'].iloc[-1]) else 0,
            "high_24h": float(hist['High'].max()),
            "low_24h": float(hist['Low'].min()),
            "market_cap": info.get('marketCap', 0),
            "pe_ratio": info.get('trailingPE', 0),
            "timestamp": datetime.utcnow().isoformat(),
            "market_state": "OPEN" if _is_market_open() else "CLOSED"
        }
        
        return {"success": True, "data": quote_data}
        
    except Exception as e:
        logger.error(f"❌ Error fetching quote for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quotes")
async def get_multiple_quotes(
    symbols: str = Query(..., description="Comma-separated symbols (e.g., AAPL,MSFT,GOOGL)")
):
    """
    📈 Get quotes for multiple symbols
    
    Efficient batch processing for portfolio tracking
    """
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        
        if len(symbol_list) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 symbols allowed")
            
        quotes = {}
        
        for symbol in symbol_list:
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="1d", interval="5m")
                
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    prev_price = hist['Close'].iloc[0] if len(hist) > 1 else current_price
                    
                    quotes[symbol] = {
                        "price": float(current_price),
                        "change": float(current_price - prev_price),
                        "change_percent": float((current_price - prev_price) / prev_price * 100),
                        "volume": int(hist['Volume'].iloc[-1]) if not pd.isna(hist['Volume'].iloc[-1]) else 0
                    }
                    
            except Exception as e:
                logger.warning(f"⚠️ Failed to fetch {symbol}: {e}")
                quotes[symbol] = {"error": "Data unavailable"}
                
        return {
            "success": True,
            "data": quotes,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching multiple quotes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending_stocks():
    """
    🔥 Get trending/popular stocks
    
    Returns most actively traded and talked about stocks
    """
    try:
        trending_data = []
        
        for symbol in POPULAR_SYMBOLS[:10]:  # Top 10 trending
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="2d", interval="1d")
                
                if len(hist) >= 2:
                    current = hist['Close'].iloc[-1]
                    previous = hist['Close'].iloc[-2]
                    volume = hist['Volume'].iloc[-1]
                    
                    trending_data.append({
                        "symbol": symbol,
                        "price": float(current),
                        "change_percent": float((current - previous) / previous * 100),
                        "volume": int(volume) if not pd.isna(volume) else 0
                    })
                    
            except Exception as e:
                logger.warning(f"⚠️ Failed to fetch trending data for {symbol}: {e}")
                
        # Sort by volume (most active first)
        trending_data.sort(key=lambda x: x.get('volume', 0), reverse=True)
        
        return {
            "success": True,
            "data": trending_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching trending stocks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest")
async def get_latest_market_data():
    """
    📊 Get latest market data for all tracked symbols
    
    Returns real-time data for Command Center
    """
    try:
        from core.database import DatabaseManager
        
        # Get database instance
        db = DatabaseManager()
        
        # Get latest market data from database
        latest_data = await db.get_latest_market_data(limit=50)
        
        # Group by symbol and get most recent for each
        symbol_data = {}
        for record in latest_data:
            symbol = record['symbol']
            if symbol not in symbol_data:
                symbol_data[symbol] = {
                    "symbol": symbol,
                    "price": record['price'],
                    "change": record['change'],
                    "changePercent": record['change_percent'],
                    "volume": record['volume'],
                    "timestamp": record['timestamp']
                }
        
        # Convert to list
        market_data = list(symbol_data.values())
        
        # If no data in database, fetch fresh data
        if not market_data:
            default_symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'SPY', 'QQQ']
            market_data = []
            
            for symbol in default_symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="2d", interval="1d")
                    
                    if len(hist) >= 2:
                        current = hist['Close'].iloc[-1]
                        previous = hist['Close'].iloc[-2]
                        volume = hist['Volume'].iloc[-1]
                        
                        market_data.append({
                            "symbol": symbol,
                            "price": float(current),
                            "change": float(current - previous),
                            "changePercent": float((current - previous) / previous * 100),
                            "volume": int(volume) if not pd.isna(volume) else 0,
                            "timestamp": datetime.utcnow().isoformat()
                        })
                        
                except Exception as e:
                    logger.warning(f"⚠️ Failed to fetch data for {symbol}: {e}")
        
        return market_data
        
    except Exception as e:
        logger.error(f"❌ Error fetching latest market data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{symbol}")
async def get_stock_history(
    symbol: str,
    period: str = Query("1mo", description="Period: 1d,5d,1mo,3mo,6mo,1y,2y,5y"),
    interval: str = Query("1d", description="Interval: 1m,2m,5m,15m,30m,60m,90m,1h,1d,5d,1wk,1mo,3mo")
):
    """
    📊 Get historical stock data
    
    Perfect for charting and technical analysis
    """
    try:
        ticker = yf.Ticker(symbol.upper())
        hist = ticker.history(period=period, interval=interval)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
            
        # Convert to JSON-serializable format
        history_data = []
        for index, row in hist.iterrows():
            history_data.append({
                "timestamp": index.isoformat(),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume']) if not pd.isna(row['Volume']) else 0
            })
            
        # Calculate technical indicators
        closes = hist['Close']
        sma_20 = closes.rolling(window=20).mean()
        sma_50 = closes.rolling(window=50).mean()
        
        technical_data = {
            "sma_20": float(sma_20.iloc[-1]) if not pd.isna(sma_20.iloc[-1]) else None,
            "sma_50": float(sma_50.iloc[-1]) if not pd.isna(sma_50.iloc[-1]) else None,
            "volatility": float(closes.pct_change().std() * np.sqrt(252))  # Annualized volatility
        }
        
        return {
            "success": True,
            "data": {
                "symbol": symbol.upper(),
                "period": period,
                "interval": interval,
                "history": history_data,
                "technical_indicators": technical_data
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching history for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stream/{symbol}")
async def stream_stock_data(symbol: str):
    """
    🌊 Stream real-time stock data
    
    Server-sent events for live price updates
    """
    async def generate_stock_stream():
        """Generate real-time stock price stream"""
        ticker = yf.Ticker(symbol.upper())
        
        while True:
            try:
                # Get latest data
                hist = ticker.history(period="1d", interval="1m")
                if not hist.empty:
                    latest = hist.iloc[-1]
                    
                    data = {
                        "symbol": symbol.upper(),
                        "price": float(latest['Close']),
                        "volume": int(latest['Volume']) if not pd.isna(latest['Volume']) else 0,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    yield f"data: {json.dumps(data)}\n\n"
                    
                await asyncio.sleep(5)  # Update every 5 seconds
                
            except Exception as e:
                logger.error(f"❌ Stream error for {symbol}: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                await asyncio.sleep(10)
                
    return StreamingResponse(
        generate_stock_stream(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@router.get("/sectors")
async def get_sector_performance():
    """
    🏭 Get sector performance overview
    
    Track performance across different market sectors
    """
    try:
        # Define sector ETFs as proxies
        sector_etfs = {
            "Technology": "XLK",
            "Healthcare": "XLV", 
            "Financials": "XLF",
            "Energy": "XLE",
            "Consumer Discretionary": "XLY",
            "Consumer Staples": "XLP",
            "Industrials": "XLI",
            "Materials": "XLB",
            "Real Estate": "XLRE",
            "Utilities": "XLU",
            "Communication Services": "XLC"
        }
        
        sector_data = {}
        
        for sector_name, etf_symbol in sector_etfs.items():
            try:
                ticker = yf.Ticker(etf_symbol)
                hist = ticker.history(period="5d", interval="1d")
                
                if len(hist) >= 2:
                    current = hist['Close'].iloc[-1]
                    previous = hist['Close'].iloc[-2]
                    week_start = hist['Close'].iloc[0]
                    
                    sector_data[sector_name] = {
                        "price": float(current),
                        "change_1d": float((current - previous) / previous * 100),
                        "change_5d": float((current - week_start) / week_start * 100),
                        "symbol": etf_symbol
                    }
                    
            except Exception as e:
                logger.warning(f"⚠️ Failed to fetch sector data for {sector_name}: {e}")
                
        return {
            "success": True,
            "data": sector_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching sector performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _is_market_open() -> bool:
    """Check if US market is currently open"""
    now = datetime.now()
    # Simplified check - US market hours (9:30 AM - 4:00 PM ET, Mon-Fri)
    if now.weekday() >= 5:  # Weekend
        return False
        
    # Convert to market hours (simplified, doesn't account for holidays)
    market_open = now.replace(hour=9, minute=30, second=0, microsecond=0)
    market_close = now.replace(hour=16, minute=0, second=0, microsecond=0)
    
    return market_open <= now <= market_close
