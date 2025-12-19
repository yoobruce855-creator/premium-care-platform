@echo off
echo ========================================
echo  Premium Care Platform - Starting...
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /c "cd backend && node server.js"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /c "npm run dev"

echo.
echo ========================================
echo  Servers Starting!
echo ========================================
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to stop all servers...
pause > nul

taskkill /FI "WINDOWTITLE eq Backend Server*" /T /F
taskkill /FI "WINDOWTITLE eq Frontend Server*" /T /F
