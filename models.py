from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Sighting(BaseModel):
    filename: str
    filepath: str
    lat: float
    lon: float
    bearing: float
    timestamp: str
    device_id: str
    user_flag: Optional[str] = None
    distance_km: Optional[float] = None
    sighting_id: Optional[str] = None

class SightingResponse(BaseModel):
    id: int
    filename: str
    url: str
    lat: float
    lon: float
    bearing: float
    timestamp: str
    device_id: str
    user_flag: Optional[str] = None
    distance_km: Optional[float] = None
    sighting_id: Optional[str] = None
    identicon_url: str

class ProximityAlert(BaseModel):
    sighting_id: str
    distance_km: float
    direction: str
    timestamp: str
    user_flag: str
