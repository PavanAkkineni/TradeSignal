@echo off
echo ========================================
echo Starting Trading Analytics Platform
echo ========================================
echo.

:: Check if Python backend is running
echo Checking Python backend...
netstat -ano | findstr :8000 > nul
if %errorlevel% equ 0 (
    echo Python backend already running on port 8000
) else (
    echo Starting Python Backend Service (FastAPI on port 8000)...
    start cmd /k "cd /d c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    echo Waiting for Python backend to initialize...
    timeout /t 5 /nobreak > nul
)

echo.
echo ========================================
echo Python Backend: http://localhost:8000
echo ========================================
echo.
echo For Spring Boot (Java), you need to:
echo 1. Install Maven from https://maven.apache.org/download.cgi
echo 2. Or use your IDE to run TradingPlatformApplication.java
echo.
echo For now, you can access the full application at:
echo http://localhost:8000
echo.
pause
