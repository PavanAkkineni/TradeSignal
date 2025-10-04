"""
Trading Analytics Platform - Main FastAPI Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import os
from datetime import datetime

# Import our modules
from app.technical_analysis import TechnicalAnalyzer
from app.signal_generator import SignalGenerator
from app.data_loader import DataLoader
from app.fundamental_analysis import FundamentalAnalyzer
from app.sentiment_analysis import SentimentAnalyzer
from app.gemini_analyzer import GeminiAnalyzer

app = FastAPI(title="Trading Analytics Platform", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for frontend
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# Initialize components
data_loader = DataLoader()
technical_analyzer = TechnicalAnalyzer()
signal_generator = SignalGenerator()
fundamental_analyzer = FundamentalAnalyzer()
sentiment_analyzer = SentimentAnalyzer()
gemini_analyzer = GeminiAnalyzer()

# Request/Response Models
class StockRequest(BaseModel):
    symbol: str = "IBM"
    
class TechnicalIndicators(BaseModel):
    symbol: str
    current_price: float
    price_change: float
    price_change_percent: float
    volume: int
    sma_20: float
    sma_50: float
    sma_200: float
    ema_12: float
    ema_26: float
    rsi: float
    macd: Dict[str, float]
    bollinger_bands: Dict[str, float]
    support_resistance: Dict[str, List[float]]
    volume_analysis: Dict[str, Any]
    trend: str
    
class TradeSignal(BaseModel):
    signal: str  # BUY, SELL, HOLD
    strength: float  # -100 to 100
    confidence: float  # 0 to 100
    reasoning: List[str]
    risk_level: str  # LOW, MEDIUM, HIGH
    entry_price: float
    stop_loss: float
    take_profit: List[float]  # Multiple targets
    timeframe: str

@app.get("/")
async def root():
    """Serve the main dashboard"""
    return FileResponse("frontend/index.html")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/symbols")
async def get_available_symbols():
    """Get list of available symbols with data"""
    symbols = data_loader.get_available_symbols()
    return {"symbols": symbols, "default": "IBM"}

@app.get("/api/technical/{symbol}")
async def get_technical_analysis(symbol: str = "IBM"):
    """
    Get comprehensive technical analysis for a symbol
    """
    try:
        # Load price data
        price_data = data_loader.load_price_data(symbol)
        
        if price_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        # Calculate all technical indicators
        indicators = technical_analyzer.calculate_all_indicators(price_data)
        
        return {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "indicators": indicators,
            "chart_data": technical_analyzer.prepare_chart_data(price_data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/signals/{symbol}")
async def get_trade_signals(symbol: str = "IBM"):
    """
    Generate comprehensive trade signals based on all data types
    """
    try:
        # Load all data types
        price_data = data_loader.load_price_data(symbol)
        fundamental_data = data_loader.load_fundamental_data(symbol)
        sentiment_data = data_loader.load_sentiment_data(symbol)
        insider_data = data_loader.load_insider_data(symbol)
        
        # Calculate indicators from each analysis type
        if not price_data.empty:
            tech_indicators = technical_analyzer.calculate_all_indicators(price_data)
        else:
            tech_indicators = {}
        
        fund_metrics = fundamental_analyzer.analyze(fundamental_data) if fundamental_data else None
        sent_score = sentiment_analyzer.analyze(sentiment_data) if sentiment_data else None
        
        # Generate comprehensive trade signal
        signal = signal_generator.generate_signal(
            technical=tech_indicators,
            fundamental=fund_metrics,
            sentiment=sent_score,
            insider=insider_data
        )
        
        return {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "signal": signal
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/fundamental/{symbol}")
async def get_fundamental_analysis(symbol: str = "IBM"):
    """
    Get fundamental analysis for a symbol
    """
    try:
        fundamental_data = data_loader.load_fundamental_data(symbol)
        
        if not fundamental_data:
            raise HTTPException(status_code=404, detail=f"No fundamental data found for {symbol}")
        
        analysis = fundamental_analyzer.analyze(fundamental_data)
        
        return {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sentiment/{symbol}")
async def get_sentiment_analysis(symbol: str = "IBM"):
    """
    Get sentiment analysis for a symbol
    """
    try:
        sentiment_data = data_loader.load_sentiment_data(symbol)
        
        if not sentiment_data:
            raise HTTPException(status_code=404, detail=f"No sentiment data found for {symbol}")
        
        analysis = sentiment_analyzer.analyze(sentiment_data)
        
        return {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/overview/{symbol}")
async def get_stock_overview(symbol: str = "IBM"):
    """
    Get complete overview including price, volume, and key metrics
    """
    try:
        price_data = data_loader.load_price_data(symbol)
        company_info = data_loader.load_company_overview(symbol)
        
        # Get latest price info
        if not price_data.empty:
            latest_price = technical_analyzer.get_latest_price_info(price_data)
        else:
            latest_price = {'price': 0, 'open': 0, 'high': 0, 'low': 0, 'volume': 0}
        
        # Get key stats
        key_stats = {
            "market_cap": company_info.get("MarketCapitalization", 0),
            "pe_ratio": company_info.get("PERatio", 0),
            "dividend_yield": company_info.get("DividendYield", 0),
            "eps": company_info.get("EPS", 0),
            "beta": company_info.get("Beta", 0),
            "52_week_high": company_info.get("52WeekHigh", 0),
            "52_week_low": company_info.get("52WeekLow", 0),
            "shares_outstanding": company_info.get("SharesOutstanding", 0)
        }
        
        return {
            "symbol": symbol,
            "name": company_info.get("Name", symbol),
            "sector": company_info.get("Sector", "N/A"),
            "industry": company_info.get("Industry", "N/A"),
            "exchange": company_info.get("Exchange", "N/A"),
            "current_price": latest_price,
            "key_stats": key_stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fetch-data")
async def fetch_new_data(request: StockRequest):
    """
    Fetch fresh data for a new symbol from APIs
    """
    try:
        # This will trigger data fetching for a new symbol
        result = data_loader.fetch_data_for_symbol(request.symbol)
        
        if result["success"]:
            return {
                "success": True,
                "message": f"Data fetched successfully for {request.symbol}",
                "data_types": result["data_types"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai-analysis/{symbol}")
async def get_ai_analysis(symbol: str = "IBM"):
    """
    Get AI-powered analysis using Gemini
    """
    try:
        # Load all data types
        price_data = data_loader.load_price_data(symbol)
        fundamental_data = data_loader.load_fundamental_data(symbol)
        sentiment_data = data_loader.load_sentiment_data(symbol)
        
        # Calculate indicators
        tech_indicators = technical_analyzer.calculate_all_indicators(price_data) if not price_data.empty else {}
        
        # Get AI analysis
        ai_analysis = gemini_analyzer.analyze_comprehensive({
            'technical': tech_indicators,
            'fundamental': fundamental_data,
            'sentiment': sentiment_data
        })
        
        # Get AI trade recommendation
        ai_recommendation = gemini_analyzer.generate_trade_recommendation(
            tech_indicators,
            fundamental_data,
            sentiment_data
        )
        
        # Get market commentary
        commentary = gemini_analyzer.market_commentary(symbol)
        
        return {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "analysis": ai_analysis,
            "recommendation": ai_recommendation,
            "market_commentary": commentary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trading-expert/{symbol}")
async def get_trading_expert_analysis(symbol: str = "IBM"):
    """
    Get comprehensive trading expert analysis combining computed signals with AI insights
    """
    try:
        # Load price data and calculate technical indicators
        price_data = data_loader.load_price_data(symbol)
        
        if price_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        # Calculate technical indicators
        tech_indicators = technical_analyzer.calculate_all_indicators(price_data)
        
        # Generate computed signal using mathematical model
        computed_signal = signal_generator.generate_signal(
            technical=tech_indicators,
            fundamental=None,  # Focus on technical for now
            sentiment=None,
            insider=None
        )
        
        # Get individual signal breakdown (mock for now - you can implement this in signal_generator)
        individual_signals = {
            "rsi": {
                "signal": "OVERBOUGHT" if tech_indicators.get('rsi', 50) > 70 else "OVERSOLD" if tech_indicators.get('rsi', 50) < 30 else "NEUTRAL",
                "weight": "25%",
                "contribution": f"{tech_indicators.get('rsi', 50):.2f}"
            },
            "macd": {
                "signal": "BULLISH" if tech_indicators.get('macd', {}).get('histogram', 0) > 0 else "BEARISH",
                "weight": "20%", 
                "contribution": f"{tech_indicators.get('macd', {}).get('histogram', 0):.3f}"
            },
            "moving_averages": {
                "signal": "UPTREND" if tech_indicators.get('current_price', 0) > tech_indicators.get('sma', {}).get('sma_20', 0) else "DOWNTREND",
                "weight": "18%",
                "contribution": f"Price vs SMA20: {((tech_indicators.get('current_price', 0) / max(tech_indicators.get('sma', {}).get('sma_20', 1), 1) - 1) * 100):.2f}%"
            },
            "volume": {
                "signal": tech_indicators.get('volume_analysis', {}).get('signal', 'NEUTRAL').upper(),
                "weight": "15%",
                "contribution": f"{tech_indicators.get('volume_analysis', {}).get('ratio', 1):.2f}x"
            },
            "bollinger_bands": {
                "signal": "OVERBOUGHT" if tech_indicators.get('bollinger_bands', {}).get('percent_b', 0.5) > 0.8 else "OVERSOLD" if tech_indicators.get('bollinger_bands', {}).get('percent_b', 0.5) < 0.2 else "NEUTRAL",
                "weight": "12%",
                "contribution": f"%B: {tech_indicators.get('bollinger_bands', {}).get('percent_b', 0.5):.3f}"
            },
            "support_resistance": {
                "signal": "AT_RESISTANCE" if any(abs(tech_indicators.get('current_price', 0) - r) < 2 for r in tech_indicators.get('support_resistance', {}).get('resistance', [])) else "AT_SUPPORT" if any(abs(tech_indicators.get('current_price', 0) - s) < 2 for s in tech_indicators.get('support_resistance', {}).get('support', [])) else "NEUTRAL",
                "weight": "10%",
                "contribution": f"Next R: ${tech_indicators.get('support_resistance', {}).get('resistance', [0])[0] if tech_indicators.get('support_resistance', {}).get('resistance') else 'N/A'}"
            }
        }
        
        # Get Gemini trading expert analysis
        expert_analysis = gemini_analyzer.trading_expert_analysis(
            tech_indicators, 
            computed_signal, 
            individual_signals
        )
        
        return {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "computed_signal": {
                "action": computed_signal.get('signal', 'HOLD'),
                "strength": computed_signal.get('strength', 0),
                "confidence": computed_signal.get('confidence', 50),
                "reasoning": computed_signal.get('reasoning', [])
            },
            "individual_signals": individual_signals,
            "expert_analysis": expert_analysis,
            "technical_indicators": tech_indicators
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/education/{topic}")
async def get_educational_content(topic: str):
    """
    Get educational content for various trading concepts
    """
    educational_content = {
        "rsi": {
            "title": "Relative Strength Index (RSI) - Momentum Indicator",
            "description": "RSI is like a speedometer for stock prices. It measures how fast and how much a stock price has been moving up or down recently. Think of it as checking if a stock has been 'running too hot' (overbought) or 'running too cold' (oversold).",
            "what_it_is": "RSI compares recent gains to recent losses over a 14-day period and gives a score from 0 to 100. It's one of the most popular momentum indicators used by traders worldwide.",
            "why_important": "RSI helps you avoid buying stocks that are too expensive (overbought) or selling stocks that might be at a bargain price (oversold). It's like having a warning system for price extremes.",
            "how_to_read": [
                "RSI above 70: Stock might be overbought (consider selling or waiting)",
                "RSI below 30: Stock might be oversold (potential buying opportunity)", 
                "RSI between 30-70: Normal trading range",
                "RSI around 50: Balanced momentum (neither bullish nor bearish)"
            ],
            "signal_contribution": "25%",
            "contribution_explanation": "RSI contributes 25% to our final trading signal because momentum is crucial for timing entries and exits. High RSI values (above 70) send caution signals while low values (below 30) suggest potential buying opportunities.",
            "beginner_tip": "Think of RSI like a rubber band - when stretched too far in one direction (above 70 or below 30), it tends to snap back toward the middle.",
            "trading_strategy": "When RSI is above 70, wait for it to drop below 70 before buying. When below 30, it might be a good time to consider buying, but wait for confirmation from other indicators."
        },
        "macd": {
            "title": "MACD - Moving Average Convergence Divergence",
            "description": "MACD is like having two different speedometers for a stock - one fast and one slow - and comparing them to see if the stock is accelerating or slowing down. It's excellent for spotting trend changes before they happen.",
            "what_it_is": "MACD uses two moving averages (12-day fast, 26-day slow) and shows the relationship between them. It consists of three parts: MACD line, Signal line, and Histogram.",
            "why_important": "MACD helps you catch trend reversals early. It's like having an early warning system that tells you when a stock might be changing direction - either starting to go up or starting to go down.",
            "how_to_read": [
                "MACD Line above Signal Line: Bullish momentum (upward pressure)",
                "MACD Line below Signal Line: Bearish momentum (downward pressure)",
                "Histogram above zero: Bullish momentum increasing",
                "Histogram below zero: Bearish momentum increasing",
                "MACD crossing above zero line: Strong bullish signal",
                "MACD crossing below zero line: Strong bearish signal"
            ],
            "signal_contribution": "20%",
            "contribution_explanation": "MACD contributes 20% to our trading signal because it's excellent at confirming trend direction and momentum. Bullish MACD crossovers support BUY signals while bearish crossovers support SELL signals.",
            "beginner_tip": "Watch for the MACD line crossing above or below the red signal line - these crossovers are key trading signals. When they cross above, it's often bullish; when below, bearish.",
            "trading_strategy": "Buy when MACD crosses above the signal line and both are rising. Sell when MACD crosses below the signal line. The histogram helps confirm the strength of the move."
        },
        "moving_averages": {
            "title": "Moving Averages (SMA) - Trend Direction Indicators",
            "description": "Moving averages are like drawing a smooth trend line through bumpy price data. They help you see the 'big picture' direction of a stock by filtering out daily price noise and showing the underlying trend.",
            "what_it_is": "Simple Moving Averages (SMA) calculate the average price over specific time periods. We use SMA 20 (20 days), SMA 50 (50 days), and SMA 200 (200 days) to see short, medium, and long-term trends.",
            "why_important": "Moving averages help you determine if you're 'swimming with the current' or 'against the tide'. They show support and resistance levels and help identify trend strength and direction.",
            "how_to_read": [
                "Price above SMA: Uptrend (bullish)",
                "Price below SMA: Downtrend (bearish)",
                "SMAs stacked bullishly (20>50>200): Strong uptrend",
                "SMAs stacked bearishly (200>50>20): Strong downtrend",
                "Price bouncing off SMA: SMA acting as support/resistance"
            ],
            "signal_contribution": "18%",
            "contribution_explanation": "Moving averages contribute 18% because they provide crucial trend context. Price above rising moving averages supports upward movement, while price below falling averages suggests downward pressure.",
            "beginner_tip": "Think of moving averages as escalators - when price is above a rising moving average, you're riding the escalator up. When below a falling average, you're riding it down.",
            "trading_strategy": "Buy when price is above rising moving averages. Use pullbacks to moving averages as buying opportunities. Avoid buying when price is below falling averages."
        },
        "volume": {
            "title": "Volume Analysis - Market Participation Indicator",
            "description": "Volume is like counting how many people are voting with their money. High volume means lots of people agree with the price move, making it more reliable. Low volume means fewer people care, making the move less trustworthy.",
            "what_it_is": "Volume measures how many shares are traded during a specific period. We compare current volume to historical averages to see if there's unusual interest or participation in the stock.",
            "why_important": "Volume validates price movements. A price increase with high volume is much more reliable than one with low volume. It's like the difference between a crowd cheering versus one person clapping.",
            "how_to_read": [
                "High volume + price up: Strong bullish signal (many buyers)",
                "High volume + price down: Strong bearish signal (many sellers)", 
                "Low volume + price move: Weak signal (few participants)",
                "Volume ratio > 1.5: Above average interest",
                "Volume ratio < 0.7: Below average interest"
            ],
            "signal_contribution": "15%",
            "contribution_explanation": "Volume contributes 15% to our signal because it confirms the strength of price movements. High volume validates price moves while low volume suggests weaker conviction from traders.",
            "beginner_tip": "Imagine volume as applause after a performance. Loud applause (high volume) means the audience really likes it. Quiet applause (low volume) means they're not so sure.",
            "trading_strategy": "Look for price breakouts accompanied by high volume for stronger signals. Be cautious of price moves on low volume as they might reverse easily."
        },
        "bollinger": {
            "title": "Bollinger Bands - Volatility and Mean Reversion Indicator",
            "description": "Bollinger Bands are like creating a 'normal range' for a stock's price. They expand when the stock gets more volatile (bouncy) and contract when it's calm. They help identify when prices might be stretched too far from normal.",
            "what_it_is": "Bollinger Bands consist of three lines: a middle line (SMA 20), an upper band, and a lower band. The bands widen when volatility increases and narrow when it decreases.",
            "why_important": "Bollinger Bands help identify overbought and oversold conditions relative to recent price action. They're like having flexible boundaries that adjust to market conditions automatically.",
            "how_to_read": [
                "Price at upper band: Potentially overbought (might pullback)",
                "Price at lower band: Potentially oversold (might bounce)",
                "Price in middle: Normal trading range",
                "Bands widening: Increasing volatility (big moves coming)",
                "Bands narrowing: Decreasing volatility (consolidation)",
                "%B above 0.8: Near upper band (overbought territory)"
            ],
            "signal_contribution": "12%",
            "contribution_explanation": "Bollinger Bands contribute 12% because they provide context about price extremes and volatility. Price near upper bands suggests overbought conditions while price near lower bands suggests oversold conditions.",
            "beginner_tip": "Think of Bollinger Bands like the lanes on a highway. When price touches the outer lanes (bands), it often bounces back toward the center lane.",
            "trading_strategy": "Buy when price bounces off the lower band and sell when it reaches the upper band. Look for band squeezes (narrow bands) as they often precede big moves."
        },
        "support_resistance": {
            "title": "Support & Resistance - Price Level Psychology",
            "description": "Support and resistance levels are like psychological barriers where traders tend to make similar decisions. Support is where buying interest typically emerges, and resistance is where selling pressure usually appears.",
            "what_it_is": "Support levels are price points where the stock has historically found buying interest and bounced higher. Resistance levels are where selling pressure has historically emerged, preventing further price increases.",
            "why_important": "These levels help predict where price might pause, reverse, or break through. They represent collective market memory and trader psychology at specific price points.",
            "how_to_read": [
                "Price approaching support: Potential buying opportunity",
                "Price approaching resistance: Potential selling opportunity",
                "Support break: Bearish signal (could become new resistance)",
                "Resistance break: Bullish signal (could become new support)",
                "Multiple touches make levels stronger"
            ],
            "signal_contribution": "10%",
            "contribution_explanation": "Support and resistance contribute 10% to our signal by identifying key price levels for entries and exits. Price near resistance suggests potential selling pressure while price near support suggests buying opportunities.",
            "beginner_tip": "Think of support and resistance like floors and ceilings in a building. Price bounces between these levels until it finds enough energy (volume) to break through.",
            "trading_strategy": "Buy near support levels with stop losses below support. Sell near resistance levels or wait for breakouts above resistance with high volume confirmation."
        }
    }
    
    # Topic aliases for backward compatibility and different naming conventions
    topic_aliases = {
        "sma": "moving_averages",
        "support": "support_resistance"
    }
    
    # Check if topic exists directly or through alias
    actual_topic = topic_aliases.get(topic, topic)
    
    if actual_topic in educational_content:
        return educational_content[actual_topic]
    else:
        raise HTTPException(status_code=404, detail="Educational content not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
