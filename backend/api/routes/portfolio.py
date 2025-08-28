"""
💼 Portfolio Management API Routes
==================================
Portfolio tracking, optimization, and management
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])

class Position(BaseModel):
    symbol: str
    quantity: float
    average_cost: float
    current_price: Optional[float] = None

class Portfolio(BaseModel):
    name: str
    positions: List[Position]
    cash: float = 0.0

@router.post("/create")
async def create_portfolio(portfolio: Portfolio):
    """
    📁 Create new portfolio
    
    Initialize a new portfolio with positions and cash
    """
    try:
        # Mock portfolio creation
        portfolio_id = f"port_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        # Calculate portfolio value
        total_value = portfolio.cash
        for position in portfolio.positions:
            current_price = position.current_price or np.random.uniform(50, 300)
            total_value += position.quantity * current_price
            
        created_portfolio = {
            "portfolio_id": portfolio_id,
            "name": portfolio.name,
            "total_value": round(total_value, 2),
            "cash": portfolio.cash,
            "positions": [
                {
                    "symbol": pos.symbol,
                    "quantity": pos.quantity,
                    "average_cost": pos.average_cost,
                    "current_price": pos.current_price or np.random.uniform(50, 300),
                    "market_value": pos.quantity * (pos.current_price or np.random.uniform(50, 300)),
                    "unrealized_pnl": pos.quantity * ((pos.current_price or np.random.uniform(50, 300)) - pos.average_cost),
                    "weight": 0  # Will be calculated
                }
                for pos in portfolio.positions
            ],
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Calculate weights
        for position in created_portfolio["positions"]:
            position["weight"] = position["market_value"] / total_value if total_value > 0 else 0
            
        return {
            "success": True,
            "data": created_portfolio,
            "message": f"Portfolio '{portfolio.name}' created successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Portfolio creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{portfolio_id}")
async def get_portfolio(portfolio_id: str):
    """
    📊 Get portfolio details
    
    Returns complete portfolio information with current values
    """
    try:
        # Mock portfolio data
        mock_positions = [
            {
                "symbol": "AAPL",
                "quantity": 100,
                "average_cost": 150.50,
                "current_price": 175.43,
                "market_value": 17543.00,
                "unrealized_pnl": 2493.00,
                "unrealized_pnl_percent": 16.56,
                "weight": 0.175,
                "sector": "Technology"
            },
            {
                "symbol": "MSFT", 
                "quantity": 50,
                "average_cost": 320.00,
                "current_price": 384.52,
                "market_value": 19226.00,
                "unrealized_pnl": 3226.00,
                "unrealized_pnl_percent": 20.16,
                "weight": 0.192,
                "sector": "Technology"
            },
            {
                "symbol": "GOOGL",
                "quantity": 25,
                "average_cost": 2200.00,
                "current_price": 2380.15,
                "market_value": 59503.75,
                "unrealized_pnl": 4503.75,
                "unrealized_pnl_percent": 8.19,
                "weight": 0.595,
                "sector": "Technology"
            }
        ]
        
        total_market_value = sum(pos["market_value"] for pos in mock_positions)
        total_cost_basis = sum(pos["quantity"] * pos["average_cost"] for pos in mock_positions)
        cash = 3727.25  # Mock cash position
        
        portfolio_data = {
            "portfolio_id": portfolio_id,
            "name": "Growth Portfolio",
            "summary": {
                "total_value": total_market_value + cash,
                "total_market_value": total_market_value,
                "cash": cash,
                "total_cost_basis": total_cost_basis,
                "total_unrealized_pnl": total_market_value - total_cost_basis,
                "total_unrealized_pnl_percent": ((total_market_value - total_cost_basis) / total_cost_basis * 100) if total_cost_basis > 0 else 0,
                "day_change": np.random.uniform(-5000, 8000),
                "day_change_percent": np.random.uniform(-2, 3)
            },
            "positions": mock_positions,
            "allocation": {
                "by_sector": {
                    "Technology": 96.2,
                    "Cash": 3.8
                },
                "by_asset_class": {
                    "Equities": 96.2,
                    "Cash": 3.8
                },
                "by_market_cap": {
                    "Large Cap": 100.0,
                    "Mid Cap": 0.0,
                    "Small Cap": 0.0
                }
            },
            "performance": {
                "1d": f"{np.random.uniform(-3, 4):.2f}%",
                "1w": f"{np.random.uniform(-5, 8):.2f}%",
                "1m": f"{np.random.uniform(-10, 15):.2f}%",
                "3m": f"{np.random.uniform(-15, 25):.2f}%",
                "ytd": f"{np.random.uniform(-20, 35):.2f}%"
            },
            "last_updated": datetime.utcnow().isoformat()
        }
        
        return {
            "success": True,
            "data": portfolio_data
        }
        
    except Exception as e:
        logger.error(f"❌ Portfolio retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{portfolio_id}/rebalance")
async def rebalance_portfolio(
    portfolio_id: str,
    target_weights: Dict[str, float]
):
    """
    ⚖️ Rebalance portfolio to target weights
    
    Calculate trades needed to achieve target allocation
    """
    try:
        # Mock current portfolio
        current_positions = {
            "AAPL": {"quantity": 100, "price": 175.43, "value": 17543},
            "MSFT": {"quantity": 50, "price": 384.52, "value": 19226},
            "GOOGL": {"quantity": 25, "price": 2380.15, "value": 59504}
        }
        
        total_value = sum(pos["value"] for pos in current_positions.values())
        
        # Calculate required trades
        trades = []
        for symbol, target_weight in target_weights.items():
            if symbol in current_positions:
                current_value = current_positions[symbol]["value"]
                current_weight = current_value / total_value
                target_value = total_value * target_weight
                
                price = current_positions[symbol]["price"]
                current_quantity = current_positions[symbol]["quantity"]
                target_quantity = target_value / price
                
                quantity_diff = target_quantity - current_quantity
                
                if abs(quantity_diff) > 0.01:  # Minimum trade threshold
                    trades.append({
                        "symbol": symbol,
                        "action": "BUY" if quantity_diff > 0 else "SELL",
                        "quantity": abs(quantity_diff),
                        "current_weight": round(current_weight * 100, 2),
                        "target_weight": round(target_weight * 100, 2),
                        "estimated_value": abs(quantity_diff * price)
                    })
                    
        rebalance_result = {
            "portfolio_id": portfolio_id,
            "rebalancing_trades": trades,
            "summary": {
                "total_trades": len(trades),
                "total_trade_value": sum(trade["estimated_value"] for trade in trades),
                "estimated_costs": len(trades) * 10,  # Mock $10 per trade
                "target_achieved": len(trades) == 0
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return {
            "success": True,
            "data": rebalance_result,
            "message": "Rebalancing plan generated successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Portfolio rebalancing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{portfolio_id}/optimization")
async def optimize_portfolio(
    portfolio_id: str,
    objective: str = Query("sharpe", description="Optimization objective: sharpe, return, risk")
):
    """
    🎯 Get portfolio optimization recommendations
    
    Returns optimized weights based on specified objective
    """
    try:
        # Mock optimization results
        current_weights = {"AAPL": 0.175, "MSFT": 0.192, "GOOGL": 0.595, "Cash": 0.038}
        
        if objective == "sharpe":
            # Optimize for Sharpe ratio
            optimized_weights = {"AAPL": 0.25, "MSFT": 0.30, "GOOGL": 0.35, "Cash": 0.10}
            expected_improvement = "15% increase in Sharpe ratio"
        elif objective == "return":
            # Optimize for maximum return
            optimized_weights = {"AAPL": 0.20, "MSFT": 0.25, "GOOGL": 0.50, "Cash": 0.05}
            expected_improvement = "8% increase in expected return"
        else:  # risk
            # Optimize for minimum risk
            optimized_weights = {"AAPL": 0.30, "MSFT": 0.35, "GOOGL": 0.20, "Cash": 0.15}
            expected_improvement = "25% reduction in portfolio volatility"
            
        optimization_result = {
            "portfolio_id": portfolio_id,
            "optimization_objective": objective,
            "current_allocation": {k: f"{v*100:.1f}%" for k, v in current_weights.items()},
            "optimized_allocation": {k: f"{v*100:.1f}%" for k, v in optimized_weights.items()},
            "expected_metrics": {
                "expected_return": f"{np.random.uniform(8, 15):.1f}%",
                "expected_volatility": f"{np.random.uniform(12, 20):.1f}%",
                "expected_sharpe": f"{np.random.uniform(0.6, 1.2):.2f}",
                "improvement": expected_improvement
            },
            "implementation_impact": {
                "trades_required": 4,
                "estimated_costs": 40,
                "tax_implications": "Minimal - mostly rebalancing",
                "time_to_implement": "1-2 trading days"
            },
            "risk_considerations": [
                "Optimization based on historical data",
                "Future performance may differ from projections", 
                "Consider transaction costs and tax impact",
                "Regular rebalancing may be required"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return {
            "success": True,
            "data": optimization_result
        }
        
    except Exception as e:
        logger.error(f"❌ Portfolio optimization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{portfolio_id}/backtest")
async def backtest_portfolio(
    portfolio_id: str,
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)")
):
    """
    📈 Backtest portfolio performance
    
    Returns historical performance analysis over specified period
    """
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        days = (end - start).days
        
        if days <= 0 or days > 1095:  # Max 3 years
            raise HTTPException(status_code=400, detail="Invalid date range (max 3 years)")
            
        # Generate mock backtest data
        dates = [(start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(0, days, 7)]  # Weekly data
        
        # Mock returns
        portfolio_returns = np.random.normal(0.002, 0.03, len(dates))  # Weekly returns
        benchmark_returns = np.random.normal(0.0015, 0.025, len(dates))
        
        portfolio_values = [100000]  # Start with $100k
        benchmark_values = [100000]
        
        for i in range(len(portfolio_returns)):
            portfolio_values.append(portfolio_values[-1] * (1 + portfolio_returns[i]))
            benchmark_values.append(benchmark_values[-1] * (1 + benchmark_returns[i]))
            
        # Calculate metrics
        total_return = (portfolio_values[-1] - portfolio_values[0]) / portfolio_values[0]
        benchmark_total_return = (benchmark_values[-1] - benchmark_values[0]) / benchmark_values[0]
        
        excess_return = total_return - benchmark_total_return
        volatility = np.std(portfolio_returns) * np.sqrt(52)  # Annualized
        sharpe_ratio = (np.mean(portfolio_returns) * 52) / (np.std(portfolio_returns) * np.sqrt(52))
        
        max_drawdown = 0
        peak = portfolio_values[0]
        for value in portfolio_values:
            if value > peak:
                peak = value
            drawdown = (peak - value) / peak
            max_drawdown = max(max_drawdown, drawdown)
            
        backtest_result = {
            "portfolio_id": portfolio_id,
            "backtest_period": {
                "start_date": start_date,
                "end_date": end_date,
                "duration_days": days
            },
            "performance_summary": {
                "total_return": f"{total_return:.2%}",
                "annualized_return": f"{(total_return * 365 / days):.2%}",
                "benchmark_return": f"{benchmark_total_return:.2%}",
                "excess_return": f"{excess_return:.2%}",
                "volatility": f"{volatility:.2%}",
                "sharpe_ratio": f"{sharpe_ratio:.2f}",
                "max_drawdown": f"{max_drawdown:.2%}",
                "best_week": f"{np.max(portfolio_returns):.2%}",
                "worst_week": f"{np.min(portfolio_returns):.2%}"
            },
            "time_series": [
                {
                    "date": dates[i],
                    "portfolio_value": round(portfolio_values[i], 2),
                    "benchmark_value": round(benchmark_values[i], 2),
                    "portfolio_return": f"{portfolio_returns[i-1]:.2%}" if i > 0 else "0.00%"
                }
                for i in range(len(dates))
            ],
            "monthly_returns": [
                {
                    "month": f"2024-{i:02d}",
                    "return": f"{np.random.uniform(-0.08, 0.12):.2%}"
                }
                for i in range(1, min(13, int(days/30) + 1))
            ],
            "risk_metrics": {
                "var_95": f"{np.percentile(portfolio_returns, 5):.2%}",
                "expected_shortfall": f"{np.mean(portfolio_returns[portfolio_returns <= np.percentile(portfolio_returns, 5)]):.2%}",
                "downside_deviation": f"{np.std(portfolio_returns[portfolio_returns < 0]) * np.sqrt(52):.2%}",
                "calmar_ratio": f"{(np.mean(portfolio_returns) * 52) / max_drawdown:.2f}" if max_drawdown > 0 else "N/A"
            }
        }
        
        return {
            "success": True,
            "data": backtest_result
        }
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        logger.error(f"❌ Portfolio backtest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{portfolio_id}/alerts")
async def get_portfolio_alerts(portfolio_id: str):
    """
    🚨 Get portfolio alerts and notifications
    
    Returns active alerts for portfolio monitoring
    """
    try:
        # Mock portfolio alerts
        alerts = [
            {
                "id": "alert_001",
                "type": "performance",
                "severity": "medium",
                "title": "Portfolio Underperforming Benchmark",
                "message": "Portfolio is trailing S&P 500 by 2.3% over the last month",
                "created_at": (datetime.utcnow() - timedelta(hours=4)).isoformat(),
                "status": "active",
                "recommended_action": "Review underperforming positions and consider rebalancing"
            },
            {
                "id": "alert_002", 
                "type": "concentration",
                "severity": "high",
                "title": "High Sector Concentration",
                "message": "Technology sector represents 89% of portfolio value",
                "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
                "status": "active",
                "recommended_action": "Diversify across additional sectors to reduce concentration risk"
            },
            {
                "id": "alert_003",
                "type": "volatility",
                "severity": "low", 
                "title": "Increased Volatility Detected",
                "message": "Portfolio volatility increased 15% over the last week",
                "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "status": "active",
                "recommended_action": "Monitor positions closely and consider hedging strategies"
            }
        ]
        
        alert_summary = {
            "portfolio_id": portfolio_id,
            "alerts": alerts,
            "summary": {
                "total_alerts": len(alerts),
                "critical": sum(1 for a in alerts if a["severity"] == "critical"),
                "high": sum(1 for a in alerts if a["severity"] == "high"), 
                "medium": sum(1 for a in alerts if a["severity"] == "medium"),
                "low": sum(1 for a in alerts if a["severity"] == "low")
            },
            "last_updated": datetime.utcnow().isoformat()
        }
        
        return {
            "success": True,
            "data": alert_summary
        }
        
    except Exception as e:
        logger.error(f"❌ Portfolio alerts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
