#!/usr/bin/env python
"""
Technical Analysis Script - Embedded in Spring Boot
Executes technical analysis without needing a separate server
"""
import sys
import json
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# No hardcoded paths - works in Docker and locally

def calculate_rsi(prices, period=14):
    """Calculate RSI"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return float(rsi.iloc[-1]) if not rsi.empty else 50.0

def calculate_macd(prices):
    """Calculate MACD"""
    exp1 = prices.ewm(span=12, adjust=False).mean()
    exp2 = prices.ewm(span=26, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    histogram = macd - signal
    
    return {
        'macd': float(macd.iloc[-1]) if not macd.empty else 0,
        'signal': float(signal.iloc[-1]) if not signal.empty else 0,
        'histogram': float(histogram.iloc[-1]) if not histogram.empty else 0
    }

def calculate_bollinger_bands(prices, period=20, std_dev=2):
    """Calculate Bollinger Bands"""
    sma = prices.rolling(window=period).mean()
    std = prices.rolling(window=period).std()
    
    upper = sma + (std * std_dev)
    lower = sma - (std * std_dev)
    
    return {
        'upper': float(upper.iloc[-1]) if not upper.empty else 0,
        'middle': float(sma.iloc[-1]) if not sma.empty else 0,
        'lower': float(lower.iloc[-1]) if not lower.empty else 0
    }

def calculate_moving_averages(prices):
    """Calculate various moving averages"""
    return {
        'sma_20': float(prices.rolling(window=20).mean().iloc[-1]) if len(prices) >= 20 else 0,
        'sma_50': float(prices.rolling(window=50).mean().iloc[-1]) if len(prices) >= 50 else 0,
        'sma_200': float(prices.rolling(window=200).mean().iloc[-1]) if len(prices) >= 200 else 0
    }

def analyze_volume(volume_data, avg_period=20):
    """Analyze volume patterns"""
    if len(volume_data) < avg_period:
        return {
            'current': 0,
            'average': 0,
            'ratio': 1.0,
            'status': 'Normal'
        }
    
    current = float(volume_data.iloc[-1])
    average = float(volume_data.rolling(window=avg_period).mean().iloc[-1])
    ratio = current / average if average > 0 else 1.0
    
    if ratio > 1.5:
        status = 'High volume'
    elif ratio < 0.5:
        status = 'Low volume'
    else:
        status = 'Normal volume activity'
    
    return {
        'current': int(current),
        'average': int(average),
        'ratio': round(ratio, 2),
        'status': status
    }

def calculate_support_resistance(prices):
    """Calculate support and resistance levels"""
    # Simple implementation using recent highs and lows
    recent_prices = prices.tail(50) if len(prices) >= 50 else prices
    
    # Find local maxima and minima
    high = float(recent_prices.max())
    low = float(recent_prices.min())
    current = float(prices.iloc[-1])
    
    # Calculate pivot points
    pivot = (high + low + current) / 3
    r1 = (2 * pivot) - low
    r2 = pivot + (high - low)
    s1 = (2 * pivot) - high
    s2 = pivot - (high - low)
    
    return {
        'resistance': [
            {'level': round(r2, 2), 'strength': 'Strong'},
            {'level': round(r1, 2), 'strength': 'Medium'},
            {'level': round(high, 2), 'strength': 'Weak'}
        ],
        'support': [
            {'level': round(low, 2), 'strength': 'Strong'},
            {'level': round(s1, 2), 'strength': 'Medium'},
            {'level': round(s2, 2), 'strength': 'Weak'}
        ]
    }

def load_price_data(symbol):
    """Load price data from bundled files, API, or generate demo data"""
    try:
        # Try to load from bundled data files (relative to script location)
        import glob
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Look in multiple locations
        data_paths = [
            os.path.join(script_dir, '../data/TechnicalAnalysis/ibm_daily_adjusted_*.json'),
            'data/TechnicalAnalysis/ibm_daily_adjusted_*.json',
            '../data/TechnicalAnalysis/ibm_daily_adjusted_*.json',
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
        return generate_sample_data()
        
    except Exception as e:
        print(f"Error loading data: {e}", file=sys.stderr)
        return generate_sample_data()

def load_from_json_file(filepath):
    """Load data from Alpha Vantage JSON file"""
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    # Parse Alpha Vantage daily adjusted format
    time_series = data.get('Time Series (Daily)', {})
    
    records = []
    for date_str, values in time_series.items():
        records.append({
            'date': date_str,
            'open': float(values.get('1. open', 0)),
            'high': float(values.get('2. high', 0)),
            'low': float(values.get('3. low', 0)),
            'close': float(values.get('4. close', 0)),
            'volume': int(values.get('6. volume', 0))
        })
    
    df = pd.DataFrame(records)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    df = df.set_index('date')
    
    return df

def load_from_api(symbol, api_key):
    """Load data from Alpha Vantage API"""
    import requests
    
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={symbol}&apikey={api_key}&outputsize=full'
    response = requests.get(url)
    data = response.json()
    
    if 'Time Series (Daily)' not in data:
        raise Exception(f"API error: {data.get('Note', data.get('Error Message', 'Unknown error'))}")
    
    return load_from_json_file_data(data)

def generate_sample_data():
    """Generate sample price data for testing"""
    dates = pd.date_range(end=datetime.now(), periods=200, freq='D')
    base_price = 100
    
    prices = []
    volumes = []
    
    for i in range(len(dates)):
        # Random walk for price
        change = np.random.randn() * 2
        base_price = max(base_price * (1 + change/100), 10)
        
        prices.append({
            'open': base_price * (1 + np.random.randn() * 0.01),
            'high': base_price * (1 + abs(np.random.randn()) * 0.02),
            'low': base_price * (1 - abs(np.random.randn()) * 0.02),
            'close': base_price,
            'volume': int(np.random.uniform(1000000, 10000000))
        })
    
    df = pd.DataFrame(prices, index=dates)
    return df

def main(args):
    """Main execution function"""
    try:
        # Parse arguments
        symbol = args.get('symbol', 'IBM')
        
        # Load price data
        df = load_price_data(symbol)
        
        # Calculate all indicators
        close_prices = df['close']
        volumes = df['volume']
        
        # Get current price info
        current_price = float(close_prices.iloc[-1])
        prev_close = float(close_prices.iloc[-2]) if len(close_prices) > 1 else current_price
        price_change = current_price - prev_close
        price_change_percent = (price_change / prev_close * 100) if prev_close > 0 else 0
        
        # Calculate technical indicators
        rsi = calculate_rsi(close_prices)
        macd = calculate_macd(close_prices)
        bollinger = calculate_bollinger_bands(close_prices)
        moving_averages = calculate_moving_averages(close_prices)
        volume_analysis = analyze_volume(volumes)
        support_resistance = calculate_support_resistance(close_prices)
        
        # Determine RSI status
        if rsi > 70:
            rsi_status = 'Overbought'
        elif rsi < 30:
            rsi_status = 'Oversold'
        else:
            rsi_status = 'Neutral'
        
        # Build response
        result = {
            'symbol': symbol,
            'current_price': round(current_price, 2),
            'price_change': round(price_change, 2),
            'price_change_percent': round(price_change_percent, 2),
            'rsi': {
                'value': round(rsi, 2),
                'status': rsi_status
            },
            'macd': macd,
            'bollinger_bands': bollinger,
            'moving_averages': moving_averages,
            'volume_analysis': volume_analysis,
            'support_resistance': support_resistance,
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
    # Get arguments from command line
    if len(sys.argv) > 1:
        args = json.loads(sys.argv[1])
    else:
        args = {}
    
    # Execute analysis
    result = main(args)
    
    # Output as JSON
    print(json.dumps(result))
