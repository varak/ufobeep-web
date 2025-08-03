# UFOBeep Voice Generation System

## Overview
UFOBeep uses modular sound packs for immersive, multilingual alert narration. This document outlines the voice generation strategy using ElevenLabs AI.

## Sound Pack Architecture

### Directory Structure
```
/sounds/
├── en/
│   ├── intro/
│   │   ├── ufo_spotted.mp3
│   │   ├── ufo_sighting_alert.mp3
│   │   └── attention.mp3
│   ├── distances/
│   │   ├── 1.mp3, 2.mp3, ..., 20.mp3
│   │   ├── 30.mp3, 40.mp3, 50.mp3, ..., 200.mp3
│   │   ├── hundred.mp3, thousand.mp3
│   ├── units/
│   │   ├── kilometers.mp3, km.mp3
│   │   ├── miles.mp3, mi.mp3
│   ├── directions/
│   │   ├── north.mp3, northeast.mp3, east.mp3, etc.
│   │   ├── degrees.mp3, bearing.mp3
│   ├── prepositions/
│   │   ├── of_you.mp3, from_your_location.mp3
│   │   ├── at_bearing.mp3
│   └── calls_to_action/
│       ├── go_outside_now.mp3
│       ├── look_up.mp3
│       ├── scan_the_sky.mp3
│       └── check_horizon.mp3
└── es/ (same structure)
    ├── intro/ovni_avistado.mp3
    ├── distances/uno.mp3, dos.mp3, etc.
    └── calls_to_action/sal_afuera.mp3
```

## ElevenLabs Voice Generation Script

### Voice Selection Strategy
- **English**: Authoritative male voice (documentary/news style)
- **Spanish**: Native Spanish speaker, professional tone
- **Future languages**: Regional native speakers

### Sample ElevenLabs API Script

```python
import requests
import json
import os

# ElevenLabs API Configuration
API_KEY = "your_elevenlabs_api_key"
VOICE_ID_EN = "21m00Tcm4TlvDq8ikWAM"  # Rachel (professional female)
VOICE_ID_ES = "EXAVITQu4vr4xnSDxMaL"  # Spanish native speaker

BASE_URL = "https://api.elevenlabs.io/v1"

def generate_voice_clip(text, voice_id, filename, language="en"):
    """Generate a single voice clip using ElevenLabs API"""
    
    url = f"{BASE_URL}/text-to-speech/{voice_id}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": API_KEY
    }
    
    # Voice settings for UFO alerts - slightly dramatic
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.75,      # Consistent delivery
            "similarity_boost": 0.8, # Natural voice
            "style": 0.3,           # Slight dramatic flair
            "use_speaker_boost": True
        }
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"✅ Generated: {filename}")
    else:
        print(f"❌ Failed: {filename} - {response.text}")

# English Sound Pack Generation
def generate_english_pack():
    voice_id = VOICE_ID_EN
    
    # Intro phrases
    intros = {
        "ufo_spotted.mp3": "UFO spotted",
        "ufo_sighting_alert.mp3": "UFO sighting alert",
        "attention.mp3": "Attention"
    }
    
    for filename, text in intros.items():
        generate_voice_clip(text, voice_id, f"sounds/en/intro/{filename}")
    
    # Numbers 1-20
    numbers = ["one", "two", "three", "four", "five", "six", "seven", "eight", 
               "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
               "sixteen", "seventeen", "eighteen", "nineteen", "twenty"]
    
    for i, num_word in enumerate(numbers, 1):
        generate_voice_clip(num_word, voice_id, f"sounds/en/distances/{i}.mp3")
    
    # Tens: 30, 40, 50, etc.
    tens = ["thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
    for i, ten_word in enumerate(tens, 3):
        generate_voice_clip(ten_word, voice_id, f"sounds/en/distances/{i*10}.mp3")
    
    # Hundreds
    generate_voice_clip("one hundred", voice_id, "sounds/en/distances/100.mp3")
    generate_voice_clip("two hundred", voice_id, "sounds/en/distances/200.mp3")
    
    # Units
    units = {
        "kilometers.mp3": "kilometers",
        "km.mp3": "K M",
        "miles.mp3": "miles"
    }
    
    for filename, text in units.items():
        generate_voice_clip(text, voice_id, f"sounds/en/units/{filename}")
    
    # 16-Direction Compass
    directions = {
        "north.mp3": "north",
        "north_northeast.mp3": "north northeast", 
        "northeast.mp3": "northeast",
        "east_northeast.mp3": "east northeast",
        "east.mp3": "east",
        "east_southeast.mp3": "east southeast",
        "southeast.mp3": "southeast",
        "south_southeast.mp3": "south southeast",
        "south.mp3": "south",
        "south_southwest.mp3": "south southwest",
        "southwest.mp3": "southwest",
        "west_southwest.mp3": "west southwest",
        "west.mp3": "west",
        "west_northwest.mp3": "west northwest",
        "northwest.mp3": "northwest",
        "north_northwest.mp3": "north northwest"
    }
    
    for filename, text in directions.items():
        generate_voice_clip(text, voice_id, f"sounds/en/directions/{filename}")
    
    # Prepositions
    prepositions = {
        "of_you.mp3": "of you",
        "from_your_location.mp3": "from your location",
        "at_bearing.mp3": "at bearing",
        "degrees.mp3": "degrees"
    }
    
    for filename, text in prepositions.items():
        generate_voice_clip(text, voice_id, f"sounds/en/prepositions/{filename}")
    
    # Calls to Action (THE MONEY PHRASES!)
    cta = {
        "go_outside_now.mp3": "Go outside and look up now!",
        "look_up.mp3": "Look up!",
        "scan_the_sky.mp3": "Scan the sky",
        "check_horizon.mp3": "Check the horizon",
        "look_to_the.mp3": "Look to the"
    }
    
    for filename, text in cta.items():
        generate_voice_clip(text, voice_id, f"sounds/en/calls_to_action/{filename}")

# Spanish Sound Pack Generation  
def generate_spanish_pack():
    voice_id = VOICE_ID_ES
    
    # Spanish intros
    intros = {
        "ovni_avistado.mp3": "OVNI avistado",
        "alerta_ovni.mp3": "Alerta de OVNI",
        "atencion.mp3": "Atención"
    }
    
    for filename, text in intros.items():
        generate_voice_clip(text, voice_id, f"sounds/es/intro/{filename}")
    
    # Spanish numbers 1-20
    numeros = ["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho",
               "nueve", "diez", "once", "doce", "trece", "catorce", "quince",
               "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"]
    
    for i, num_word in enumerate(numeros, 1):
        generate_voice_clip(num_word, voice_id, f"sounds/es/distances/{i}.mp3")
    
    # Spanish calls to action
    cta_es = {
        "sal_afuera.mp3": "¡Sal afuera y mira hacia arriba ahora!",
        "mira_arriba.mp3": "¡Mira hacia arriba!",
        "escanea_cielo.mp3": "Escanea el cielo",
        "mira_hacia.mp3": "Mira hacia el"
    }
    
    for filename, text in cta_es.items():
        generate_voice_clip(text, voice_id, f"sounds/es/calls_to_action/{filename}")

if __name__ == "__main__":
    print("🛸 Generating UFOBeep Voice Packs...")
    generate_english_pack()
    generate_spanish_pack()
    print("✅ Voice generation complete!")
```

## Dynamic Audio Composition Example

```javascript
// Example: "UFO spotted 25 kilometers north northeast of you at bearing 067 degrees. Go outside and look up now!"
const audioQueue = [
    'sounds/en/intro/ufo_spotted.mp3',
    'sounds/en/distances/20.mp3',      // "twenty"
    'sounds/en/distances/5.mp3',       // "five"  
    'sounds/en/units/kilometers.mp3',  // "kilometers"
    'sounds/en/directions/north_northeast.mp3', // "north northeast"
    'sounds/en/prepositions/of_you.mp3',        // "of you"
    'sounds/en/prepositions/at_bearing.mp3',    // "at bearing"
    'sounds/en/distances/0.mp3',       // "zero"
    'sounds/en/distances/6.mp3',       // "six"
    'sounds/en/distances/7.mp3',       // "seven"
    'sounds/en/prepositions/degrees.mp3',       // "degrees"
    'sounds/en/calls_to_action/go_outside_now.mp3' // "Go outside and look up now!"
];

playAudioQueue(audioQueue);
```

## Cost Estimate (ElevenLabs)
- **English Pack**: ~150 clips × $0.30/1000 chars ≈ $15-25
- **Spanish Pack**: ~150 clips × $0.30/1000 chars ≈ $15-25  
- **Additional Languages**: ~$20 each

## Voice Direction Notes
- **Tone**: Authoritative but not alarming, documentary narrator style
- **Pacing**: Clear, measured delivery with slight urgency
- **Emphasis**: Slight emphasis on direction words and calls to action
- **Background**: Clean recording, no reverb/effects (app will add atmosphere)

## Implementation Priority
1. **English core pack** (intro, distances 1-50, 8 directions, key CTAs)
2. **Spanish core pack** (same structure)
3. **Extended packs** (precise degrees, weather conditions, etc.)
4. **Premium voices** (celebrity/sci-fi actor cameos? 👽)