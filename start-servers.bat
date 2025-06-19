@echo off
echo Starting Sebzy Application Servers...
echo.

echo Checking if port 5000 is in use...
netstat -ano | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo Port 5000 is in use. Attempting to kill existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        taskkill /PID %%a /F > nul 2>&1
    )
    echo Process killed.
    timeout /t 2 > nul
)

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul 