@echo off
REM Stock Game Frontend Startup Script for Windows
REM Starts the React frontend development server

echo Checking if frontend directory exists...
if not exist "frontend" (
    echo ERROR: Frontend directory not found. Run this from the project root.
    exit /b 1
)

cd frontend

echo Installing frontend dependencies (if needed)...
if not exist "node_modules" (
    call npm install
)

echo Starting React frontend on port 5173...
call npm run dev

pause