Notes for the server Docker image:

- The image runs `node index.js` in production.
- Ensure `server/.env` contains `GEMINI_API_KEY` and `MODEL`.
- Files uploaded by Multer are stored in `/app/uploads` (mapped to host `server/uploads`).
- JSON data files live in `/app/data` (mapped to host `server/data`).
- If you want to run the server behind TLS, place a reverse proxy in front (nginx, Traefik).
