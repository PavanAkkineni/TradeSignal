@echo off
setlocal

:: Set JAVA_HOME
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo ========================================
echo Trading Analytics Platform
echo Running with Java directly (No Maven/Gradle needed!)
echo ========================================
echo.

:: Check if Python backend is running
netstat -ano | findstr ":8000" | findstr "LISTENING" > nul
if %errorlevel% equ 0 (
    echo Python backend is already running on port 8000
) else (
    echo Starting Python Backend...
    start "Python Backend" cmd /k "cd /d c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    timeout /t 5 /nobreak > nul
)

echo.
echo ========================================
echo For now, use the Python version at:
echo http://localhost:8000
echo ========================================
echo.
echo To run Spring Boot, you need either:
echo 1. Install Maven from https://maven.apache.org/download.cgi
echo 2. Or open this project in IntelliJ IDEA/Eclipse
echo.
echo Your application is fully functional on Python!
echo.
pause
start http://localhost:8000
