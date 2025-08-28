"""
🛡️ Core Database Manager
========================
Production-ready database interface with connection pooling and async support
"""

import asyncio
import aiopg
import psycopg2
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, DateTime, Text, Boolean, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json
import logging
from typing import Dict, List, Any, Optional
from .config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    """
    🎯 Production Database Manager
    
    Features:
    - Async connection pooling
    - Real-time data storage
    - Query optimization
    - Connection health monitoring
    """
    
    def __init__(self):
        self.engine = None
        self.async_engine = None
        self.metadata = MetaData()
        self.session_factory = None
        self._setup_tables()
        
    def _setup_tables(self):
        """Define database schema"""
        
        # Market data table
        self.market_data = Table(
            'market_data', self.metadata,
            Column('id', Integer, primary_key=True),
            Column('symbol', String(10), nullable=False),
            Column('price', Float, nullable=False),
            Column('volume', Integer),
            Column('change', Float),  # Raw price change
            Column('change_percent', Float),
            Column('technical_signal', String(20)),  # bullish, bearish, neutral
            Column('risk_score', Float),
            Column('timestamp', DateTime, default=datetime.utcnow),
            Column('source', String(50)),
            Column('data_type', String(20))  # market_update, etc.
        )
        
        # News data table
        self.news_data = Table(
            'news_data', self.metadata,
            Column('id', Integer, primary_key=True),
            Column('headline', Text, nullable=False),
            Column('content', Text),
            Column('sentiment', String(20)),  # positive, negative, neutral
            Column('sentiment_score', Float),
            Column('impact_score', Float),
            Column('source', String(100)),
            Column('timestamp', DateTime, default=datetime.utcnow),
            Column('symbols', Text),  # JSON array of symbols
            Column('symbols_mentioned', Text),  # JSON array of symbols (compatibility)
            Column('data_type', String(20))  # news_update, etc.
        )
        
        # AI signals table
        self.ai_signals = Table(
            'ai_signals', self.metadata,
            Column('id', Integer, primary_key=True),
            Column('symbol', String(10), nullable=False),
            Column('signal_type', String(20)),  # BUY, SELL, HOLD
            Column('confidence', Float),
            Column('agent_id', String(50)),
            Column('reasoning', Text),
            Column('target_price', Float),
            Column('timestamp', DateTime, default=datetime.utcnow),
            Column('is_active', Boolean, default=True)
        )
        
        # Portfolio tracking
        self.portfolio = Table(
            'portfolio', self.metadata,
            Column('id', Integer, primary_key=True),
            Column('user_id', String(50)),
            Column('symbol', String(10)),
            Column('quantity', Float),
            Column('avg_buy_price', Float),
            Column('current_value', Float),
            Column('last_updated', DateTime, default=datetime.utcnow)
        )
        
    async def initialize(self):
        """Initialize database connections"""
        try:
            # Create async engine
            if settings.database_url:
                # Handle different database types
                db_url = settings.database_url
                if db_url.startswith('postgresql://'):
                    db_url = db_url.replace('postgresql://', 'postgresql+asyncpg://')
                
                # Determine if we're using SQLite or PostgreSQL
                is_sqlite = 'sqlite' in db_url.lower()
                
                if is_sqlite:
                    # SQLite doesn't support connection pooling
                    self.async_engine = create_async_engine(
                        db_url,
                        echo=settings.debug
                    )
                else:
                    # PostgreSQL supports connection pooling
                    self.async_engine = create_async_engine(
                        db_url,
                        pool_size=20,
                        max_overflow=0,
                        echo=settings.debug
                    )
                
                # Create tables
                async with self.async_engine.begin() as conn:
                    await conn.run_sync(self.metadata.create_all)
                    
                # Setup session factory
                self.session_factory = sessionmaker(
                    self.async_engine, class_=AsyncSession, expire_on_commit=False
                )
                
                logger.info("✅ Database initialized successfully")
            else:
                logger.warning("⚠️ No database URL configured - using in-memory storage")
                
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            # Fall back to SQLite if PostgreSQL fails
            try:
                logger.info("🔄 Falling back to SQLite database...")
                sqlite_url = "sqlite+aiosqlite:///./financegpt.db"
                self.async_engine = create_async_engine(
                    sqlite_url,
                    echo=settings.debug,
                    pool_pre_ping=True,
                    connect_args={
                        "check_same_thread": False,
                        "timeout": 20
                    }
                )
                
                # Create tables with optimized SQLite settings
                async with self.async_engine.begin() as conn:
                    # Enable WAL mode for better concurrent access
                    await conn.execute("PRAGMA journal_mode=WAL")
                    await conn.execute("PRAGMA synchronous=NORMAL")
                    await conn.execute("PRAGMA cache_size=10000")
                    await conn.execute("PRAGMA temp_store=memory")
                    await conn.run_sync(self.metadata.create_all)
                    
                # Setup session factory
                self.session_factory = sessionmaker(
                    self.async_engine, class_=AsyncSession, expire_on_commit=False
                )
                
                logger.info("✅ SQLite fallback database initialized successfully")
                
            except Exception as fallback_error:
                logger.error(f"❌ SQLite fallback also failed: {fallback_error}")
                # Try with even more basic SQLite configuration
                try:
                    logger.info("🔄 Trying basic SQLite with WAL mode...")
                    sqlite_url = "sqlite+aiosqlite:///./financegpt.db?check_same_thread=false"
                    self.async_engine = create_async_engine(
                        sqlite_url,
                        echo=settings.debug,
                        pool_pre_ping=True,
                        connect_args={
                            "check_same_thread": False,
                            "timeout": 20,
                            "isolation_level": None
                        }
                    )
                    
                    # Create tables
                    async with self.async_engine.begin() as conn:
                        # Enable WAL mode for better concurrent access
                        await conn.execute("PRAGMA journal_mode=WAL")
                        await conn.execute("PRAGMA synchronous=NORMAL")
                        await conn.execute("PRAGMA cache_size=10000")
                        await conn.execute("PRAGMA temp_store=memory")
                        await conn.run_sync(self.metadata.create_all)
                        
                    # Setup session factory
                    self.session_factory = sessionmaker(
                        self.async_engine, class_=AsyncSession, expire_on_commit=False
                    )
                    
                    logger.info("✅ Basic SQLite database initialized successfully")
                    
                except Exception as basic_error:
                    logger.error(f"❌ All database initialization attempts failed: {basic_error}")
            
    async def store_market_data(self, data: Dict[str, Any]):
        """Store real-time market data with retry logic"""
        if not self.async_engine:
            return
            
        max_retries = 3
        retry_delay = 0.1
        
        for attempt in range(max_retries):
            try:
                # Map streaming data to database schema
                db_data = {
                    "symbol": data.get("symbol"),
                    "price": data.get("price"),
                    "volume": data.get("volume"),
                    "change": data.get("change"),
                    "change_percent": data.get("change_percent"),
                    "technical_signal": data.get("technical_signal"),
                    "risk_score": data.get("risk_score"),
                    "timestamp": datetime.fromisoformat(data.get("timestamp", datetime.utcnow().isoformat()).replace('Z', '+00:00')),
                    "source": data.get("source", "FinanceGPT"),
                    "data_type": data.get("type", "market_update")
                }
                
                async with self.session_factory() as session:
                    query = self.market_data.insert().values(**db_data)
                    await session.execute(query)
                    await session.commit()
                return  # Success, exit retry loop
                
            except Exception as e:
                if "database is locked" in str(e).lower() and attempt < max_retries - 1:
                    logger.warning(f"🔄 Database locked, retrying market data ({attempt + 1}/{max_retries})...")
                    await asyncio.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                    continue
                else:
                    logger.error(f"❌ Failed to store market data: {e}")
                    return
            
    async def store_news_data(self, data: Dict[str, Any]):
        """Store news and sentiment data with retry logic"""
        if not self.async_engine:
            return
            
        max_retries = 3
        retry_delay = 0.1
        
        for attempt in range(max_retries):
            try:
                # Map streaming data to database schema
                db_data = {
                    "headline": data.get("headline"),
                    "content": data.get("content"),
                    "sentiment": data.get("sentiment"),
                    "sentiment_score": data.get("sentiment_score"),
                    "impact_score": data.get("impact_score"),
                    "source": data.get("source", "FinanceGPT"),
                    "timestamp": datetime.fromisoformat(data.get("timestamp", datetime.utcnow().isoformat()).replace('Z', '+00:00')),
                    "symbols": json.dumps(data.get("symbols", [])),
                    "symbols_mentioned": json.dumps(data.get("symbols_mentioned", data.get("symbols", []))),
                    "data_type": data.get("type", "news_update")
                }
                
                async with self.session_factory() as session:
                    query = self.news_data.insert().values(**db_data)
                    await session.execute(query)
                    await session.commit()
                return  # Success, exit retry loop
                
            except Exception as e:
                if "database is locked" in str(e).lower() and attempt < max_retries - 1:
                    logger.warning(f"🔄 Database locked, retrying ({attempt + 1}/{max_retries})...")
                    await asyncio.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                    continue
                else:
                    logger.error(f"❌ Failed to store news data: {e}")
                    return
            
    async def store_ai_signal(self, signal: Dict[str, Any]):
        """Store AI-generated trading signals with retry logic"""
        if not self.async_engine:
            return
            
        max_retries = 3
        retry_delay = 0.1
        
        for attempt in range(max_retries):
            try:
                async with self.session_factory() as session:
                    query = self.ai_signals.insert().values(**signal)
                    await session.execute(query)
                    await session.commit()
                return  # Success, exit retry loop
                
            except Exception as e:
                if "database is locked" in str(e).lower() and attempt < max_retries - 1:
                    logger.warning(f"🔄 Database locked, retrying AI signal ({attempt + 1}/{max_retries})...")
                    await asyncio.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                    continue
                else:
                    logger.error(f"❌ Failed to store AI signal: {e}")
                    return
            
    async def get_latest_market_data(self, symbol: str = None, limit: int = 100):
        """Retrieve latest market data"""
        if not self.async_engine:
            return []
            
        try:
            async with self.session_factory() as session:
                query = self.market_data.select().order_by(self.market_data.c.timestamp.desc())
                
                if symbol:
                    query = query.where(self.market_data.c.symbol == symbol)
                    
                query = query.limit(limit)
                result = await session.execute(query)
                return [dict(row) for row in result.fetchall()]
        except Exception as e:
            logger.error(f"❌ Failed to fetch market data: {e}")
            return []
            
    async def get_active_signals(self, symbol: str = None):
        """Get active AI trading signals"""
        if not self.async_engine:
            return []
            
        try:
            async with self.session_factory() as session:
                query = self.ai_signals.select().where(self.ai_signals.c.is_active == True)
                
                if symbol:
                    query = query.where(self.ai_signals.c.symbol == symbol)
                    
                query = query.order_by(self.ai_signals.c.timestamp.desc())
                result = await session.execute(query)
                return [dict(row) for row in result.fetchall()]
        except Exception as e:
            logger.error(f"❌ Failed to fetch signals: {e}")
            return []
            
    async def health_check(self):
        """Check database connection health"""
        if not self.async_engine:
            return {"status": "no_database", "message": "No database configured"}
            
        try:
            async with self.async_engine.connect() as conn:
                await conn.execute("SELECT 1")
                return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def query_recent_signals(self, agent_id: str, limit: int = 10) -> List[Dict]:
        """Query recent signals for a specific agent - REAL DATA ONLY"""
        try:
            async with AsyncSession(self.async_engine) as session:
                query = select(self.ai_signals).where(
                    self.ai_signals.c.agent_id == agent_id
                ).order_by(self.ai_signals.c.timestamp.desc()).limit(limit)
                
                result = await session.execute(query)
                return [dict(row) for row in result.fetchall()]
        except Exception as e:
            logger.error(f"❌ Failed to query recent signals for {agent_id}: {e}")
            return []

    async def query_recent_activity(self, agent_id: str, limit: int = 5) -> List[Dict]:
        """Query recent activity for a specific agent - REAL DATA ONLY"""
        try:
            async with AsyncSession(self.async_engine) as session:
                # Get recent market data updates
                query = select(self.market_data).order_by(
                    self.market_data.c.timestamp.desc()
                ).limit(limit)
                
                result = await session.execute(query)
                return [dict(row) for row in result.fetchall()]
        except Exception as e:
            logger.error(f"❌ Failed to query recent activity for {agent_id}: {e}")
            return []
