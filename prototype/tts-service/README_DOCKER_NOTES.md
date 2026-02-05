Notes for TTS service Docker image:

- Uses `python main.py` to start Flask app.
- If you plan to use this in production, consider using a production WSGI server (gunicorn) and ensuring asyncio compatibility for `edge_tts`.
- Exposes port 5001.
