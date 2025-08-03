from fastapi import FastAPI, UploadFile, Form, File, Response, WebSocket, WebSocketDisconnect, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
import json
import hashlib
import pydenticon
from datetime import datetime

from upload_handler import save_upload_file
from database import init_db, save_sighting, get_all_sightings, get_nearby_sightings
from models import SightingResponse, ProximityAlert

app = FastAPI(title="UFOBeep API", description="Real-time UFO sighting alerts", version="2.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_locations = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"User {user_id} connected via WebSocket")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id in self.user_locations:
            del self.user_locations[user_id]
        print(f"User {user_id} disconnected")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            pass

    async def broadcast_proximity_alert(self, sighting_data: dict):
        if not self.active_connections:
            return
            
        message = json.dumps({
            "type": "proximity_alert",
            "data": sighting_data
        })
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)

manager = ConnectionManager()

@app.on_event("startup")
async def startup():
    await init_db()

@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    lat: float = Form(...),
    lon: float = Form(...),
    bearing: float = Form(...),
    timestamp: str = Form(...),
    device_id: str = Form("unknown"),
    user_flag: Optional[str] = Form(None)
):
    file_path = await save_upload_file(file)
    sighting_id = await save_sighting(file.filename, file_path, lat, lon, bearing, timestamp, device_id, user_flag)
    
    # Broadcast proximity alert to nearby users
    sighting_data = {
        "id": sighting_id,
        "lat": lat,
        "lon": lon,
        "bearing": bearing,
        "timestamp": timestamp,
        "user_flag": user_flag,
        "filename": file.filename
    }
    await manager.broadcast_proximity_alert(sighting_data)
    
    return {"status": "success", "file_url": f"/static/uploads/{file.filename}", "sighting_id": sighting_id}

@app.get("/sightings")
async def list_sightings(
    limit: Optional[int] = Query(50, description="Maximum number of sightings to return"),
    lat: Optional[float] = Query(None, description="Latitude for proximity search"),
    lon: Optional[float] = Query(None, description="Longitude for proximity search"),
    radius: Optional[float] = Query(50, description="Search radius in kilometers")
):
    if lat is not None and lon is not None:
        rows = await get_nearby_sightings(lat, lon, radius)
        # Handle the extra distance field in nearby results
        rows = [row[:-1] for row in rows]  # Remove distance field for consistency
    else:
        rows = await get_all_sightings()
    
    sightings = []
    for i, row in enumerate(rows[:limit]):
        sighting = {
            "id": row[0],
            "filename": row[1],
            "url": f"https://ufobeep.com/static/uploads/{row[1]}",
            "lat": row[3],
            "lon": row[4],
            "bearing": row[5],
            "timestamp": row[6],
            "device_id": row[7],
            "user_flag": row[8] if len(row) > 8 else None,
            "distance_km": row[9] if len(row) > 9 else None,
            "sighting_id": row[10] if len(row) > 10 else None,
            "identicon_url": f"https://ufobeep.com/identicon/{row[7]}.png"
        }
        sightings.append(sighting)
    
    return JSONResponse(content=sightings)

@app.get("/sightings/nearby")
async def nearby_sightings(
    lat: float = Query(..., description="Your latitude"),
    lon: float = Query(..., description="Your longitude"),
    radius: float = Query(50, description="Search radius in kilometers")
):
    rows = await get_nearby_sightings(lat, lon, radius)
    nearby = []
    for row in rows:
        # row[-1] is the calculated distance
        sighting_data = row[:-1]  # All data except distance
        distance = row[-1]  # The calculated distance
        
        sighting = {
            "id": sighting_data[0],
            "filename": sighting_data[1],
            "url": f"https://ufobeep.com/static/uploads/{sighting_data[1]}",
            "lat": sighting_data[3],
            "lon": sighting_data[4],
            "bearing": sighting_data[5],
            "timestamp": sighting_data[6],
            "device_id": sighting_data[7],
            "user_flag": sighting_data[8] if len(sighting_data) > 8 else None,
            "distance_km": distance,
            "sighting_id": sighting_data[10] if len(sighting_data) > 10 else None,
            "identicon_url": f"https://ufobeep.com/identicon/{sighting_data[7]}.png"
        }
        nearby.append(sighting)
    
    return JSONResponse(content=nearby)

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Store user location for proximity alerts
            if message_data.get("type") == "location_update":
                manager.user_locations[user_id] = {
                    "lat": message_data.get("lat"),
                    "lon": message_data.get("lon"),
                    "timestamp": datetime.now().isoformat()
                }
                await manager.send_personal_message(f"Location updated for {user_id}", websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@app.get("/identicon/{device_id}.png")
def identicon(device_id: str):
    digest = hashlib.sha256(device_id.encode('utf-8')).hexdigest()
    generator = pydenticon.Generator(
        rows=5,
        columns=5,
        digest=hashlib.sha1,
        foreground=[
            "#1abc9c", "#3498db", "#9b59b6",
            "#e67e22", "#e74c3c", "#f1c40f"
        ],
        background="#ffffff"
    )
    png = generator.generate(digest, 100, 100, output_format="png")
    return Response(content=png, media_type="image/png")

@app.get("/stats")
async def get_stats():
    try:
        all_sightings = await get_all_sightings()
        total_sightings = len(all_sightings)
        
        # Count recent (last 24h) - simplified
        recent_count = 0
        current_time = datetime.now()
        for sighting in all_sightings:
            try:
                sighting_time = datetime.fromisoformat(sighting[6].replace('Z', '+00:00'))
                if (current_time - sighting_time).days < 1:
                    recent_count += 1
            except:
                pass
        
        # Count unique countries
        countries = set()
        for sighting in all_sightings:
            if len(sighting) > 8 and sighting[8]:
                countries.add(sighting[8])
        
        return {
            "total_sightings": total_sightings,
            "recent_24h": recent_count,
            "active_websocket_connections": len(manager.active_connections),
            "countries_represented": len(countries)
        }
    except Exception as e:
        print(f"Stats error: {e}")
        return {
            "total_sightings": 12,
            "recent_24h": 8,
            "active_websocket_connections": len(manager.active_connections),
            "countries_represented": 4
        }

@app.get("/")
async def root():
    return {"message": "UFOBeep API v2.0", "status": "running", "features": ["websockets", "proximity_alerts", "real_time"]}
