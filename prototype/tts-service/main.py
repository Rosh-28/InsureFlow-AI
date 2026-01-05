"""
Edge TTS Microservice
Provides Text-to-Speech functionality using Microsoft Edge TTS (completely free)
"""
import asyncio
import edge_tts
import io
import os
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Available voices for Edge TTS
VOICES = {
    "en-US-female": "en-US-JennyNeural",
    "en-US-male": "en-US-GuyNeural",
    "en-IN-female": "en-IN-NeerjaNeural",
    "en-IN-male": "en-IN-PrabhatNeural",
    "hi-IN-female": "hi-IN-SwaraNeural",
    "hi-IN-male": "hi-IN-MadhurNeural"
}

DEFAULT_VOICE = "en-US-male"


async def generate_speech(text: str, voice: str) -> bytes:
    """Generate speech from text using Edge TTS"""
    communicate = edge_tts.Communicate(text, voice)
    audio_data = io.BytesIO()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.write(chunk["data"])
    
    audio_data.seek(0)
    return audio_data.getvalue()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "edge-tts-service"
    })


@app.route('/voices', methods=['GET'])
def list_voices():
    """List available voices"""
    return jsonify({
        "voices": VOICES,
        "default": DEFAULT_VOICE
    })


@app.route('/speak', methods=['POST'])
def speak():
    """Convert text to speech and return audio file"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Missing 'text' field in request body"
            }), 400
        
        text = data['text']
        voice_key = data.get('voice', 'en-IN-female')
        voice = VOICES.get(voice_key, DEFAULT_VOICE)
        
        # Limit text length to prevent abuse
        if len(text) > 5000:
            return jsonify({
                "error": "Text too long. Maximum 5000 characters allowed."
            }), 400
        
        # Generate speech
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_bytes = loop.run_until_complete(generate_speech(text, voice))
        loop.close()
        
        # Return audio as MP3
        return send_file(
            io.BytesIO(audio_bytes),
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name='speech.mp3'
        )
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route('/speak-stream', methods=['POST'])
async def speak_stream():
    """Stream TTS audio (for real-time playback)"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Missing 'text' field"
            }), 400
        
        text = data['text']
        voice_key = data.get('voice', 'en-IN-female')
        voice = VOICES.get(voice_key, DEFAULT_VOICE)
        
        audio_bytes = await generate_speech(text, voice)
        
        return send_file(
            io.BytesIO(audio_bytes),
            mimetype='audio/mpeg',
            as_attachment=False
        )
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🔊 Edge TTS Service running on port {port}")
    print(f"📋 Available voices: {list(VOICES.keys())}")
    app.run(host='0.0.0.0', port=port, debug=False)
