@echo off
echo ==========================================
echo       Starting ManageMind Project
echo ==========================================
echo.

echo [1] Starting FastAPI Backend Server...
start "ManageMind Backend" cmd /c "cd backend && uvicorn app.main:app --reload"

echo [2] Starting Vite Frontend Server...
start "ManageMind Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo - Backend will be available at: http://localhost:8000
echo - Frontend will be available at: http://localhost:3001
echo.
echo Press any key to close this launcher window (servers will continue running in the background).
pause > nul
