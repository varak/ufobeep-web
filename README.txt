# UFOBeep v2.01 - Real-time UFO Sighting Alerts

UFOBeep is a comprehensive UFO sighting tracking and alert system with gesture-based navigation, multilingual support, outdoor compass functionality, and professional voice alert capabilities.

## 🌐 Access Points

- **Main Site**: https://ufobeep.com/
- **Mobile App**: https://ufobeep.com/app/
- **Live Map**: https://ufobeep.com/map/
- **API Endpoint**: https://ufobeep.com:8000/

## 🚀 Key Features

### Navigation & Interface
- **Swipe Navigation**: Touch gesture navigation between Camera, Map, and Alerts screens
- **Screen Position Indicators**: Visual dots showing current screen position
- **Settings Modal**: Gear icon access to all preferences and about information
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### Location & Mapping  
- **Interactive Map**: Live sightings with clickable UFO markers around your location
- **Auto-Centering**: Map automatically centers on user's GPS location
- **Demo Sightings**: Fallback sighting data when API unavailable (Las Vegas area)
- **Location Tracking**: Real-time GPS positioning with accuracy indicators

### Outdoor Compass System
- **Precision Compass**: 360-degree bearing display with 16-direction names
- **Sighting Direction Overlay**: Orange arrow pointing toward UFO locations
- **Live Bearing Updates**: Real-time compass rotation as device moves
- **Go Outside Mode**: Full-screen compass for outdoor UFO tracking

### Multilingual Support
- **Auto-Detection**: Automatically detects browser language preference
- **English/Spanish**: Complete UI translation with expandable language system
- **Voice Alerts**: Text-to-speech in multiple languages with fallback systems
- **Modular Sound Packs**: Professional voice generation strategy (ElevenLabs integration)

### Audio & Voice System
- **Dynamic Voice Alerts**: "UFO spotted X kilometers [direction] of you - go outside and look up!"
- **TTS Fallback**: Browser text-to-speech when sound packs unavailable  
- **Tone Beep Alerts**: Audio beep fallback for silent mode compatibility
- **ElevenLabs Integration**: Professional voice generation for multiple languages

### Technical Capabilities
- **Real-time WebSocket**: Live proximity alerts and data synchronization
- **Offline Mode**: Graceful degradation when network unavailable
- **Progressive Web App**: Installable on mobile devices
- **Content Security Policy**: Secure HTTPS deployment with mixed content handling

## 🛠 Technical Architecture

### Backend
- **FastAPI**: Async Python web framework with WebSocket support
- **SQLite Database**: Lightweight database with async operations (aiosqlite)
- **Port 8000**: API and WebSocket endpoint (HTTP due to SSL limitations)
- **File Uploads**: Local storage with static serving

### Frontend  
- **Vanilla JavaScript**: No framework dependencies for maximum compatibility
- **Leaflet Maps**: Interactive mapping with OpenStreetMap tiles
- **CSS Grid/Flexbox**: Responsive layout system
- **Touch Gestures**: Native touch event handling for swipe navigation

### Deployment
- **Nginx**: Web server with SSL/TLS termination
- **Mixed Content Handling**: Fallback systems for HTTPS→HTTP limitations
- **UFW Firewall**: Port 8000 configured for backend access
- **Static Assets**: Efficient caching and delivery

## 📊 URL Structure

- `/` - Main landing page with project overview
- `/app/` - Full-featured mobile web application  
- `/map/` - Standalone interactive sightings map
- `/api/` - REST API endpoints (via port 8000)
- `/static/uploads/` - User-uploaded sighting images and files

## 🔧 Development Guide

### Adding New Languages
1. Create language pack: `ufobeep-v2-app/src/i18n/[lang].js`
2. Add language code to `availableLanguages` array in `app.js`
3. Update language loading in `loadLanguagePacks()` method
4. Test auto-detection and manual selection

### Voice Pack Generation
1. Review `VOICE_GENERATION.md` for ElevenLabs strategy
2. Run voice generation script for new languages
3. Update `availableLanguages` and audio file paths
4. Test modular audio composition system

### Database Schema
- **sightings table**: `id, lat, lon, bearing, timestamp, device_id, user_flag, distance_km, sighting_id`
- **File structure**: Photos stored in `/static/uploads/` with metadata linking

## 🧪 Demo & Testing

- **Las Vegas Demo Data**: 10 test UFO sightings around Nevada area
- **Offline Functionality**: App works without backend connection
- **Location Simulation**: GPS coordinates can be manually set for testing
- **Cross-Platform Testing**: Verified on mobile, tablet, and desktop browsers

---

> *"The truth is out there, and it's version controlled! 🛸👽"*  
> — Claude Code AI
