#!/bin/bash

# 🚀 FinanceGPT Live - Quick Setup Script
# =======================================
# 
# Automated setup script for rapid deployment
# Built for IIT Hackathon 2025 🏆

set -e

echo "🚀 FinanceGPT Live - Quick Setup Starting..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    print_success "Python 3 found: $(python3 --version)"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found - manual setup required"
    else
        print_success "Docker found: $(docker --version)"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose not found - manual setup required"
    else
        print_success "Docker Compose found: $(docker-compose --version)"
    fi
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Environment file created from template"
        
        # Generate secret key
        SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
        sed -i "s/your-super-secret-key-change-in-production-hackathon-2025/$SECRET_KEY/" .env
        print_success "Secret key generated"
        
        print_warning "⚠️  Please update .env with your API keys:"
        print_warning "   - OPENAI_API_KEY"
        print_warning "   - ALPHA_VANTAGE_KEY"
        print_warning "   - NEWS_API_KEY"
        print_warning "   - FINNHUB_KEY"
    else
        print_success "Environment file already exists"
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Virtual environment created"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    print_success "Backend dependencies installed"
    
    # Create data directories
    mkdir -p data/market_stream data/news_stream data/signals_stream
    mkdir -p output pathway_data
    print_success "Data directories created"
    
    cd ..
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    print_success "Frontend dependencies installed"
    
    cd ..
}

# Setup Docker services
setup_docker() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        print_status "Setting up Docker services..."
        
        # Create Docker networks and volumes
        docker network create financegpt-network 2>/dev/null || true
        
        # Start database and cache services
        docker-compose up -d postgres redis
        print_success "Database and cache services started"
        
        # Wait for services to be ready
        print_status "Waiting for services to be ready..."
        sleep 10
        
        # Check if services are running
        if docker-compose ps | grep -q "Up"; then
            print_success "Docker services are running"
        else
            print_warning "Some Docker services may not be running properly"
        fi
    else
        print_warning "Docker not available - skipping Docker setup"
    fi
}

# Create sample data
create_sample_data() {
    print_status "Creating sample data..."
    
    # Create sample market data
    cat > data/market_stream/sample_data.jsonl << EOL
{"symbol": "AAPL", "price": 150.25, "volume": 1000000, "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)", "change": 2.50, "change_percent": 1.69}
{"symbol": "GOOGL", "price": 2800.75, "volume": 500000, "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)", "change": -10.25, "change_percent": -0.36}
{"symbol": "MSFT", "price": 420.50, "volume": 750000, "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)", "change": 5.75, "change_percent": 1.39}
EOL

    # Create sample news data
    cat > data/news_stream/sample_news.jsonl << EOL
{"headline": "Apple Reports Strong Q4 Earnings", "content": "Apple Inc. reported better than expected earnings for Q4...", "source": "Reuters", "symbols": "AAPL", "sentiment_score": 0.8, "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
{"headline": "Google Faces Regulatory Challenges", "content": "Alphabet Inc. is facing new regulatory scrutiny...", "source": "Bloomberg", "symbols": "GOOGL", "sentiment_score": -0.3, "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOL

    print_success "Sample data created"
}

# Verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check backend
    cd backend
    source venv/bin/activate
    if python -c "import pathway, fastapi, uvicorn" 2>/dev/null; then
        print_success "Backend dependencies verified"
    else
        print_error "Backend dependency verification failed"
    fi
    cd ..
    
    # Check frontend
    cd frontend
    if [ -d "node_modules" ]; then
        print_success "Frontend dependencies verified"
    else
        print_error "Frontend dependency verification failed"
    fi
    cd ..
    
    print_success "Installation verification completed"
}

# Main setup function
main() {
    echo ""
    print_status "Starting FinanceGPT Live setup..."
    echo ""
    
    check_prerequisites
    setup_environment
    setup_backend
    setup_frontend
    setup_docker
    create_sample_data
    verify_installation
    
    echo ""
    print_success "🎉 FinanceGPT Live setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Update .env file with your API keys"
    echo "2. Start the backend: cd backend && source venv/bin/activate && python main.py"
    echo "3. Start the frontend: cd frontend && npm run dev"
    echo "4. Access the application at: http://localhost:3000"
    echo ""
    print_status "For Docker deployment: docker-compose up -d"
    echo ""
    print_success "Good luck with your hackathon! 🏆"
}

# Run main function
main
