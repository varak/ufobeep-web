#\!/bin/bash
cd /var/www/ufobeep.com/html
echo "Stopping existing API processes..."
pkill -f "uvicorn main:app" 2>/dev/null || true
sleep 2

echo "Starting enhanced UFOBeep API..."
source venv/bin/activate
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > api.log 2>&1 &

sleep 3
if curl -s http://localhost:8000/ > /dev/null; then
    echo "✅ UFOBeep API v2.0 started successfully on port 8000"
    echo "Features: WebSockets, Real-time alerts, Interactive map"
    echo "Access map at: http://ufobeep.com/map.html"
else
    echo "❌ Failed to start API"
    tail -10 api.log
fi
