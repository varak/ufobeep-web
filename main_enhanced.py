from fastapi import FastAPI, UploadFile, Form, File, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from upload_handler import save_upload_file
from database import init_db, save_sighting, get_all_sightings, get_nearby_sightings
import math
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI(title="UFOBeep API", version="1.0.0")

# Enable CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup():
    await init_db()

@app.get("/")
async def root():
    return {"message": "UFOBeep API v1.0.0", "status": "active"}

@app.post("/upload")
async def upload_sighting(
    file: UploadFile = File(...),
    lat: float = Form(...),
    lon: float = Form(...),
    bearing: float = Form(...),
    timestamp: str = Form(...),
    device_id: str = Form("unknown"),
    media_type: str = Form("photo")  # "photo" or "video"
):
    """Upload a UFO sighting with media file and metadata"""
    try:
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Invalid coordinates")
        
        # Validate bearing
        if not (0 <= bearing <= 360):
            raise HTTPException(status_code=400, detail="Bearing must be 0-360 degrees")
        
        # Save uploaded file
        file_path = await save_upload_file(file)
        
        # Save sighting to database
        await save_sighting(file.filename, file_path, lat, lon, bearing, timestamp, device_id, media_type)
        
        return {
            "status": "success", 
            "message": "Sighting uploaded successfully",
            "file_url": f"/static/uploads/{file.filename}",
            "sighting_id": "generated"  # In real implementation, return actual ID
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/sightings")
async def list_sightings(
    limit: int = Query(50, description="Maximum number of sightings to return"),
    offset: int = Query(0, description="Number of sightings to skip")
):
    """Get all sightings with pagination"""
    try:
        rows = await get_all_sightings(limit, offset)
        sightings = []
        for row in rows:
            sightings.append({
                "id": row[0],
                "filename": row[1],
                "url": f"https://ufobeep.com/static/uploads/{row[1]}",
                "lat": row[3],
                "lon": row[4],
                "bearing": row[5],
                "timestamp": row[6],
                "device_id": row[7],
                "media_type": row[8] if len(row) > 8 else "photo",
                "created_at": row[6]  # Using timestamp as created_at for now
            })
        return JSONResponse(content=sightings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sightings: {str(e)}")

@app.get("/sightings/nearby")
async def get_nearby_sightings_endpoint(
    lat: float = Query(..., description="Latitude of current location"),
    lon: float = Query(..., description="Longitude of current location"),
    radius_km: float = Query(50.0, description="Search radius in kilometers"),
    hours: int = Query(24, description="Hours back to search"),
    limit: int = Query(20, description="Maximum number of sightings to return")
):
    """Get sightings near a specific location within time window"""
    try:
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Invalid coordinates")
        
        # Calculate time threshold
        time_threshold = datetime.utcnow() - timedelta(hours=hours)
        
        # Get nearby sightings (simplified - in production use spatial database)
        rows = await get_all_sightings(limit * 3, 0)  # Get more to filter
        nearby_sightings = []
        
        for row in rows:
            # Calculate distance using Haversine formula
            sighting_lat, sighting_lon = row[3], row[4]
            distance = calculate_distance(lat, lon, sighting_lat, sighting_lon)
            
            if distance <= radius_km:
                # Calculate bearing from user to sighting
                bearing_to_sighting = calculate_bearing(lat, lon, sighting_lat, sighting_lon)
                
                nearby_sightings.append({
                    "id": row[0],
                    "filename": row[1],
                    "url": f"https://ufobeep.com/static/uploads/{row[1]}",
                    "lat": sighting_lat,
                    "lon": sighting_lon,
                    "bearing": row[5],  # Original sighting bearing
                    "bearing_to_sighting": bearing_to_sighting,  # Bearing from user to sighting
                    "distance_km": round(distance, 2),
                    "timestamp": row[6],
                    "device_id": row[7],
                    "media_type": row[8] if len(row) > 8 else "photo"
                })
        
        # Sort by distance and limit results
        nearby_sightings.sort(key=lambda x: x["distance_km"])
        return JSONResponse(content=nearby_sightings[:limit])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch nearby sightings: {str(e)}")

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def calculate_bearing(lat1, lon1, lat2, lon2):
    """Calculate bearing from point 1 to point 2"""
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lon = math.radians(lon2 - lon1)
    
    y = math.sin(delta_lon) * math.cos(lat2_rad)
    x = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(delta_lon)
    
    bearing = math.atan2(y, x)
    bearing = math.degrees(bearing)
    bearing = (bearing + 360) % 360  # Normalize to 0-360
    
    return round(bearing, 1)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
