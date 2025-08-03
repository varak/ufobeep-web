#\!/bin/bash

echo "🛸 Building UFOBeep v2.0..."

# Create build info
cd ufobeep-v2-app
echo "Build: $(date +%Y.%m.%d)" > build_info.txt
echo "Version: 2.0.0" >> build_info.txt
echo "API: https://ufobeep.com" >> build_info.txt

# Create a simple APK-style package (web-based)
cd www
zip -r ../UFOBeep-v2.0-web.apk . -x "*.map" "*.log"

# Copy to main directory for download
cp ../UFOBeep-v2.0-web.apk ../../ufobeep-v2.0.apk

echo "✅ UFOBeep v2.0 built successfully\!"
echo "📱 Web App: https://ufobeep.com/ufobeep-v2-app/www/"
echo "📦 Package: https://ufobeep.com/ufobeep-v2.0.apk"
echo "🌐 Download Page: https://ufobeep.com/app.html"

ls -lh ../../ufobeep-v2.0.apk
