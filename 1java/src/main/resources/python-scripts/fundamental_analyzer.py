#!/usr/bin/env python
"""
Fundamental Analysis Script - Embedded in Spring Boot
"""
import sys
import json
import os
from datetime import datetime

def load_fundamental_data(symbol):
    """Load fundamental data from bundled files, API, or generate demo data"""
    try:
        # Try to load from bundled data files (relative to script location)
        import glob
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Look in multiple locations
        data_paths = [
            os.path.join(script_dir, '../data/FundamentalData/company_overview_*.json'),
            'data/FundamentalData/company_overview_*.json',
            '../data/FundamentalData/company_overview_*.json',
        ]
        
        for pattern in data_paths:
            files = glob.glob(pattern)
            if files:
                print(f"Loading data from: {files[0]}", file=sys.stderr)
                return load_from_json_file(files[0])
        
        # If no files found, try API
        api_key = os.environ.get('ALPHA_VANTAGE_API_KEY')
        if api_key:
            print(f"Loading data from Alpha Vantage API", file=sys.stderr)
            return load_from_api(symbol, api_key)
        
        # Fallback to demo data
        print(f"Warning: Using demo data. Real data files not found and ALPHA_VANTAGE_API_KEY not set.", file=sys.stderr)
        return generate_sample_fundamental_data()
        
    except Exception as e:
        print(f"Error loading fundamental data: {e}", file=sys.stderr)
        return generate_sample_fundamental_data()

def load_from_json_file(filepath):
    """Load data from Alpha Vantage JSON file"""
    with open(filepath, 'r') as f:
        return json.load(f)

def load_from_api(symbol, api_key):
    """Load data from Alpha Vantage API"""
    import requests
    
    url = f'https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey={api_key}'
    response = requests.get(url)
    data = response.json()
    
    if 'Symbol' not in data:
        raise Exception(f"API error: {data.get('Note', data.get('Error Message', 'Unknown error'))}")
    
    return data

def generate_sample_fundamental_data():
    """Generate sample fundamental data (fallback only)"""
    return {
        'Symbol': 'IBM',
        'Name': 'International Business Machines Corporation',
        'MarketCapitalization': '150000000000',
        'PERatio': '15.5',
        'DividendYield': '0.035',
        'EPS': '9.25',
        'BookValue': '25.50',
        'ProfitMargin': '0.12',
        'OperatingMarginTTM': '0.15',
        'ReturnOnAssetsTTM': '0.08',
        'ReturnOnEquityTTM': '0.25',
        'RevenueTTM': '60000000000',
        'GrossProfitTTM': '30000000000',
        'DilutedEPSTTM': '9.00',
        'QuarterlyRevenueGrowthYOY': '0.05',
        '52WeekHigh': '155.00',
        '52WeekLow': '120.00',
        'Beta': '0.85',
        'ForwardPE': '14.2'
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
        
        # Helper function to safely convert to float
        def safe_float(value, default=0.0):
            try:
                if value in [None, '', 'None', 'null']:
                    return default
                return float(str(value).replace(',', ''))
            except (ValueError, AttributeError):
                return default
        
        # Format response with ALL available data
        result = {
            'symbol': symbol,
            'company_name': data.get('Name', 'Unknown'),
            'description': data.get('Description', ''),
            'sector': data.get('Sector', ''),
            'industry': data.get('Industry', ''),
            'market_cap': safe_float(data.get('MarketCapitalization', 0)),
            'pe_ratio': safe_float(data.get('PERatio', 0)),
            'peg_ratio': safe_float(data.get('PEGRatio', 0)),
            'trailing_pe': safe_float(data.get('TrailingPE', 0)),
            'forward_pe': safe_float(data.get('ForwardPE', 0)),
            'price_to_book': safe_float(data.get('PriceToBookRatio', 0)),
            'price_to_sales': safe_float(data.get('PriceToSalesRatioTTM', 0)),
            'dividend_yield': safe_float(data.get('DividendYield', 0)) * 100,
            'dividend_per_share': safe_float(data.get('DividendPerShare', 0)),
            'eps': safe_float(data.get('EPS', 0)),
            'diluted_eps': safe_float(data.get('DilutedEPSTTM', 0)),
            'book_value': safe_float(data.get('BookValue', 0)),
            'revenue_per_share': safe_float(data.get('RevenuePerShareTTM', 0)),
            'profit_margin': safe_float(data.get('ProfitMargin', 0)) * 100,
            'operating_margin': safe_float(data.get('OperatingMarginTTM', 0)) * 100,
            'roe': safe_float(data.get('ReturnOnEquityTTM', 0)) * 100,
            'roa': safe_float(data.get('ReturnOnAssetsTTM', 0)) * 100,
            'revenue_ttm': safe_float(data.get('RevenueTTM', 0)),
            'gross_profit_ttm': safe_float(data.get('GrossProfitTTM', 0)),
            'ebitda': safe_float(data.get('EBITDA', 0)),
            'revenue_growth_yoy': safe_float(data.get('QuarterlyRevenueGrowthYOY', 0)) * 100,
            'earnings_growth_yoy': safe_float(data.get('QuarterlyEarningsGrowthYOY', 0)) * 100,
            'week_52_high': safe_float(data.get('52WeekHigh', 0)),
            'week_52_low': safe_float(data.get('52WeekLow', 0)),
            'day_50_moving_avg': safe_float(data.get('50DayMovingAverage', 0)),
            'day_200_moving_avg': safe_float(data.get('200DayMovingAverage', 0)),
            'beta': safe_float(data.get('Beta', 0)),
            'shares_outstanding': safe_float(data.get('SharesOutstanding', 0)),
            'analyst_target_price': safe_float(data.get('AnalystTargetPrice', 0)),
            'analyst_rating_strong_buy': int(safe_float(data.get('AnalystRatingStrongBuy', 0))),
            'analyst_rating_buy': int(safe_float(data.get('AnalystRatingBuy', 0))),
            'analyst_rating_hold': int(safe_float(data.get('AnalystRatingHold', 0))),
            'analyst_rating_sell': int(safe_float(data.get('AnalystRatingSell', 0))),
            'analyst_rating_strong_sell': int(safe_float(data.get('AnalystRatingStrongSell', 0))),
            'financial_health': health,
            'timestamp': datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        print(f"Error in main: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
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
