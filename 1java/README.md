# Trading Analytics Platform - Spring Boot + Python

## Architecture Overview
This trading analytics platform uses a hybrid architecture:
- **Spring Boot (Java)**: Web framework, API routing, and frontend serving
- **FastAPI (Python)**: Data analysis, technical indicators, sentiment analysis, and ML processing
- **Frontend**: HTML/CSS/JavaScript with Chart.js for visualization

## Prerequisites
- Java 17 or higher
- Maven 3.6+
- Python 3.8+
- Required Python packages (see parent directory requirements.txt)

## Project Structure
```
1java/
├── src/
│   ├── main/
│   │   ├── java/com/tradesignal/
│   │   │   ├── controller/        # REST controllers
│   │   │   ├── model/             # Data models
│   │   │   ├── service/           # Service layer
│   │   │   └── TradingPlatformApplication.java
│   │   └── resources/
│   │       ├── static/            # CSS, JS files
│   │       ├── templates/         # HTML templates
│   │       └── application.properties
├── pom.xml                        # Maven configuration
├── start_application.bat          # Windows startup script
└── run_python_backend.py          # Python backend runner
```

## Installation

### 1. Install Python Dependencies
```bash
cd "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal"
pip install -r requirements.txt
```

### 2. Build Spring Boot Application
```bash
cd "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal\1java"
mvn clean install
```

## Running the Application

### Option 1: Using the Startup Script (Recommended)
```bash
# Navigate to the Java application directory
cd "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal\1java"

# Run the startup script
start_application.bat
```
This will:
1. Start the Python backend on port 8000
2. Start the Spring Boot frontend on port 8080
3. Open your browser to http://localhost:8080

### Option 2: Manual Startup

#### Step 1: Start Python Backend
```bash
cd "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Step 2: Start Spring Boot Frontend
```bash
cd "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal\1java"
mvn spring-boot:run
```

## Accessing the Application
- **Main Application**: http://localhost:8080
- **Python Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## API Endpoints

### Spring Boot Endpoints (Port 8080)
- `GET /` - Main dashboard
- `GET /api/technical/{symbol}` - Technical analysis
- `GET /api/fundamental/{symbol}` - Fundamental analysis  
- `GET /api/sentiment/{symbol}` - Sentiment analysis
- `GET /api/signals/{symbol}` - Trade signals
- `GET /api/overview/{symbol}` - Stock overview
- `GET /api/symbols` - Available symbols
- `GET /api/trading-expert/{symbol}` - Expert analysis
- `GET /api/education/{topic}` - Educational content

### Python Backend Endpoints (Port 8000)
All the same endpoints as above, but accessed directly on port 8000

## Features

### 1. Technical Analysis
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Moving Averages (SMA/EMA)
- Bollinger Bands
- Support & Resistance levels
- Volume Analysis

### 2. Fundamental Analysis
- Financial ratios (P/E, P/B, etc.)
- Revenue and earnings growth
- Profitability metrics
- Financial health indicators

### 3. Sentiment Analysis
- News sentiment scoring
- Social media buzz metrics
- Earnings transcript analysis
- Trend detection

### 4. Trade Signals
- Comprehensive signal generation
- Risk assessment
- Entry/exit points
- Confidence scoring

## Configuration

### Spring Boot Configuration
Edit `src/main/resources/application.properties`:
```properties
server.port=8080
python.backend.url=http://localhost:8000
python.backend.timeout=30000
```

### Python Backend Configuration
The Python backend configuration is in the parent directory's `app/` folder.

## Troubleshooting

### Issue: Python backend not starting
- Ensure all Python dependencies are installed
- Check if port 8000 is available
- Verify Python path in environment variables

### Issue: Spring Boot not connecting to Python
- Verify Python backend is running on port 8000
- Check firewall settings
- Review logs in console output

### Issue: Frontend not loading properly
- Clear browser cache
- Check browser console for JavaScript errors
- Ensure static resources are properly copied

## Development

### Adding New Features
1. Add endpoint in Python backend (`app/main.py`)
2. Create corresponding service method in `TradingAnalyticsService.java`
3. Add controller endpoint in `TradingAnalyticsController.java`
4. Update frontend JavaScript to use new endpoint

### Building for Production
```bash
mvn clean package
java -jar target/trade-signal-platform-1.0.0.jar
```

## License
MIT

## Support
For issues or questions, please check the logs in both Python and Spring Boot consoles.
