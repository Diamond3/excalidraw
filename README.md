# Excalidraw — Self-Hosted

A fork of [Excalidraw](https://excalidraw.com) with Firebase replaced by a small Node/Express backend that stores data in PostgreSQL.

## What this fork changes

- **Firebase removed.** Scenes, share links and uploaded files go to a Postgres database instead.
- **Workspaces.** Save the current canvas on the server under a name and reload it later.
- **Quick-save button** in the top-right — one click to save the active workspace.
- **Single-origin frontend.** nginx serves the static app and reverse-proxies `/api` and `/socket.io` to the backend.

## The two containers

This fork builds two Docker images. They are designed to work independently so you can deploy them however you like:

| Image | Dockerfile | Env vars | Purpose |
|---|---|---|---|
| **backend**  | `backend/Dockerfile` | `DATABASE_URL`, `PORT` | REST API + WebSocket server |
| **frontend** | `Dockerfile` (repo root) | `BACKEND_HOST`, `PORT` | nginx serving the static app + proxying to the backend |

`BACKEND_HOST` is the `host:port` the nginx reverse proxy forwards `/api` and `/socket.io` to (e.g. `backend:3002` inside a compose network, or `backend.railway.internal:3002` on Railway's private network).

You provide your own PostgreSQL — no database is bundled. Any Postgres works (Supabase, Railway, Neon, RDS, local install). The backend auto-creates its tables on first boot.

---

## Option 1 — Local (docker compose)

Easiest for self-hosting on a single machine.

**1.** Create a `.env` file next to `docker-compose.yml`:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**2.** Build and run:

```bash
docker compose up --build
```

**3.** Open <http://localhost:3000>.

Stop with `docker compose down`.

---

## Option 2 — Separate `docker run` containers

If you don't want compose (VPS, manual deploy, or just to test the Railway setup locally), build and run each image by hand. The two containers need to share a Docker network so the frontend can resolve `backend` by name.

```bash
# 1. Create a network
docker network create excalidraw

# 2. Build both images
docker build -t excalidraw-backend ./backend
docker build -t excalidraw-frontend .

# 3. Run the backend (internal only)
docker run -d --name backend \
  --network excalidraw \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  excalidraw-backend

# 4. Run the frontend (publicly exposed on :3000)
docker run -d --name frontend \
  --network excalidraw \
  -e BACKEND_HOST="backend:3002" \
  -p 3000:80 \
  excalidraw-frontend
```

Open <http://localhost:3000>.

The frontend proxies `/api` and `/socket.io` to whatever `BACKEND_HOST` resolves to on the shared network. Stop with `docker rm -f frontend backend`.

---

## Option 3 — Platform-as-a-service (Railway, Render, Fly, etc.)

These platforms deploy one Dockerfile at a time, not a compose stack. Create two services from the same repo:

### Service A — backend

- **Root directory / Dockerfile:** `backend/`
- **Environment variables:**
  - `DATABASE_URL` — your Postgres connection string
  - `PORT` — usually provided automatically by the platform
- **Networking:** enable private networking if your platform supports it; no public domain needed

### Service B — frontend

- **Root directory / Dockerfile:** repo root (`.`)
- **Environment variables:**
  - `BACKEND_HOST` — the `host:port` where the backend is reachable from the frontend container. On Railway this is `<backend-service-name>.railway.internal:<backend-port>`
  - `PORT` — usually provided automatically by the platform
- **Networking:** expose publicly — this is the URL users open

The frontend proxies `/api` and `/socket.io` to `BACKEND_HOST`, so users only ever see one domain.

---

## Architecture

```
Browser ─▶ frontend (nginx) ─┬─▶ static files
                             └─▶ /api, /socket.io ─▶ backend ─▶ PostgreSQL
```

## License

MIT — see [LICENSE](./LICENSE). Based on [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw).
