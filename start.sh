#!/bin/bash

# Start both backend and frontend servers
echo "🚀 Starting AI Website Builder..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your GEMINI_API_KEY"
    echo ""
    echo "Example:"
    echo "  GEMINI_API_KEY=your_key_here"
    echo "  PORT=5000"
    exit 1
fi

# Start backend in background
echo "📦 Starting backend server..."
npm run server &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
echo "🌐 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
wait
