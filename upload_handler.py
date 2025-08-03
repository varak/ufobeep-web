import os
import re
from fastapi import UploadFile
from datetime import datetime

UPLOAD_DIR = "static/uploads"

def slugify_filename(name):
    # Replace unsafe characters with underscores
    return re.sub(r'[^a-zA-Z0-9_.-]', '_', name)

async def save_upload_file(file: UploadFile):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Create timestamped, safe filename
    clean_name = slugify_filename(file.filename)
    timestamp = datetime.utcnow().isoformat()
    filename = f"{timestamp}_{clean_name}"

    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    return filepath
