// UFOBeep v2.0 - Main Application Logic
class UFOBeepApp {
    constructor() {
        this.currentScreen = 'camera';
        this.currentScreenIndex = 0;
        this.mainScreens = ['camera', 'map', 'alerts']; // Main swipable screens
        this.ws = null;
        this.map = null;
        this.userLocation = null;
        this.deviceOrientation = 0;
        this.sightings = [];
        this.isConnected = false;
        this.apiUrl = 'https://ufobeep.com:8000';
        this.wsUrl = 'wss://ufobeep.com:8000';
        
        // Touch/Swipe handling
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isSwipeGesture = false;
        this.minSwipeDistance = 50;
        
        // User settings
        this.settings = {
            country: '🇺🇸',
            notifications: true,
            sounds: true,
            autoUpload: true,
            alertRange: 50,
            language: 'auto' // auto-detect or specific language code
        };

        // Multilingual support - will be loaded dynamically
        this.languages = {};
        this.availableLanguages = ['en', 'es']; // Add more as we create them
        this.currentLanguage = 'en';
        
        // Load language packs
        this.loadLanguagePacks();
        
        this.loadSettings();
        this.detectLanguage();
        this.init();
    }

    loadLanguagePacks() {
        // Inline language packs for now (later we can load from separate files)
        this.languages.en = {
            name: 'English',
            code: 'en',
            nativeName: 'English',
            flag: '🇺🇸',
            strings: {
                'app.title': 'UFOBeep',
                'app.version': 'Version 2.01',
                'screen.camera': '📷 Report Sighting',
                'screen.map': '🗺️ Live Sightings',
                'screen.alerts': '🚨 Proximity Alerts',
                'screen.radar': '📡 UFO Radar',
                'screen.profile': '👤 Profile',
                'settings.title': '⚙️ Settings',
                'settings.country': 'Country Flag',
                'settings.range': 'Alert Range',
                'settings.notifications': 'Notifications',
                'settings.sounds': 'Sound Alerts',
                'settings.autoUpload': 'Auto-Upload Photos',
                'settings.language': 'Language',
                'settings.about': 'About',
                'settings.save': 'Save Settings',
                'button.capture': '📸 CAPTURE',
                'button.scan': 'SCAN',
                'button.scanning': 'SCANNING...',
                'status.location': '📍 Getting location...',
                'status.compass': '🧭 Calibrating compass...',
                'alert.success': '🛸 Sighting reported successfully!',
                'alert.error': 'Failed to upload sighting',
                'alert.proximity': '🛸 UFO Sighting Alert',
                'alert.proximity.body': 'New sighting reported nearby. Tap to view details.',
                'alert.camera': 'Camera not available',
                'alert.location': 'Please wait for GPS location',
                'no.alerts': 'No recent alerts',
                'no.alerts.desc': 'You\'ll be notified of sightings within {range}km'
            }
        };

        this.languages.es = {
            name: 'Español',
            code: 'es',
            nativeName: 'Español',
            flag: '🇪🇸',
            strings: {
                'app.title': 'UFOBeep',
                'app.version': 'Versión 2.01',
                'screen.camera': '📷 Reportar Avistamiento',
                'screen.map': '🗺️ Avistamientos en Vivo',
                'screen.alerts': '🚨 Alertas de Proximidad',
                'screen.radar': '📡 Radar OVNI',
                'screen.profile': '👤 Perfil',
                'settings.title': '⚙️ Configuración',
                'settings.country': 'Bandera del País',
                'settings.range': 'Rango de Alerta',
                'settings.notifications': 'Notificaciones',
                'settings.sounds': 'Alertas de Sonido',
                'settings.autoUpload': 'Subida Automática de Fotos',
                'settings.language': 'Idioma',
                'settings.about': 'Acerca de',
                'settings.save': 'Guardar Configuración',
                'button.capture': '📸 CAPTURAR',
                'button.scan': 'ESCANEAR',
                'button.scanning': 'ESCANEANDO...',
                'status.location': '📍 Obteniendo ubicación...',
                'status.compass': '🧭 Calibrando brújula...',
                'alert.success': '🛸 ¡Avistamiento reportado exitosamente!',
                'alert.error': 'Error al subir avistamiento',
                'alert.proximity': '🛸 Alerta de Avistamiento OVNI',
                'alert.proximity.body': 'Nuevo avistamiento reportado cerca. Toca para ver detalles.',
                'alert.camera': 'Cámara no disponible',
                'alert.location': 'Por favor espera la ubicación GPS',
                'no.alerts': 'Sin alertas recientes',
                'no.alerts.desc': 'Serás notificado de avistamientos dentro de {range}km'
            }
        };
    }

    async init() {
        console.log('🛸 UFOBeep 2.01 Initializing...');
        
        // Wait for device ready
        if (window.cordova) {
            document.addEventListener('deviceready', () => this.onDeviceReady(), false);
        } else {
            // Web fallback
            setTimeout(() => this.onDeviceReady(), 1000);
        }
    }

    onDeviceReady() {
        console.log('📱 Device Ready');
        
        // Initialize components
        this.setupEventListeners();
        this.requestPermissions();
        this.connectWebSocket();
        this.startLocationTracking();
        this.startOrientationTracking();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.remove('active');
            document.getElementById('bottomNav').classList.remove('hidden');
            document.getElementById('screenIndicator').classList.remove('hidden');
            this.updateUILanguage(); // Apply current language to UI
            this.showScreen('camera');
        }, 2000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.target.dataset.screen;
                this.showScreen(screen);
            });
        });

        // Screen indicator dots
        document.querySelectorAll('.indicator-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const screen = e.target.dataset.screen;
                this.showScreen(screen);
            });
        });

        // Swipe gesture handling
        this.setupSwipeGestures();

        // Camera capture
        document.getElementById('captureBtn').addEventListener('click', () => {
            this.capturePhoto();
        });

        // Alert range
        const alertRange = document.getElementById('alertRange');
        alertRange.addEventListener('input', (e) => {
            this.settings.alertRange = e.target.value;
            document.getElementById('rangeValue').textContent = e.target.value;
            document.getElementById('alertRangeText').textContent = e.target.value;
        });

        // Radar scan
        document.getElementById('radarScanBtn').addEventListener('click', () => {
            this.performRadarScan();
        });

        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettingsModal();
        });

        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        // Outdoor compass
        document.getElementById('closeCompassBtn').addEventListener('click', () => {
            this.closeOutdoorCompass();
        });

        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Modal range input
        document.getElementById('modalAlertRange').addEventListener('input', (e) => {
            document.getElementById('modalRangeValue').textContent = e.target.value;
        });

        // Settings (legacy - keep for profile screen)
        const countryFlag = document.getElementById('countryFlag');
        if (countryFlag) {
            countryFlag.addEventListener('change', (e) => {
                this.settings.country = e.target.value;
            });
        }

        const enableNotifications = document.getElementById('enableNotifications');
        if (enableNotifications) {
            enableNotifications.addEventListener('change', (e) => {
                this.settings.notifications = e.target.checked;
            });
        }
    }

    setupSwipeGestures() {
        const app = document.getElementById('app');

        // Touch start
        app.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.isSwipeGesture = false;
        }, { passive: true });

        // Touch move
        app.addEventListener('touchmove', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = Math.abs(currentX - this.touchStartX);
            const diffY = Math.abs(currentY - this.touchStartY);
            
            // Determine if this is a horizontal swipe
            if (diffX > diffY && diffX > this.minSwipeDistance) {
                this.isSwipeGesture = true;
                // Prevent default scrolling for horizontal swipes
                e.preventDefault();
            }
        }, { passive: false });

        // Touch end
        app.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;
            
            this.touchEndX = e.changedTouches[0].clientX;
            this.touchEndY = e.changedTouches[0].clientY;
            
            this.handleSwipeGesture();
            
            // Reset touch values
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchEndX = 0;
            this.touchEndY = 0;
            this.isSwipeGesture = false;
        }, { passive: true });

        // Mouse events for desktop testing
        let isMouseDown = false;
        
        app.addEventListener('mousedown', (e) => {
            this.touchStartX = e.clientX;
            this.touchStartY = e.clientY;
            isMouseDown = true;
        });

        app.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            
            const diffX = Math.abs(e.clientX - this.touchStartX);
            const diffY = Math.abs(e.clientY - this.touchStartY);
            
            if (diffX > diffY && diffX > this.minSwipeDistance) {
                this.isSwipeGesture = true;
            }
        });

        app.addEventListener('mouseup', (e) => {
            if (!isMouseDown) return;
            
            this.touchEndX = e.clientX;
            this.touchEndY = e.clientY;
            
            this.handleSwipeGesture();
            
            isMouseDown = false;
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchEndX = 0;
            this.touchEndY = 0;
            this.isSwipeGesture = false;
        });
    }

    handleSwipeGesture() {
        if (!this.isSwipeGesture) return;
        
        const diffX = this.touchEndX - this.touchStartX;
        const diffY = Math.abs(this.touchEndY - this.touchStartY);
        
        // Only handle horizontal swipes on main screens
        if (Math.abs(diffX) < this.minSwipeDistance || diffY > Math.abs(diffX)) return;
        if (!this.mainScreens.includes(this.currentScreen)) return;
        
        if (diffX > 0) {
            // Swipe right - go to previous screen
            this.navigateToScreen(-1);
        } else {
            // Swipe left - go to next screen
            this.navigateToScreen(1);
        }
    }

    navigateToScreen(direction) {
        const currentIndex = this.mainScreens.indexOf(this.currentScreen);
        if (currentIndex === -1) return;
        
        let newIndex = currentIndex + direction;
        
        // Wrap around
        if (newIndex < 0) {
            newIndex = this.mainScreens.length - 1;
        } else if (newIndex >= this.mainScreens.length) {
            newIndex = 0;
        }
        
        const newScreen = this.mainScreens[newIndex];
        this.showScreen(newScreen, direction);
    }

    showScreen(screenName, direction = 0) {
        const currentScreenElement = document.getElementById(`${this.currentScreen}Screen`);
        const newScreenElement = document.getElementById(`${screenName}Screen`);
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const navBtn = document.querySelector(`.nav-btn[data-screen="${screenName}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }

        // Update screen indicators
        document.querySelectorAll('.indicator-dot').forEach(dot => {
            dot.classList.remove('active');
        });
        const indicatorDot = document.querySelector(`.indicator-dot[data-screen="${screenName}"]`);
        if (indicatorDot) {
            indicatorDot.classList.add('active');
        }

        // Handle animated transitions for swipe navigation
        if (direction !== 0 && currentScreenElement && newScreenElement) {
            // Set initial position for new screen  
            newScreenElement.classList.remove('active', 'slide-left', 'slide-right');
            newScreenElement.classList.add(direction > 0 ? 'slide-right' : 'slide-left');
            
            // Animate current screen out
            currentScreenElement.classList.add(direction > 0 ? 'slide-left' : 'slide-right');
            
            // Animate new screen in
            setTimeout(() => {
                newScreenElement.classList.remove('slide-left', 'slide-right');
                newScreenElement.classList.add('active');
                
                // Clean up old screen
                document.querySelectorAll('.screen').forEach(screen => {
                    if (screen !== newScreenElement) {
                        screen.classList.remove('active', 'slide-left', 'slide-right');
                    }
                });
            }, 50);
        } else {
            // Instant transition for navigation clicks
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active', 'slide-left', 'slide-right');
            });
            newScreenElement.classList.add('active');
        }

        this.currentScreen = screenName;
        this.currentScreenIndex = this.mainScreens.indexOf(screenName);

        // Initialize screen-specific features
        if (screenName === 'map' && \!this.map) {
            setTimeout(() => this.initializeMap(), 300);
        }
    }

    async requestPermissions() {
        if (window.cordova) {
            // Request camera permission
            const permissions = cordova.plugins.permissions;
            if (permissions) {
                permissions.requestPermission(permissions.CAMERA, 
                    success => console.log('📷 Camera permission granted'),
                    error => console.log('❌ Camera permission denied')
                );
                
                permissions.requestPermission(permissions.ACCESS_FINE_LOCATION,
                    success => console.log('📍 Location permission granted'),
                    error => console.log('❌ Location permission denied')
                );
            }
        } else {
            // Web permissions
            try {
                await navigator.mediaDevices.getUserMedia({video: true});
                console.log('📷 Camera access granted');
            } catch (error) {
                console.log('❌ Camera access denied', error);
            }
        }
    }

    connectWebSocket() {
        const userId = 'mobile-' + Math.random().toString(36).substr(2, 9);
        this.ws = new WebSocket(`${this.wsUrl}/ws/${userId}`);

        this.ws.onopen = () => {
            console.log('🌐 WebSocket Connected');
            this.isConnected = true;
            this.updateConnectionStatus(true);
            
            // Send location update if available
            if (this.userLocation) {
                this.sendLocationUpdate();
            }
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('📨 WebSocket Message:', message);
            
            if (message.type === 'proximity_alert') {
                this.handleProximityAlert(message.data);
            }
        };

        this.ws.onclose = () => {
            console.log('🔌 WebSocket Disconnected');
            this.isConnected = false;
            this.updateConnectionStatus(false);
            
            // Reconnect after 3 seconds
            setTimeout(() => this.connectWebSocket(), 3000);
        };

        this.ws.onerror = (error) => {
            console.error('❌ WebSocket Error:', error);
        };
    }

    updateConnectionStatus(connected) {
        const status = document.getElementById('connectionStatus');
        if (connected) {
            status.classList.add('connected');
            status.title = 'Connected to UFOBeep Network';
        } else {
            status.classList.remove('connected');
            status.title = 'Disconnected - Attempting to reconnect';
        }
    }

    startLocationTracking() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    
                    console.log('📍 Location Updated:', this.userLocation);
                    this.updateLocationDisplay();
                    this.sendLocationUpdate();
                },
                (error) => {
                    console.error('❌ Location Error:', error);
                    document.getElementById('locationInfo').textContent = '📍 Location unavailable';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );

            // Watch position changes
            navigator.geolocation.watchPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    this.updateLocationDisplay();
                },
                null,
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 30000
                }
            );
        }
    }

    startOrientationTracking() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                // Get compass heading (0-360 degrees)
                let heading = event.webkitCompassHeading || event.alpha || 0;
                if (event.webkitCompassHeading === undefined) {
                    heading = 360 - heading; // Android fix
                }
                
                this.deviceOrientation = Math.round(heading);
                this.updateCompassDisplay();
            });
        } else if (window.cordova && window.cordova.plugins.compass) {
            // Cordova compass plugin fallback
            const compass = navigator.compass;
            compass.watchHeading(
                (heading) => {
                    this.deviceOrientation = Math.round(heading.magneticHeading);
                    this.updateCompassDisplay();
                },
                (error) => console.error('🧭 Compass Error:', error),
                { frequency: 100 }
            );
        }
    }

    updateLocationDisplay() {
        if (this.userLocation) {
            const locationInfo = document.getElementById('locationInfo');
            locationInfo.textContent = `📍 ${this.userLocation.lat.toFixed(4)}, ${this.userLocation.lng.toFixed(4)}`;
        }
    }

    updateCompassDisplay() {
        const needle = document.getElementById('compassNeedle');
        const bearing = document.getElementById('compassBearing');
        
        if (needle && bearing) {
            needle.style.transform = `rotate(${this.deviceOrientation}deg)`;
            bearing.textContent = `${this.deviceOrientation}°`;
            
            document.getElementById('bearingInfo').textContent = `🧭 ${this.deviceOrientation}°`;
        }
    }

    sendLocationUpdate() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN && this.userLocation) {
            this.ws.send(JSON.stringify({
                type: 'location_update',
                lat: this.userLocation.lat,
                lon: this.userLocation.lng
            }));
        }
    }

    async capturePhoto() {
        if (\!this.userLocation) {
            alert('Please wait for GPS location');
            return;
        }

        console.log('📸 Capturing Photo...');

        if (window.cordova && navigator.camera) {
            // Cordova camera
            navigator.camera.getPicture(
                (imageData) => this.onPhotoSuccess(imageData),
                (error) => this.onPhotoError(error),
                {
                    quality: 80,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 1024,
                    targetHeight: 768
                }
            );
        } else {
            // Web camera fallback
            try {
                const stream = await navigator.mediaDevices.getUserMedia({video: true});
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                
                setTimeout(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 640;
                    canvas.height = 480;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        this.uploadSighting(blob);
                    }, 'image/jpeg', 0.8);
                    
                    stream.getTracks().forEach(track => track.stop());
                }, 2000);
                
            } catch (error) {
                console.error('❌ Camera Error:', error);
                alert('Camera not available');
            }
        }
    }

    onPhotoSuccess(imageUri) {
        console.log('✅ Photo Captured:', imageUri);
        // Convert to blob and upload
        this.convertUriToBlob(imageUri).then(blob => {
            this.uploadSighting(blob);
        });
    }

    onPhotoError(error) {
        console.error('❌ Photo Error:', error);
        alert('Failed to capture photo');
    }

    async uploadSighting(photoBlob) {
        if (\!this.userLocation) return;

        const formData = new FormData();
        formData.append('file', photoBlob, 'sighting.jpg');
        formData.append('lat', this.userLocation.lat);
        formData.append('lon', this.userLocation.lng);
        formData.append('bearing', this.deviceOrientation);
        formData.append('timestamp', new Date().toISOString());
        formData.append('device_id', this.getDeviceId());
        formData.append('user_flag', this.settings.country);

        try {
            const response = await fetch(`${this.apiUrl}/upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Upload Success:', result);
                
                // Show success message
                alert('🛸 Sighting reported successfully\!');
                
                // Vibrate if available
                if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200]);
                }
                
                // Play sound
                this.playAlertSound();
                
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('❌ Upload Error:', error);
            alert('Failed to upload sighting');
        }
    }

    async initializeMap() {
        const mapElement = document.getElementById('liveMap');
        
        this.map = L.map(mapElement).setView([39.8283, -98.5795], 4);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);

        // Load sightings
        await this.loadSightings();
        
        // Add user location if available
        if (this.userLocation) {
            const userIcon = L.divIcon({
                html: `<div style="background: #ff6600; border-radius: 50%; width: 15px; height: 15px; border: 3px solid #fff; box-shadow: 0 0 15px #ff6600;"></div>`,
                className: 'user-marker',
                iconSize: [15, 15],
                iconAnchor: [7.5, 7.5]
            });
            
            L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
                .addTo(this.map)
                .bindPopup('<div style="color: #ff6600;"><strong>Your Location</strong></div>');
        }
    }

    async loadSightings() {
        try {
            const response = await fetch(`${this.apiUrl}/sightings?limit=50`);
            const sightings = await response.json();
            
            this.sightings = sightings;
            document.getElementById('mapSightingCount').textContent = sightings.length;
            
            sightings.forEach(sighting => this.addSightingToMap(sighting));
            
        } catch (error) {
            console.error('❌ Failed to load sightings:', error);
        }
    }

    addSightingToMap(sighting) {
        if (\!this.map) return;

        const icon = L.divIcon({
            html: `<div style="background: #00ffcc; border-radius: 50%; width: 20px; height: 20px; border: 2px solid #fff; box-shadow: 0 0 10px #00ffcc; display: flex; align-items: center; justify-content: center; font-size: 10px;">${sighting.user_flag || '🛸'}</div>`,
            className: 'sighting-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const marker = L.marker([sighting.lat, sighting.lon], { icon }).addTo(this.map);
        
        const popupContent = `
            <div style="color: #fff; min-width: 200px;">
                <h3 style="color: #00ffcc; margin-bottom: 10px;">${sighting.user_flag || '🌍'} UFO Sighting</h3>
                <p><strong>Location:</strong> ${sighting.lat.toFixed(4)}, ${sighting.lon.toFixed(4)}</p>
                <p><strong>Time:</strong> ${new Date(sighting.timestamp).toLocaleString()}</p>
                <p><strong>Reporter:</strong> ${sighting.device_id}</p>
                ${sighting.distance_km ? `<p><strong>Distance:</strong> ${sighting.distance_km.toFixed(1)} km</p>` : ''}
            </div>
        `;

        marker.bindPopup(popupContent);
    }

    handleProximityAlert(sightingData) {
        console.log('🚨 Proximity Alert:', sightingData);
        
        // Add to alert feed
        this.addAlertToFeed(sightingData);
        
        // Show notification
        if (this.settings.notifications) {
            this.showNotification(sightingData);
        }
        
        // Show outdoor compass for directional guidance
        setTimeout(() => {
            this.showOutdoorCompass(sightingData);
        }, 1000);
        
        // Vibrate
        if (navigator.vibrate) {
            navigator.vibrate([500, 200, 500]);
        }
        
        // Add to map if visible
        if (this.currentScreen === 'map' && this.map) {
            this.addSightingToMap(sightingData);
        }
    }

    addAlertToFeed(sighting) {
        const feed = document.getElementById('alertFeed');
        
        // Remove no-alerts message
        const noAlerts = feed.querySelector('.no-alerts');
        if (noAlerts) {
            noAlerts.style.display = 'none';
        }
        
        const distance = this.userLocation ? 
            this.calculateDistance(this.userLocation.lat, this.userLocation.lng, sighting.lat, sighting.lon) : 
            null;

        const alertElement = document.createElement('div');
        alertElement.className = 'alert-item';
        alertElement.innerHTML = `
            <div class="alert-header">
                <div class="alert-title">${sighting.user_flag || '🌍'} UFO Sighting Alert</div>
                <div class="alert-time">${new Date().toLocaleTimeString()}</div>
            </div>
            <div class="alert-details">
                <p><strong>Location:</strong> ${sighting.lat.toFixed(4)}, ${sighting.lon.toFixed(4)}</p>
                ${distance ? `<p><strong>Distance:</strong> <span class="alert-distance">${distance.toFixed(1)} km away</span></p>` : ''}
                <p><strong>Time:</strong> ${new Date(sighting.timestamp).toLocaleString()}</p>
            </div>
        `;

        feed.insertBefore(alertElement, feed.firstChild);
        
        // Keep only last 10 alerts
        const alerts = feed.querySelectorAll('.alert-item');
        if (alerts.length > 10) {
            alerts[alerts.length - 1].remove();
        }
    }

    performRadarScan() {
        console.log('📡 Performing Radar Scan...');
        
        const radarBlips = document.getElementById('radarBlips');
        radarBlips.innerHTML = '';
        
        // Show loading
        document.getElementById('radarScanBtn').textContent = 'SCANNING...';
        
        setTimeout(() => {
            // Add blips for nearby sightings
            this.sightings.forEach((sighting, index) => {
                if (\!this.userLocation) return;
                
                const distance = this.calculateDistance(
                    this.userLocation.lat, this.userLocation.lng,
                    sighting.lat, sighting.lon
                );
                
                if (distance <= this.settings.alertRange) {
                    this.addRadarBlip(sighting, distance);
                }
            });
            
            document.getElementById('radarScanBtn').textContent = 'SCAN';
        }, 2000);
    }

    addRadarBlip(sighting, distance) {
        const radarBlips = document.getElementById('radarBlips');
        const maxDistance = this.settings.alertRange;
        const radarRadius = 150; // pixels
        
        // Calculate position on radar
        const angle = Math.random() * 360; // Simplified - would use actual bearing
        const radarDistance = (distance / maxDistance) * radarRadius;
        
        const x = Math.cos(angle * Math.PI / 180) * radarDistance;
        const y = Math.sin(angle * Math.PI / 180) * radarDistance;
        
        const blip = document.createElement('div');
        blip.style.position = 'absolute';
        blip.style.left = `${150 + x}px`;
        blip.style.top = `${150 + y}px`;
        blip.style.width = '6px';
        blip.style.height = '6px';
        blip.style.borderRadius = '50%';
        blip.style.backgroundColor = distance < 10 ? '#ff6600' : '#00ff00';
        blip.style.boxShadow = `0 0 10px ${distance < 10 ? '#ff6600' : '#00ff00'}`;
        blip.style.transform = 'translate(-50%, -50%)';
        blip.title = `${sighting.user_flag || '🛸'} ${distance.toFixed(1)}km`;
        
        radarBlips.appendChild(blip);
    }

    showNotification(sighting) {
        if (window.cordova && cordova.plugins.notification) {
            cordova.plugins.notification.local.schedule({
                id: Date.now(),
                title: '🛸 UFO Sighting Alert',
                text: `New sighting reported nearby. Tap to view details.`,
                icon: 'res://icon',
                smallIcon: 'res://icon',
                vibrate: true,
                wakeup: true
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🛸 UFO Sighting Alert', {
                body: 'New sighting reported nearby. Click to view details.',
                icon: '/assets/icon-96.png'
            });
        }
    }

    playAlertSound() {
        if (\!this.settings.sounds) return;
        
        // Create audio context for beep sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('🔇 Audio not available');
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    getDeviceId() {
        if (window.device && device.uuid) {
            return device.uuid;
        }
        
        // Web fallback
        let deviceId = localStorage.getItem('ufobeep_device_id');
        if (\!deviceId) {
            deviceId = 'web-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ufobeep_device_id', deviceId);
        }
        return deviceId;
    }

    async convertUriToBlob(uri) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(xhr.response);
            };
            xhr.onerror = reject;
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });
    }

    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        
        // Sync current settings to modal
        document.getElementById('modalCountryFlag').value = this.settings.country;
        document.getElementById('modalAlertRange').value = this.settings.alertRange;
        document.getElementById('modalRangeValue').textContent = this.settings.alertRange;
        document.getElementById('modalEnableNotifications').checked = this.settings.notifications;
        document.getElementById('modalEnableSounds').checked = this.settings.sounds;
        document.getElementById('modalAutoUpload').checked = this.settings.autoUpload;
        document.getElementById('modalLanguage').value = this.settings.language;
        
        // Update modal text based on current language
        document.querySelector('#settingsModal .modal-header h3').textContent = this.translate('settings.title');
        document.querySelector('label[for="modalCountryFlag"]').textContent = this.translate('settings.country');
        document.querySelector('label[for="modalAlertRange"]').textContent = this.translate('settings.range');
        document.querySelector('label[for="modalEnableNotifications"]').textContent = this.translate('settings.notifications');
        document.querySelector('label[for="modalEnableSounds"]').textContent = this.translate('settings.sounds');
        document.querySelector('label[for="modalAutoUpload"]').textContent = this.translate('settings.autoUpload');
        document.querySelector('label[for="modalLanguage"]').textContent = this.translate('settings.language');
        document.querySelector('.setting-section h4').textContent = this.translate('settings.about');
        document.getElementById('saveSettingsBtn').textContent = this.translate('settings.save');
        document.getElementById('versionInfo').textContent = this.translate('app.version');
        
        modal.classList.add('active');
    }

    closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('active');
    }

    saveSettings() {
        // Get values from modal
        const oldLanguage = this.settings.language;
        this.settings.country = document.getElementById('modalCountryFlag').value;
        this.settings.alertRange = parseInt(document.getElementById('modalAlertRange').value);
        this.settings.notifications = document.getElementById('modalEnableNotifications').checked;
        this.settings.sounds = document.getElementById('modalEnableSounds').checked;
        this.settings.autoUpload = document.getElementById('modalAutoUpload').checked;
        this.settings.language = document.getElementById('modalLanguage').value;
        
        // Update language if changed
        if (oldLanguage !== this.settings.language) {
            this.detectLanguage();
            this.updateUILanguage();
        }
        
        // Update main UI elements
        const alertRange = document.getElementById('alertRange');
        if (alertRange) {
            alertRange.value = this.settings.alertRange;
        }
        
        const rangeValue = document.getElementById('rangeValue');
        if (rangeValue) {
            rangeValue.textContent = this.settings.alertRange;
        }
        
        const alertRangeText = document.getElementById('alertRangeText');
        if (alertRangeText) {
            alertRangeText.textContent = this.settings.alertRange;
        }
        
        // Sync to profile screen if elements exist
        const countryFlag = document.getElementById('countryFlag');
        if (countryFlag) {
            countryFlag.value = this.settings.country;
        }
        
        const enableNotifications = document.getElementById('enableNotifications');
        if (enableNotifications) {
            enableNotifications.checked = this.settings.notifications;
        }
        
        // Save to localStorage
        localStorage.setItem('ufobeep_settings', JSON.stringify(this.settings));
        
        console.log('⚙️ Settings saved:', this.settings);
        this.closeSettingsModal();
        
        // Show confirmation
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('ufobeep_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
                console.log('⚙️ Settings loaded:', this.settings);
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
    }

    detectLanguage() {
        if (this.settings.language === 'auto') {
            // Detect browser language
            const browserLang = navigator.language || navigator.userLanguage;
            const langCode = browserLang.split('-')[0].toLowerCase();
            
            // Use detected language if we support it, otherwise default to English
            if (this.languages[langCode]) {
                this.currentLanguage = langCode;
            } else {
                this.currentLanguage = 'en';
            }
        } else if (this.languages[this.settings.language]) {
            this.currentLanguage = this.settings.language;
        } else {
            this.currentLanguage = 'en';
        }
        
        console.log('🌐 Language detected:', this.currentLanguage);
    }

    translate(key, replacements = {}) {
        const strings = this.languages[this.currentLanguage]?.strings || this.languages.en.strings;
        let text = strings[key] || key;
        
        // Replace placeholders like {range}
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        
        return text;
    }

    updateLanguage(langCode) {
        if (this.languages[langCode]) {
            this.currentLanguage = langCode;
            this.settings.language = langCode;
            this.updateUILanguage();
            this.saveSettings();
        }
    }

    updateUILanguage() {
        // Update screen headers
        const screenHeaders = {
            'cameraScreen': 'screen.camera',
            'mapScreen': 'screen.map', 
            'alertsScreen': 'screen.alerts',
            'radarScreen': 'screen.radar',
            'profileScreen': 'screen.profile'
        };

        Object.keys(screenHeaders).forEach(screenId => {
            const header = document.querySelector(`#${screenId} .screen-header h2`);
            if (header) {
                header.textContent = this.translate(screenHeaders[screenId]);
            }
        });

        // Update buttons
        const captureBtn = document.getElementById('captureBtn');
        if (captureBtn && !captureBtn.textContent.includes('SCANNING')) {
            captureBtn.textContent = this.translate('button.capture');
        }

        const radarBtn = document.getElementById('radarScanBtn');
        if (radarBtn && !radarBtn.textContent.includes('SCANNING')) {
            radarBtn.textContent = this.translate('button.scan');
        }

        // Update status messages
        const locationInfo = document.getElementById('locationInfo');
        if (locationInfo && locationInfo.textContent.includes('Getting location')) {
            locationInfo.textContent = this.translate('status.location');
        }

        const bearingInfo = document.getElementById('bearingInfo');
        if (bearingInfo && bearingInfo.textContent.includes('Calibrating')) {
            bearingInfo.textContent = this.translate('status.compass');
        }

        // Update no alerts message
        const noAlerts = document.querySelector('.no-alerts p');
        if (noAlerts) {
            noAlerts.textContent = this.translate('no.alerts');
        }

        const noAlertsDesc = document.querySelector('.no-alerts small');
        if (noAlertsDesc) {
            noAlertsDesc.textContent = this.translate('no.alerts.desc', {range: this.settings.alertRange});
        }
    }

    // Outdoor compass methods
    initializeOutdoorCompass() {
        const markingsContainer = document.getElementById('compassMarkings');
        markingsContainer.innerHTML = '';

        // Create 360 degree markings
        for (let i = 0; i < 360; i++) {
            const mark = document.createElement('div');
            const isMajor = i % 30 === 0; // Major marks every 30 degrees
            const isMinor = i % 10 === 0 && !isMajor; // Minor marks every 10 degrees

            if (isMajor || isMinor) {
                mark.className = `compass-mark ${isMajor ? 'major' : 'minor'}`;
                mark.style.transform = `rotate(${i}deg)`;
                markingsContainer.appendChild(mark);
            }

            // Add compass labels for cardinal and intercardinal directions
            if (isMajor) {
                const label = document.createElement('div');
                label.className = 'compass-label';
                
                const directions = {
                    0: 'N', 30: 'NNE', 60: 'NE', 90: 'E',
                    120: 'ESE', 150: 'SE', 180: 'S', 210: 'SSW',
                    240: 'SW', 270: 'W', 300: 'NW', 330: 'NNW'
                };

                if (directions[i]) {
                    if ([0, 90, 180, 270].includes(i)) {
                        label.classList.add('cardinal');
                    }
                    label.textContent = directions[i];
                    
                    // Position labels around the compass
                    const radius = 120;
                    const angle = (i - 90) * Math.PI / 180; // Offset by 90 to start at top
                    const x = 150 + Math.cos(angle) * radius;
                    const y = 150 + Math.sin(angle) * radius;
                    
                    label.style.left = x + 'px';
                    label.style.top = y + 'px';
                    
                    markingsContainer.appendChild(label);
                }
            }
        }
    }

    showOutdoorCompass(sightingData) {
        const compass = document.getElementById('outdoorCompass');
        const arrow = document.getElementById('sightingArrow');
        const info = document.getElementById('sightingInfo');

        // Initialize compass if not done
        if (!compass.querySelector('.compass-label')) {
            this.initializeOutdoorCompass();
        }

        // Calculate sighting direction from user location
        if (this.userLocation && sightingData) {
            const bearing = this.calculateBearing(
                this.userLocation.lat, this.userLocation.lng,
                sightingData.lat, sightingData.lon
            );

            const distance = this.calculateDistance(
                this.userLocation.lat, this.userLocation.lng,
                sightingData.lat, sightingData.lon
            );

            // Update sighting info
            document.getElementById('sightingDistance').textContent = 
                `UFO ${Math.round(distance)} km away`;
            
            const directionName = this.getDirectionName(bearing);
            document.getElementById('sightingDirectionText').textContent = 
                `Look ${directionName} (${Math.round(bearing).toString().padStart(3, '0')}°)`;

            // Position and show the sighting arrow
            arrow.style.transform = `translate(-50%, -100%) rotate(${bearing}deg)`;
            arrow.classList.add('active');
            info.classList.add('active');

            // Play voice alert
            this.playDirectionalAlert(distance, directionName, bearing);
        }

        compass.classList.add('active');
        
        // Start compass updates
        this.startOutdoorCompassUpdates();
    }

    closeOutdoorCompass() {
        const compass = document.getElementById('outdoorCompass');
        compass.classList.remove('active');
        this.stopOutdoorCompassUpdates();
    }

    startOutdoorCompassUpdates() {
        if (this.compassUpdateInterval) return;

        this.compassUpdateInterval = setInterval(() => {
            const bearingValue = document.getElementById('outdoorBearingValue');
            const bearingDirection = document.getElementById('outdoorBearingDirection');

            if (bearingValue && bearingDirection) {
                bearingValue.textContent = this.deviceOrientation.toString().padStart(3, '0') + '°';
                bearingDirection.textContent = this.getDirectionName(this.deviceOrientation);
            }
        }, 100);
    }

    stopOutdoorCompassUpdates() {
        if (this.compassUpdateInterval) {
            clearInterval(this.compassUpdateInterval);
            this.compassUpdateInterval = null;
        }
    }

    getDirectionName(bearing) {
        const directions = [
            'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
            'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
        ];
        const index = Math.round(bearing / 22.5) % 16;
        return directions[index];
    }

    // Enhanced sound system with modular audio
    async playDirectionalAlert(distance, direction, bearing) {
        if (!this.settings.sounds) return;

        // Try modular sound pack first
        if (await this.playModularAlert(distance, direction, bearing)) {
            return;
        }

        // Fallback to TTS
        const message = this.currentLanguage === 'es' 
            ? `OVNI avistado a ${Math.round(distance)} kilómetros hacia el ${direction}. Sal afuera y mira hacia arriba ahora.`
            : `UFO spotted ${Math.round(distance)} kilometers ${direction} of you at bearing ${Math.round(bearing)} degrees. Go outside and look up now!`;

        if (this.playVoiceAlert('custom', message)) {
            return;
        }

        // Final fallback to enhanced tone
        this.playAlertSound('alert');
    }

    async playModularAlert(distance, direction, bearing) {
        // This would play the modular sound pack
        // For now, return false to use fallback
        return false;
    }

    playVoiceAlert(type = 'alert', customMessage = null) {
        if (!window.speechSynthesis) return false;
        
        let message = customMessage;
        
        if (!message) {
            // Voice alert messages by language
            const voiceAlerts = {
                en: {
                    'alert': 'UFO sighting alert. New sighting reported nearby.',
                    'success': 'Sighting reported successfully.',
                    'error': 'Upload failed.'
                },
                es: {
                    'alert': 'Alerta de avistamiento OVNI. Nuevo avistamiento reportado cerca.',
                    'success': 'Avistamiento reportado exitosamente.',
                    'error': 'Error en la subida.'
                }
            };
            
            const messages = voiceAlerts[this.currentLanguage] || voiceAlerts.en;
            message = messages[type];
        }
        
        if (!message) return false;
        
        try {
            const utterance = new SpeechSynthesisUtterance(message);
            
            // Try to find appropriate voice for language
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.lang.startsWith(this.currentLanguage) && voice.localService
            ) || voices.find(voice => 
                voice.lang.startsWith(this.currentLanguage)
            );
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
                utterance.lang = preferredVoice.lang;
            } else {
                utterance.lang = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
            }
            
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            speechSynthesis.speak(utterance);
            return true;
        } catch (error) {
            console.log('🔇 Voice synthesis not available:', error);
            return false;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ufobeepApp = new UFOBeepApp();
});
