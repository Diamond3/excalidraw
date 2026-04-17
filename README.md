# Excalidraw — Self-Hosted

A fork of [Excalidraw](https://excalidraw.com) with Firebase replaced by a self-hosted PostgreSQL backend. Real-time collaboration, end-to-end encryption, share links, image uploads, and named **workspaces** you can save/load — all on your own infrastructure.

## What this fork adds

- **PostgreSQL backend** instead of Firebase — no Google account, no external services
- **Workspaces**: save the current canvas to the server under a name and reload it later
- **Quick-save button** in the top-right for one-click saving of the active workspace
- **Single-origin deployment**: nginx reverse-proxies the API and WebSocket, so the whole thing runs on one port with one domain

## Quick start

You need [Docker](https://docs.docker.com/get-docker/) and a PostgreSQL database reachable from the backend container. Any Postgres works — local, RDS, Supabase, Railway, Neon, etc.

**1. Create a `.env` file** next to `docker-compose.yml`:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**2. Start:**

```bash
docker compose up --build
```

**3. Open http://localhost:3000.**

That's it. The backend runs migrations automatically on first boot, so your database doesn't need any pre-setup — just a reachable empty DB.

## Stopping

```bash
docker compose down
```

## Architecture

```
Browser  ──▶  :3000 nginx ──▶ / (static frontend)
                         └──▶ /api, /socket.io  ──▶ backend:3002 ──▶ PostgreSQL
```

Frontend, backend, and proxy all share port `3000`. Only `DATABASE_URL` is configurable — everything else is baked into the image.

## License

MIT — see [LICENSE](./LICENSE). Based on [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw).
