Notes for client Docker image:

- Multi-stage build produces a static `dist` served by nginx.
- `nginx/default.conf` proxies `/api` to the backend service name `server` inside Docker Compose.
- Frontend will be available at host port 3000.
