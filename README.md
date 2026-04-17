# Excalidraw — Self-Hosted

A fork of [Excalidraw](https://excalidraw.com) with Firebase replaced by a small Node/Express backend that stores data in PostgreSQL.

## What this fork changes

- **Firebase removed.** Scenes, share links and uploaded files go to a Postgres database instead.
- **Workspaces.** Save the current canvas on the server under a name and reload it later.
- **Quick-save button** in the top-right — one click to save the active workspace.
- **Single-origin Docker setup.** nginx serves the frontend and reverse-proxies `/api` and `/socket.io` to the backend, so the whole app runs on one port.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose v2
- **An external PostgreSQL database** you can reach from the backend container

> This repo does **not** bundle a database. You need to provide your own Postgres (Supabase, Railway, Neon, RDS, a local install — anything works). The DB can be empty; the backend creates its tables on first boot.

## Setup

**1.** Put your connection string in a `.env` file next to `docker-compose.yml`:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**2.** Build and run:

```bash
docker compose up --build
```

**3.** Open <http://localhost:3000>.

## Stop

```bash
docker compose down
```

## Architecture

```
Browser ─▶ :3000 nginx ─┬─▶ static frontend
                        └─▶ /api, /socket.io ─▶ backend:3002 ─▶ PostgreSQL
```

Only `DATABASE_URL` is configurable. Everything else is baked into the image.

## License

MIT — see [LICENSE](./LICENSE). Based on [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw).
