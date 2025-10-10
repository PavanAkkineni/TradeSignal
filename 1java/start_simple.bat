@echo off
echo ========================================
echo Starting Trading Analytics Platform
echo ========================================
echo.

:: Start Python backend
echo Starting Python Backend (port 8000)...
start "Python Backend" cmd /k "cd /d c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo Application Started!
echo ========================================
echo.
echo Python Backend (with all features): http://localhost:8000
echo.
echo Your application is ready with:
echo - Technical Analysis
echo - Fundamental Analysis  
echo - Sentiment Analysis
echo - Trade Signals
echo - Expert Analysis
echo.
echo Press any key to open in browser...
pause > nul
start http://localhost:8000
