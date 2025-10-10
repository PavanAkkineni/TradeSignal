@echo off
echo ========================================
echo Finding and Running Maven
echo ========================================
echo.

:: Try common Maven locations
set MAVEN_HOME=
if exist "C:\apache-maven\bin\mvn.cmd" set MAVEN_HOME=C:\apache-maven
if exist "C:\Program Files\Apache\Maven\bin\mvn.cmd" set MAVEN_HOME=C:\Program Files\Apache\Maven
if exist "C:\Program Files\apache-maven\bin\mvn.cmd" set MAVEN_HOME=C:\Program Files\apache-maven
if exist "%USERPROFILE%\apache-maven\bin\mvn.cmd" set MAVEN_HOME=%USERPROFILE%\apache-maven

if "%MAVEN_HOME%"=="" (
    echo ERROR: Maven not found in common locations!
    echo.
    echo Please tell me where you installed Maven.
    echo Common locations:
    echo - C:\apache-maven
    echo - C:\Program Files\Apache\Maven
    echo - %USERPROFILE%\apache-maven
    echo.
    pause
    exit /b 1
)

echo Found Maven at: %MAVEN_HOME%
echo.

:: Set JAVA_HOME
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot"

:: Start Python backend if not running
netstat -ano | findstr ":8000" | findstr "LISTENING" > nul
if %errorlevel% neq 0 (
    echo Starting Python Backend...
    start "Python Backend" cmd /k "cd /d c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    timeout /t 5 /nobreak > nul
)

echo Starting Spring Boot with Maven...
echo.
cd /d "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal\1java"
"%MAVEN_HOME%\bin\mvn.cmd" spring-boot:run

pause
