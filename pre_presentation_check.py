#!/usr/bin/env python3
"""
🏆 Pre-Presentation Checklist Script
Ensures everything is ready for championship presentation
"""

import os
import sys
import time
import requests
import subprocess
from colorama import Fore, Style, init

init(autoreset=True)

def print_header():
    print(f"{Fore.CYAN}{Style.BRIGHT}")
    print("=" * 60)
    print("🏆 FINANCEGPT LIVE - PRE-PRESENTATION CHECKLIST")
    print("=" * 60)
    print(f"{Style.RESET_ALL}")

def check_backend():
    """Check if backend is running"""
    print(f"{Fore.YELLOW}📡 Checking Backend Services...")
    try:
        response = requests.get("http://localhost:8001/", timeout=5)
        if response.status_code == 200:
            print(f"{Fore.GREEN}✅ Backend service running on port 8001")
            return True
        else:
            print(f"{Fore.RED}❌ Backend responding with error: {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print(f"{Fore.RED}❌ Backend not responding on port 8001")
        return False

def check_frontend():
    """Check if frontend is running"""
    print(f"{Fore.YELLOW}🌐 Checking Frontend Service...")
    try:
        response = requests.get("http://localhost:3001/", timeout=5)
        if response.status_code == 200:
            print(f"{Fore.GREEN}✅ Frontend service running on port 3001")
            return True
        else:
            print(f"{Fore.RED}❌ Frontend responding with error: {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print(f"{Fore.RED}❌ Frontend not responding on port 3001")
        return False

def check_ml_endpoints():
    """Check ML endpoints"""
    print(f"{Fore.YELLOW}🤖 Checking AI/ML Endpoints...")
    endpoints = [
        "/api/ml/predict",
        "/api/ml/portfolio-optimization",
        "/api/ml/market-regime"
    ]
    
    all_working = True
    for endpoint in endpoints:
        try:
            response = requests.get(f"http://localhost:8001{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"{Fore.GREEN}✅ ML endpoint working: {endpoint}")
            else:
                print(f"{Fore.RED}❌ ML endpoint error: {endpoint}")
                all_working = False
        except requests.exceptions.RequestException:
            print(f"{Fore.RED}❌ ML endpoint not responding: {endpoint}")
            all_working = False
    
    return all_working

def check_demo_features():
    """Check key demo features"""
    print(f"{Fore.YELLOW}🎬 Checking Demo Features...")
    
    demo_urls = [
        "http://localhost:3001/trading",
        "http://localhost:3001/portfolio",
        "http://localhost:3001/ai-intelligence"
    ]
    
    all_working = True
    for url in demo_urls:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                feature_name = url.split('/')[-1]
                print(f"{Fore.GREEN}✅ Demo feature accessible: {feature_name}")
            else:
                print(f"{Fore.RED}❌ Demo feature error: {url}")
                all_working = False
        except requests.exceptions.RequestException:
            print(f"{Fore.RED}❌ Demo feature not accessible: {url}")
            all_working = False
    
    return all_working

def print_demo_script():
    """Print quick demo script reminder"""
    print(f"{Fore.CYAN}{Style.BRIGHT}")
    print("\n🎯 QUICK DEMO SCRIPT REMINDER:")
    print("=" * 40)
    print(f"{Style.RESET_ALL}")
    
    script = [
        "1. Open AI Intelligence → Point to live predictions",
        "2. Show confidence scores above 80%", 
        "3. Switch to Trading Terminal → Show candlestick charts",
        "4. Point to technical indicators → Show buy/sell signals",
        "5. Open Portfolio Analytics → Show institutional metrics",
        "6. Highlight VaR, Sharpe ratio, optimization",
        "7. Return to AI Intelligence → Show live alerts",
        "8. Point to real-time updates happening live"
    ]
    
    for step in script:
        print(f"{Fore.WHITE}{step}")
    
    print(f"\n{Fore.GREEN}{Style.BRIGHT}🏆 Remember: Confidence + Eye Contact + Specific Numbers")

def print_final_checklist():
    """Print final pre-presentation checklist"""
    print(f"\n{Fore.MAGENTA}{Style.BRIGHT}")
    print("📋 FINAL PRE-PRESENTATION CHECKLIST:")
    print("=" * 40)
    print(f"{Style.RESET_ALL}")
    
    checklist = [
        "✅ Backend services running (port 8001)",
        "✅ Frontend accessible (port 3001)", 
        "✅ ML endpoints responding",
        "✅ Demo features working",
        "✅ Backup screenshots ready",
        "✅ Presentation slides prepared",
        "✅ Demo script memorized",
        "✅ Technical specs ready to quote",
        "✅ Business metrics memorized",
        "✅ Closing statement practiced"
    ]
    
    for item in checklist:
        print(f"{Fore.GREEN}{item}")

def main():
    print_header()
    
    # Run all checks
    backend_ok = check_backend()
    frontend_ok = check_frontend()
    ml_ok = check_ml_endpoints()
    demo_ok = check_demo_features()
    
    print(f"\n{Fore.CYAN}{Style.BRIGHT}")
    print("📊 SYSTEM STATUS SUMMARY:")
    print("=" * 30)
    print(f"{Style.RESET_ALL}")
    
    if all([backend_ok, frontend_ok, ml_ok, demo_ok]):
        print(f"{Fore.GREEN}{Style.BRIGHT}🎉 ALL SYSTEMS GO! READY FOR CHAMPIONSHIP! 🏆")
        print(f"{Fore.GREEN}✅ Backend: Operational")
        print(f"{Fore.GREEN}✅ Frontend: Operational")
        print(f"{Fore.GREEN}✅ ML Engine: Operational")
        print(f"{Fore.GREEN}✅ Demo Features: Operational")
        
        print_demo_script()
        print_final_checklist()
        
        print(f"\n{Fore.YELLOW}{Style.BRIGHT}")
        print("🚀 FINAL MOTIVATION:")
        print("You've built something extraordinary!")
        print("This is championship-level work!")
        print("Go win that hackathon! 🏆")
        
    else:
        print(f"{Fore.RED}{Style.BRIGHT}⚠️  SYSTEM ISSUES DETECTED!")
        print(f"{Fore.RED}Please fix the following before presenting:")
        
        if not backend_ok:
            print(f"{Fore.RED}❌ Backend needs to be started")
        if not frontend_ok:
            print(f"{Fore.RED}❌ Frontend needs to be started")
        if not ml_ok:
            print(f"{Fore.RED}❌ ML endpoints need attention")
        if not demo_ok:
            print(f"{Fore.RED}❌ Demo features need fixing")
            
        print(f"\n{Fore.YELLOW}💡 Quick Fix Commands:")
        print("Backend: cd simple_backend && python simple_backend.py")
        print("Frontend: cd frontend && npm run dev")

if __name__ == "__main__":
    main()
