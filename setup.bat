@echo off
REM 🚀 FinanceGPT Live - Windows Quick Setup Script
REM ================================================
REM 
REM Automated setup script for Windows
REM Built for IIT Hackathon 2025 🏆

echo 🚀 FinanceGPT Live - Windows Setup Starting...
echo ==============================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is required but not found
    echo Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)
echo ✅ Python found: 
python --version

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not found
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js found:
node --version

REM Setup environment file
if not exist .env (
    copy .env.example .env >nul
    echo ✅ Environment file created from template
    echo ⚠️  Please update .env with your API keys:
    echo    - OPENAI_API_KEY
    echo    - ALPHA_VANTAGE_KEY  
    echo    - NEWS_API_KEY
    echo    - FINNHUB_KEY
) else (
    echo ✅ Environment file already exists
)

REM Setup backend
echo.
echo 📡 Setting up backend...
cd backend

REM Create virtual environment
if not exist venv (
    python -m venv venv
    echo ✅ Virtual environment created
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

REM Create data directories
mkdir data\market_stream 2>nul
mkdir data\news_stream 2>nul
mkdir data\signals_stream 2>nul
mkdir output 2>nul
mkdir pathway_data 2>nul
echo ✅ Data directories created

cd ..

REM Setup frontend
echo.
echo 🌐 Setting up frontend...
cd frontend

REM Install dependencies
echo 📦 Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

cd ..

REM Create sample data
echo.
echo 📊 Creating sample data...

echo {"symbol": "AAPL", "price": 150.25, "volume": 1000000, "timestamp": "%date%T%time%", "change": 2.50, "change_percent": 1.69} > data\market_stream\sample_data.jsonl
echo {"symbol": "GOOGL", "price": 2800.75, "volume": 500000, "timestamp": "%date%T%time%", "change": -10.25, "change_percent": -0.36} >> data\market_stream\sample_data.jsonl

echo {"headline": "Apple Reports Strong Q4 Earnings", "content": "Apple Inc. reported better than expected earnings...", "source": "Reuters", "symbols": "AAPL", "sentiment_score": 0.8, "timestamp": "%date%T%time%"} > data\news_stream\sample_news.jsonl

echo ✅ Sample data created

echo.
echo 🎉 FinanceGPT Live Windows setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update .env file with your API keys
echo 2. Start the backend:
echo    cd backend
echo    venv\Scripts\activate.bat
echo    python main.py
echo.
echo 3. Start the frontend (new terminal):
echo    cd frontend  
echo    npm run dev
echo.
echo 4. Access the application at: http://localhost:3000
echo.
echo 🏆 Good luck with your hackathon!
echo.
pause
