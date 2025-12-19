@echo off
REM Premium Care Platform - Unified Startup Script
REM This script starts both backend and frontend servers

echo ========================================
echo  Premium Care Platform - Starting...
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Checking backend dependencies...
cd backend
if not exist "node_modules\" (
    echo Installing backend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies OK
)

echo.
echo [2/5] Checking frontend dependencies...
cd ..
if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies OK
)

echo.
echo [3/5] Starting backend server...
start "Premium Care - Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [4/5] Starting frontend server...
start "Premium Care - Frontend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [5/5] Servers starting...
echo.
echo ========================================
echo  Premium Care Platform - READY!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:3000

echo.
echo To stop the servers, close the terminal windows.
echo.
