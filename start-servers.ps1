Write-Host "Starting Sebzy Application Servers..." -ForegroundColor Green
Write-Host ""

# Check if port 5000 is in use
Write-Host "Checking if port 5000 is in use..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($port5000) {
    Write-Host "Port 5000 is in use. Attempting to kill existing process..." -ForegroundColor Red
    foreach ($connection in $port5000) {
        try {
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "Killed process with PID: $($connection.OwningProcess)" -ForegroundColor Yellow
        }
        catch {
            Write-Host "Could not kill process: $($connection.OwningProcess)" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 