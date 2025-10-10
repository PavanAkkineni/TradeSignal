# Set JAVA_HOME
$javaHome = "C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot"
$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

Write-Host "========================================"
Write-Host "Starting Spring Boot Application"
Write-Host "========================================"
Write-Host ""

# Check if Python backend is running
$pythonCheck = netstat -ano | Select-String ":8000"
if ($pythonCheck) {
    Write-Host "Python backend is running on port 8000"
} else {
    Write-Host "Starting Python backend..."
    $pythonPath = "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pythonPath'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "Starting Spring Boot on port 8080..."
Write-Host ""

# Run Maven wrapper
.\mvnw.cmd spring-boot:run
