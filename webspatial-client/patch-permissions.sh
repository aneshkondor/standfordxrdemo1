#!/bin/bash

# Find the generated .app bundle
APP_PATH=$(find ~/.webspatial-builder-temp -name "*.app" -type d | head -1)

if [ -z "$APP_PATH" ]; then
    echo "❌ Could not find generated .app file"
    echo "Build the app first with: npm run build:avp && npm run run:avp"
    exit 1
fi

echo "✓ Found app: $APP_PATH"

PLIST_PATH="$APP_PATH/Info.plist"

if [ ! -f "$PLIST_PATH" ]; then
    echo "❌ Info.plist not found at: $PLIST_PATH"
    exit 1
fi

echo "✓ Found Info.plist"

# Check if permissions already exist
if grep -q "NSMicrophoneUsageDescription" "$PLIST_PATH"; then
    echo "✓ Microphone permission already exists"
    exit 0
fi

echo "Adding microphone permissions..."

# Create a temporary file with the additions
TEMP_FILE=$(mktemp)

# Read the file and insert permissions before the final </dict>
awk '
/<\/dict>$/ && !done {
    print "\t<key>NSMicrophoneUsageDescription</key>"
    print "\t<string>Aila needs microphone access to listen to your voice and provide AI therapy conversation</string>"
    print "\t<key>UIBackgroundModes</key>"
    print "\t<array>"
    print "\t\t<string>audio</string>"
    print "\t</array>"
    done=1
}
{ print }
' "$PLIST_PATH" > "$TEMP_FILE"

# Replace the original file
mv "$TEMP_FILE" "$PLIST_PATH"

echo "✅ Microphone permissions added successfully!"
echo ""
echo "Now run: npm run run:avp"
