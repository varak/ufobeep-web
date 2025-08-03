// English Language Pack - UFOBeep App
// Native language - uses original phrases as-is

const LANG_EN = {
    name: 'English',
    code: 'en',
    nativeName: 'English',
    flag: '🇺🇸',
    
    // For English, we use the original phrases from phrases.js
    // This serves as the fallback language
    strings: {
        // App info
        'app.title': 'UFOBeep',
        'app.version': 'Version 2.01',
        'app.tagline': 'Real-time UFO sighting alerts',
        
        // Screen titles
        'screen.camera': '📷 Report Sighting',
        'screen.map': '🗺️ Live Sightings',
        'screen.alerts': '🚨 Proximity Alerts',
        'screen.radar': '📡 UFO Radar',
        'screen.profile': '👤 Profile',
        
        // Settings
        'settings.title': '⚙️ Settings',
        'settings.country': 'Country Flag',
        'settings.range': 'Alert Range',
        'settings.notifications': 'Notifications',
        'settings.sounds': 'Sound Alerts',
        'settings.autoUpload': 'Auto-Upload Photos',
        'settings.language': 'Language',
        'settings.about': 'About',
        'settings.save': 'Save Settings',
        'settings.close': 'Close',
        
        // Buttons
        'button.capture': '📸 CAPTURE',
        'button.scan': 'SCAN',
        'button.scanning': 'SCANNING...',
        'button.save': 'Save',
        'button.cancel': 'Cancel',
        'button.close': 'Close',
        
        // Status messages
        'status.location': '📍 Getting location...',
        'status.compass': '🧭 Calibrating compass...',
        'status.connecting': '🌐 Connecting...',
        'status.connected': '🌐 Connected',
        'status.disconnected': '🔌 Disconnected',
        
        // Success messages
        'alert.success': '🛸 Sighting reported successfully!',
        'alert.saved': 'Settings saved successfully!',
        
        // Error messages
        'alert.error': 'Failed to upload sighting',
        'alert.camera': 'Camera not available',
        'alert.location': 'Please wait for GPS location',
        'alert.connection': 'Connection failed',
        
        // Proximity alerts
        'alert.proximity': '🛸 UFO Sighting Alert',
        'alert.proximity.body': 'New sighting reported nearby. Tap to view details.',
        'alert.proximity.distance': 'Distance: {distance} km away',
        
        // No content states
        'no.alerts': 'No recent alerts',
        'no.alerts.desc': 'You\'ll be notified of sightings within {range}km',
        'no.sightings': 'No sightings found',
        'no.connection': 'No connection available',
        
        // Map content
        'map.sightings': '{count} sightings',
        'map.loading': 'Loading map...',
        'map.user.location': 'Your Location',
        'map.sighting.title': '{flag} UFO Sighting',
        'map.sighting.time': 'Time: {time}',
        'map.sighting.reporter': 'Reporter: {reporter}',
        'map.sighting.distance': 'Distance: {distance} km',
        
        // Language options
        'lang.auto': 'Auto-detect',
        'lang.en': 'English',
        'lang.es': 'Español',
        'lang.fr': 'Français',
        'lang.de': 'Deutsch',
        'lang.it': 'Italiano',
        'lang.pt': 'Português',
        'lang.ru': 'Русский',
        'lang.ja': '日本語',
        'lang.ko': '한국어',
        'lang.zh': '中文',
        
        // Countries
        'country.us': '🇺🇸 United States',
        'country.ca': '🇨🇦 Canada',
        'country.mx': '🇲🇽 Mexico',
        'country.br': '🇧🇷 Brazil',
        'country.other': '🌍 Other'
    }
};

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LANG_EN;
}