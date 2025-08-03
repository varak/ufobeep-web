// Spanish Language Pack - UFOBeep App
// Español

const LANG_ES = {
    name: 'Español',
    code: 'es',
    nativeName: 'Español',
    flag: '🇪🇸',
    
    strings: {
        // App info
        'app.title': 'UFOBeep',
        'app.version': 'Versión 2.01',
        'app.tagline': 'Alertas de avistamientos OVNI en tiempo real',
        
        // Screen titles
        'screen.camera': '📷 Reportar Avistamiento',
        'screen.map': '🗺️ Avistamientos en Vivo',
        'screen.alerts': '🚨 Alertas de Proximidad',
        'screen.radar': '📡 Radar OVNI',
        'screen.profile': '👤 Perfil',
        
        // Settings
        'settings.title': '⚙️ Configuración',
        'settings.country': 'Bandera del País',
        'settings.range': 'Rango de Alerta',
        'settings.notifications': 'Notificaciones',
        'settings.sounds': 'Alertas de Sonido',
        'settings.autoUpload': 'Subida Automática de Fotos',
        'settings.language': 'Idioma',
        'settings.about': 'Acerca de',
        'settings.save': 'Guardar Configuración',
        'settings.close': 'Cerrar',
        
        // Buttons
        'button.capture': '📸 CAPTURAR',
        'button.scan': 'ESCANEAR',
        'button.scanning': 'ESCANEANDO...',
        'button.save': 'Guardar',
        'button.cancel': 'Cancelar',
        'button.close': 'Cerrar',
        
        // Status messages
        'status.location': '📍 Obteniendo ubicación...',
        'status.compass': '🧭 Calibrando brújula...',
        'status.connecting': '🌐 Conectando...',
        'status.connected': '🌐 Conectado',
        'status.disconnected': '🔌 Desconectado',
        
        // Success messages
        'alert.success': '🛸 ¡Avistamiento reportado exitosamente!',
        'alert.saved': '¡Configuración guardada exitosamente!',
        
        // Error messages
        'alert.error': 'Error al subir avistamiento',
        'alert.camera': 'Cámara no disponible',
        'alert.location': 'Por favor espera la ubicación GPS',
        'alert.connection': 'Error de conexión',
        
        // Proximity alerts
        'alert.proximity': '🛸 Alerta de Avistamiento OVNI',
        'alert.proximity.body': 'Nuevo avistamiento reportado cerca. Toca para ver detalles.',
        'alert.proximity.distance': 'Distancia: {distance} km de distancia',
        
        // No content states
        'no.alerts': 'Sin alertas recientes',
        'no.alerts.desc': 'Serás notificado de avistamientos dentro de {range}km',
        'no.sightings': 'No se encontraron avistamientos',
        'no.connection': 'Sin conexión disponible',
        
        // Map content
        'map.sightings': '{count} avistamientos',
        'map.loading': 'Cargando mapa...',
        'map.user.location': 'Tu Ubicación',
        'map.sighting.title': '{flag} Avistamiento OVNI',
        'map.sighting.time': 'Hora: {time}',
        'map.sighting.reporter': 'Reportero: {reporter}',
        'map.sighting.distance': 'Distancia: {distance} km',
        
        // Language options (keep native names)
        'lang.auto': 'Auto-detectar',
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
        'country.us': '🇺🇸 Estados Unidos',
        'country.ca': '🇨🇦 Canadá',
        'country.mx': '🇲🇽 México',
        'country.br': '🇧🇷 Brasil',
        'country.ar': '🇦🇷 Argentina',
        'country.es': '🇪🇸 España',
        'country.other': '🌍 Otro'
    }
};

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LANG_ES;
}