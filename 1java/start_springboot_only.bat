@echo off
echo ========================================
echo Starting Spring Boot Application ONLY
echo ========================================
echo.

:: Navigate to project directory
cd /d "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal\1java"

:: Start Spring Boot with Maven
echo Starting Spring Boot on port 8080...
echo.
mvn spring-boot:run

pause
