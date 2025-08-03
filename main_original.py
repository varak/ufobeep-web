from fastapi import FastAPI, UploadFile, Form, File
from fastapi.staticfiles import StaticFiles
from upload_handler import save_upload_file
from database import init_db, save_sighting

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

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
    device_id: str = Form("unknown")
):
    file_path = await save_upload_file(file)
    await save_sighting(file.filename, file_path, lat, lon, bearing, timestamp, device_id)
    return {"status": "success", "file_url": f"/static/uploads/{file.filename}"}

from fastapi.responses import JSONResponse
from database import get_all_sightings

@app.get("/sightings")
async def list_sightings():
    rows = await get_all_sightings()
    sightings = []
    for row in rows:
        sightings.append({
            "filename": row[1],
	    "url": f"https://ufobeep.com/static/uploads/{row[1]}",
            "lat": row[3],
            "lon": row[4],
            "bearing": row[5],
            "timestamp": row[6],
            "device_id": row[7],
        })
    return JSONResponse(content=sightings)
