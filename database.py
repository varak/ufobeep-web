import aiosqlite
import math
from typing import List, Optional

DB_PATH = "sightings.db"

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sightings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT,
                filepath TEXT,
                lat REAL,
                lon REAL,
                bearing REAL,
                timestamp TEXT,
                device_id TEXT,
                user_flag TEXT,
                distance_km REAL,
                sighting_id TEXT
            )
        """)
        await db.commit()

async def save_sighting(filename, filepath, lat, lon, bearing, timestamp, device_id, user_flag=None):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("""
            INSERT INTO sightings (filename, filepath, lat, lon, bearing, timestamp, device_id, user_flag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (filename, filepath, lat, lon, bearing, timestamp, device_id, user_flag))
        await db.commit()
        return cursor.lastrowid

async def get_all_sightings():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM sightings ORDER BY id DESC")
        rows = await cursor.fetchall()
        return rows

async def get_nearby_sightings(lat: float, lon: float, radius_km: float = 50):
    """Get sightings within specified radius of given coordinates"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM sightings")
        all_sightings = await cursor.fetchall()
        
        nearby = []
        for sighting in all_sightings:
            distance = calculate_distance(lat, lon, sighting[3], sighting[4])
            if distance <= radius_km:
                nearby.append((*sighting, distance))
        
        return sorted(nearby, key=lambda x: x[-1])

async def get_recent_sightings(hours: int = 24):
    """Get sightings from the last N hours"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("""
            SELECT * FROM sightings 
            WHERE datetime(timestamp) >= datetime(now, ? ||  hours)
            ORDER BY timestamp DESC
        """, (f-{hours},))
        rows = await cursor.fetchall()
        return rows

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates using Haversine formula"""
    R = 6371
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate bearing from point 1 to point 2"""
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlon_rad = math.radians(lon2 - lon1)
    
    y = math.sin(dlon_rad) * math.cos(lat2_rad)
    x = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(dlon_rad)
    
    bearing_rad = math.atan2(y, x)
    bearing_deg = math.degrees(bearing_rad)
    
    return (bearing_deg + 360) % 360
