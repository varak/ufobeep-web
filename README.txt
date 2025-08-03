# UFOBeep Backend Test Data Package

This zip includes a sample dataset of 10 recent sightings in `mock_sightings.json`.

## 📥 To install on the backend server:

1. SCP the file to your server:

```bash
scp /path/to/ufo_backend_sightings_test.zip USER@SERVER:/var/www/ufobeep.com/html/
```

2. SSH into your server:

```bash
ssh USER@SERVER
cd /var/www/ufobeep.com/html/
```

3. Unzip the package:

```bash
unzip ufo_backend_sightings_test.zip
```

4. You’ll now have a file: `mock_sightings.json` with this structure:

```json
[
  {
    "id": "UFB-0001",
    "userFlag": "🇨🇦",
    "distanceKm": 105.8,
    "time": "2025-08-02T01:15:22Z",
    "imageUrl": "https://...",
    "lat": 36.998,
    "lon": -124.011
  },
  ...
]
```

This can be loaded for API testing, map overlays, or mock alert generation.
