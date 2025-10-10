#!/usr/bin/env python
"""
Fundamental Analysis Script - Embedded in Spring Boot
"""
import sys
import json
import os
from datetime import datetime

def load_fundamental_data(symbol):
    """Load fundamental data from JSON files"""
    try:
        base_path = f'c:/Users/admin/Documents/JOB APP/FastAPI/TradeSignal/IBM/FundamentalData'
        
        # Load company overview
        overview_path = os.path.join(base_path, 'company_overview_20251003_182715.json')
        if os.path.exists(overview_path):
            with open(overview_path, 'r') as f:
                overview = json.load(f)
        else:
            overview = generate_sample_fundamental_data()
        
        return overview
        
    except Exception as e:
        print(f"Error loading fundamental data: {e}", file=sys.stderr)
        return generate_sample_fundamental_data()

def generate_sample_fundamental_data():
    """Generate sample fundamental data"""
    return {
        'Symbol': 'IBM',
        'Name': 'International Business Machines Corporation',
        'MarketCapitalization': 150000000000,
        'PERatio': 15.5,
        'DividendYield': 0.035,
        'EPS': 9.25,
        'BookValue': 25.50,
        'ProfitMargin': 0.12,
        'OperatingMarginTTM': 0.15,
        'ReturnOnAssetsTTM': 0.08,
        'ReturnOnEquityTTM': 0.25,
        'RevenueTTM': 60000000000,
        'GrossProfitTTM': 30000000000,
        'DilutedEPSTTM': 9.00,
        'QuarterlyRevenueGrowthYOY': 0.05,
        '52WeekHigh': 155.00,
        '52WeekLow': 120.00,
        'Beta': 0.85,
        'ForwardPE': 14.2
    }

def calculate_financial_health(data):
    """Calculate financial health score"""
    score = 0
    factors = []
    
    # P/E Ratio analysis
    pe = float(data.get('PERatio', 0))
    if 10 < pe < 20:
        score += 20
        factors.append('Reasonable P/E ratio')
    elif pe > 0 and pe <= 10:
        score += 15
        factors.append('Low P/E ratio (potentially undervalued)')
    
    # Profit Margin
    margin = float(data.get('ProfitMargin', 0))
    if margin > 0.15:
        score += 25
        factors.append('Strong profit margins')
    elif margin > 0.10:
        score += 15
        factors.append('Good profit margins')
    
    # ROE
    roe = float(data.get('ReturnOnEquityTTM', 0))
    if roe > 0.20:
        score += 25
        factors.append('Excellent return on equity')
    elif roe > 0.15:
        score += 15
        factors.append('Good return on equity')
    
    # Revenue Growth
    growth = float(data.get('QuarterlyRevenueGrowthYOY', 0))
    if growth > 0.10:
        score += 20
        factors.append('Strong revenue growth')
    elif growth > 0.05:
        score += 10
        factors.append('Moderate revenue growth')
    
    # Dividend Yield
    div_yield = float(data.get('DividendYield', 0))
    if div_yield > 0.03:
        score += 10
        factors.append('Attractive dividend yield')
    
    return {
        'score': min(score, 100),
        'rating': 'Strong' if score > 70 else 'Good' if score > 50 else 'Fair' if score > 30 else 'Weak',
        'factors': factors
    }

def main(args):
    """Main execution function"""
    try:
        symbol = args.get('symbol', 'IBM')
        
        # Load fundamental data
        data = load_fundamental_data(symbol)
        
        # Calculate metrics
        health = calculate_financial_health(data)
        
        # Format response
        result = {
            'symbol': symbol,
            'company_name': data.get('Name', 'Unknown'),
            'market_cap': float(data.get('MarketCapitalization', 0)),
            'pe_ratio': float(data.get('PERatio', 0)),
            'dividend_yield': float(data.get('DividendYield', 0)) * 100,
            'eps': float(data.get('EPS', 0)),
            'book_value': float(data.get('BookValue', 0)),
            'profit_margin': float(data.get('ProfitMargin', 0)) * 100,
            'operating_margin': float(data.get('OperatingMarginTTM', 0)) * 100,
            'roe': float(data.get('ReturnOnEquityTTM', 0)) * 100,
            'roa': float(data.get('ReturnOnAssetsTTM', 0)) * 100,
            'revenue_ttm': float(data.get('RevenueTTM', 0)),
            'revenue_growth_yoy': float(data.get('QuarterlyRevenueGrowthYOY', 0)) * 100,
            'week_52_high': float(data.get('52WeekHigh', 0)),
            'week_52_low': float(data.get('52WeekLow', 0)),
            'beta': float(data.get('Beta', 0)),
            'forward_pe': float(data.get('ForwardPE', 0)),
            'financial_health': health,
            'timestamp': datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        return {
            'error': True,
            'message': str(e),
            'symbol': args.get('symbol', 'UNKNOWN')
        }

if __name__ == '__main__':
    # Get arguments
    if len(sys.argv) > 1:
        args = json.loads(sys.argv[1])
    else:
        args = {}
    
    # Execute analysis
    result = main(args)
    
    # Output as JSON
    print(json.dumps(result))
