@echo off
echo ========================================
echo Starting Trading Analytics Platform
echo SINGLE SERVER MODE - Spring Boot Only
echo ========================================
echo.

:: Check if Python is installed
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python to use the embedded analysis features
    pause
    exit /b 1
)
echo Python found successfully!
echo.

:: Navigate to the Java application directory
cd /d "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal\1java"

:: Check if Maven is installed
echo Checking Maven installation...
call mvn --version 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Maven is not found in PATH
    echo.
    echo Options:
    echo 1. Install Maven from https://maven.apache.org/download.cgi
    echo 2. Or run manually: mvn spring-boot:run
    echo 3. Or use Gradle: gradlew bootRun
    echo.
    pause
    exit /b 1
)
echo Maven found successfully!
echo.

:: Install Python dependencies if needed
echo Checking Python dependencies...
pip show pandas >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing required Python packages...
    pip install pandas numpy matplotlib
)
echo Python dependencies ready!
echo.

:: Clean and build the Spring Boot application
echo Building Spring Boot application...
mvn clean compile
if %errorlevel% neq 0 (
    echo ERROR: Failed to build the application
    pause
    exit /b 1
)
echo.

:: Start Spring Boot application (embedded Python mode)
echo ========================================
echo Starting Spring Boot on http://localhost:8080
echo Python scripts will run embedded - NO SEPARATE SERVER NEEDED!
echo ========================================
echo.
echo Application Features:
echo - Technical Analysis with Python-powered indicators
echo - Fundamental Analysis with financial metrics
echo - Sentiment Analysis
echo - Trade Signal Generation
echo - Educational Content with working info buttons
echo.
echo Press Ctrl+C to stop the application
echo.

mvn spring-boot:run

pause
