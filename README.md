# Excalidraw — Self-Hosted

A fork of [Excalidraw](https://excalidraw.com) with Firebase replaced by a self-hosted PostgreSQL backend. No external services, no Firebase account — just Docker.

**What it does:** open-source virtual whiteboard with real-time collaboration, end-to-end encryption, share links, and image support — all running on your own infrastructure.

---

## Running with Docker (recommended)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) v20+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+
- Ports **3000**, **3002**, and **5432** free on your machine

### Start

```bash
git clone https://github.com/Diamond3/excalidraw.git
cd excalidraw
docker-compose up --build
```

Open **http://localhost:3000**.

The first run takes a few minutes to build. Subsequent starts are fast.

### What starts

| Service | URL | Description |
|---|---|---|
| Frontend | http://localhost:3000 | Excalidraw app (nginx) |
| Backend | http://localhost:3002 | REST API + WebSocket server |
| PostgreSQL | localhost:5432 | Database (auto-configured) |

**You don't need to set up the database.** Docker creates it, and the backend automatically runs all migrations on first boot. Your data persists in a Docker volume — stopping and restarting containers won't lose anything.

### Stop

```bash
docker-compose down
```

Wipe everything including the database:

```bash
docker-compose down -v
```

---

## Using an external PostgreSQL

If you have your own PostgreSQL (local install, RDS, Supabase, etc.), skip the built-in postgres service and point the backend at yours.

Edit `docker-compose.yml` — remove the `postgres` service and its healthcheck dependency, then set your connection string:

```yaml
services:
  backend:
    build:
      context: ./self-hosted-backend
    environment:
      DATABASE_URL: postgresql://user:password@your-host:5432/your-db
      PORT: "3002"
    ports:
      - "3002:3002"

  excalidraw:
    build:
      context: .
      args:
        - NODE_ENV=production
        - VITE_APP_API_URL=http://localhost:3002
        - VITE_APP_BACKEND_V2_GET_URL=http://localhost:3002/api/v2/
        - VITE_APP_BACKEND_V2_POST_URL=http://localhost:3002/api/v2/post/
        - VITE_APP_WS_SERVER_URL=http://localhost:3002
    ports:
      - "3000:80"
    depends_on:
      - backend
```

The backend will create the required tables on first startup using `CREATE TABLE IF NOT EXISTS` — safe to run against an existing database.

---

## Running without Docker (development)

### 1. PostgreSQL

Any PostgreSQL instance works. Create a database:

```bash
createdb excalidraw
```

Or use Docker just for the database:

```bash
docker run -d \
  --name excalidraw-postgres \
  -e POSTGRES_DB=excalidraw \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Backend

```bash
cd self-hosted-backend
cp .env.example .env          # edit DATABASE_URL if needed
npm install
npm run build
npm start
```

Runs on port 3002. Migrations run automatically.

### 3. Frontend

```bash
# from repo root
yarn
yarn start
```

Dev server runs on port 3001. Already configured to talk to `localhost:3002`.

---

## Deploying to a server

Update the build args in `docker-compose.yml` to your domain:

```yaml
excalidraw:
  build:
    args:
      - VITE_APP_API_URL=https://api.yourdomain.com
      - VITE_APP_BACKEND_V2_GET_URL=https://api.yourdomain.com/api/v2/
      - VITE_APP_BACKEND_V2_POST_URL=https://api.yourdomain.com/api/v2/post/
      - VITE_APP_WS_SERVER_URL=https://api.yourdomain.com
```

Also:
- Put a reverse proxy (nginx or Caddy) in front with HTTPS — WebSocket connections require `Upgrade` headers to be forwarded
- Change the default postgres password (`POSTGRES_PASSWORD` in `docker-compose.yml`)
- Back up the `pgdata` volume

---

## Architecture

```
Browser (:3000)  ──HTTP──▶  Express API (:3002)  ──SQL──▶  PostgreSQL (:5432)
                 ──WS─────▶  Socket.IO   (:3002)
```

- All collaboration data is **end-to-end encrypted** — the server only ever stores ciphertext
- The backend stores scenes, uploaded files, and share links in PostgreSQL
- The WebSocket server relays encrypted messages between collaborators and is also bundled into the backend

---

## Environment variables

### Backend (`self-hosted-backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/excalidraw` | PostgreSQL connection string |
| `PORT` | `3002` | Listen port |

### Frontend (build args or `.env.production`)

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_API_URL` | `http://localhost:3002` | Backend base URL |
| `VITE_APP_BACKEND_V2_GET_URL` | `http://localhost:3002/api/v2/` | Share link read endpoint |
| `VITE_APP_BACKEND_V2_POST_URL` | `http://localhost:3002/api/v2/post/` | Share link write endpoint |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | WebSocket server URL |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Port already in use | Change the port mapping in `docker-compose.yml`, e.g. `"3001:80"` for the frontend |
| `port 5432 already in use` | You have a local PostgreSQL running — stop it or use an external DB as described above |
| Backend won't start | Run `docker-compose logs backend` — almost always a bad `DATABASE_URL` |
| Collaboration not working | Port 3002 must be reachable from your browser, not just within Docker |
| Images don't load in collab | Check `VITE_APP_API_URL` matches the address your browser uses to reach the backend |

---

## License

MIT — see [LICENSE](./LICENSE). Based on [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw).
