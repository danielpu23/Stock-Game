@echo off
REM Stock Game Backend Startup Script for Windows
REM Starts the Spring Boot backend with local PostgreSQL database

echo Checking if backend directory exists...
if not exist "backend" (
    echo ERROR: Backend directory not found. Run this from the project root.
    exit /b 1
)

cd backend

echo Building Spring Boot backend...
call .\mvnw.cmd clean package -DskipTests

echo Starting Spring Boot backend on port 8080...
java -jar target\stock-game-0.0.1-SNAPSHOT.jar

pause