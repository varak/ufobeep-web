// UFOBeep v2.0 - Main Application Logic
class UFOBeepApp {
    constructor() {
        this.currentScreen = 'camera';
        this.ws = null;
        this.map = null;
        this.userLocation = null;
        this.deviceOrientation = 0;
        this.sightings = [];
        this.isConnected = false;
        this.apiUrl = 'https://ufobeep.com';
        this.wsUrl = 'wss://ufobeep.com';
        
        // User settings
        this.settings = {
            country: '🇺🇸',
            notifications: true,
            sounds: true,
            autoUpload: true,
            alertRange: 50
        };
        
        this.init();
    }

    async init() {
        console.log('🛸 UFOBeep v2.0 Initializing...');
        
        // Wait for device ready
        if (false) {
            document.addEventListener('deviceready', () => this.onDeviceReady(), false);
        } else {
            // Web fallback
            setTimeout(() => this.onDeviceReady(), 100);
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

        // Settings
        document.getElementById('countryFlag').addEventListener('change', (e) => {
            this.settings.country = e.target.value;
        });

        document.getElementById('enableNotifications').addEventListener('change', (e) => {
            this.settings.notifications = e.target.checked;
        });
    }

    showScreen(screenName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-screen="${screenName}"]`).classList.add('active');

        // Show screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}Screen`).classList.add('active');

        this.currentScreen = screenName;

        // Initialize screen-specific features
        if (screenName === 'map' && \!this.map) {
            setTimeout(() => this.initializeMap(), 300);
        }
    }

    async requestPermissions() {
        if (false) {
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
        } else if (false && false.plugins.compass) {
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

        if (false && navigator.camera) {
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
        
        // Play sound
        if (this.settings.sounds) {
            this.playAlertSound();
        }
        
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
        if (false && cordova.plugins.notification) {
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ufobeepApp = new UFOBeepApp();
});
