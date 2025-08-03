# UFOBeep - Real-time UFO Sighting Alerts

UFOBeep is a real-time UFO sighting alert system with WebSocket-powered notifications, interactive mapping, and mobile app support.

## 🌐 Access Points

- **Main Site**: https://ufobeep.com/
- **Mobile App**: https://ufobeep.com/app/
- **Live Map**: https://ufobeep.com/map/
- **API Endpoint**: https://ufobeep.com:8000/

## 📱 Features

- **Swipe Navigation**: Gesture-based navigation between Camera, Map, and Alerts screens
- **Multilingual Support**: Auto-detects browser language (English, Spanish supported)
- **Real-time Alerts**: WebSocket-powered proximity notifications
- **Interactive Map**: Live sightings with location data
- **Settings Modal**: Easy access to preferences and about info
- **Cross-platform**: Works on web and mobile devices

## 🛠 Deployment

The system runs on:
- **Backend**: FastAPI with WebSocket support (port 8000)
- **Frontend**: Static HTML/CSS/JS with PWA capabilities
- **Database**: SQLite with async operations
- **File Storage**: Local uploads with static serving

## 📊 URL Structure

- `/` - Main landing page
- `/app/` - Mobile web application
- `/map/` - Interactive sightings map
- `/api/` - REST API endpoints (port 8000)
- `/static/uploads/` - User-uploaded sighting images

## 🔧 Development

To add new languages:
1. Create language pack in `ufobeep-v2-app/src/i18n/[lang].js`
2. Add language code to `availableLanguages` array
3. Update language loading in `loadLanguagePacks()` method

## 📦 Mock Data

Test data available in `mock_sightings.json` for API testing and development.

---

> *"The truth is out there, and it's version controlled! 🛸👽"*  
> — Claude Code AI
