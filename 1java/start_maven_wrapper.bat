@echo off
echo ========================================
echo Starting Spring Boot with Maven Wrapper
echo ========================================
echo.

:: Navigate to project directory
cd /d "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal\1java"

:: Start Spring Boot with Maven Wrapper
echo Starting Spring Boot on port 8080...
echo.
.\mvnw.cmd spring-boot:run

pause
