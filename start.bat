@echo off
REM Start both backend and frontend servers for Windows

echo 🚀 Starting AI Website Builder...
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ Error: .env.local file not found!
    echo Please create .env.local with your GEMINI_API_KEY
    echo.
    echo Example:
    echo   GEMINI_API_KEY=your_key_here
    echo   PORT=5000
    exit /b 1
)

REM Start backend in separate window
echo 📦 Starting backend server...
start "Backend Server" cmd /k npm run server

REM Wait for backend to start
timeout /t 2 /nobreak

REM Start frontend in separate window
echo 🌐 Starting frontend server...
start "Frontend Server" cmd /k npm run dev

echo.
echo ✅ Both servers are running in separate windows!
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo Close the windows to stop the servers.
