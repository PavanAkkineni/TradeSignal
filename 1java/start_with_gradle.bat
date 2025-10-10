@echo off
echo ========================================
echo Starting Trading Analytics Platform
echo Using Gradle (No Maven Required!)
echo ========================================
echo.

:: Start Python backend in a new window
echo Starting Python Backend Service (FastAPI on port 8000)...
start "Python Backend" cmd /k "cd /d c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for Python backend to start
echo Waiting for Python backend to initialize...
timeout /t 5 /nobreak > nul

:: Start Spring Boot application with Gradle
echo Starting Spring Boot Frontend (on port 8080)...
echo.
cd /d "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal\1java"
.\gradlew.bat bootRun

pause
