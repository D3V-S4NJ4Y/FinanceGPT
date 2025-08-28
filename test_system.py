#!/usr/bin/env python3
"""
FinanceGPT Live - Quick Test Script
Test if all imports work and basic functionality is available
"""

def test_imports():
    """Test all critical imports"""
    print("🔍 Testing imports...")
    
    try:
        import fastapi
        print("✅ FastAPI imported successfully")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        import openai
        print("✅ OpenAI imported successfully")
    except ImportError as e:
        print(f"❌ OpenAI import failed: {e}")
        return False
    
    try:
        import yfinance
        print("✅ YFinance imported successfully")
    except ImportError as e:
        print(f"❌ YFinance import failed: {e}")
        return False
    
    try:
        import pandas
        import numpy
        print("✅ Data processing libraries imported successfully")
    except ImportError as e:
        print(f"❌ Data processing libraries import failed: {e}")
        return False
    
    try:
        from alpha_vantage.timeseries import TimeSeries
        print("✅ Alpha Vantage imported successfully")
    except ImportError as e:
        print(f"❌ Alpha Vantage import failed: {e}")
        return False
    
    return True

def test_environment():
    """Test environment configuration"""
    print("\n🔧 Testing environment...")
    
    try:
        from dotenv import load_dotenv
        import os
        
        load_dotenv()
        
        # Check for API keys
        openai_key = os.getenv("OPENAI_API_KEY")
        alpha_key = os.getenv("ALPHA_VANTAGE_KEY") 
        finnhub_key = os.getenv("FINNHUB_KEY")
        news_key = os.getenv("NEWS_API_KEY")
        
        if openai_key and openai_key.startswith("sk-"):
            print("✅ OpenAI API key found")
        else:
            print("⚠️ OpenAI API key not found or invalid")
        
        if alpha_key:
            print("✅ Alpha Vantage API key found")
        else:
            print("⚠️ Alpha Vantage API key not found")
        
        if finnhub_key:
            print("✅ Finnhub API key found")
        else:
            print("⚠️ Finnhub API key not found")
        
        if news_key:
            print("✅ News API key found")
        else:
            print("⚠️ News API key not found")
        
        return True
        
    except Exception as e:
        print(f"❌ Environment test failed: {e}")
        return False

def test_basic_functionality():
    """Test basic financial data retrieval"""
    print("\n📊 Testing basic functionality...")
    
    try:
        import yfinance as yf
        
        # Test simple data fetch
        ticker = yf.Ticker("AAPL")
        info = ticker.info
        
        if info and 'symbol' in info:
            print(f"✅ Successfully fetched data for {info.get('symbol', 'AAPL')}")
            print(f"   Current Price: ${info.get('currentPrice', 'N/A')}")
            return True
        else:
            print("⚠️ Data fetched but format unexpected")
            return False
            
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 FinanceGPT Live - System Test")
    print("=" * 40)
    
    success = True
    
    success &= test_imports()
    success &= test_environment() 
    success &= test_basic_functionality()
    
    print("\n" + "=" * 40)
    if success:
        print("🎉 All tests passed! System ready for hackathon demo!")
        print("🚀 Next step: Run the backend with: python main.py")
    else:
        print("⚠️ Some tests failed. Check the issues above.")
    
    print("=" * 40)
