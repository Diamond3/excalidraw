<a href="https://excalidraw.com/" target="_blank" rel="noopener">
  <picture>
    <source media="(prefers-color-scheme: dark)" alt="Excalidraw" srcset="https://excalidraw.nyc3.cdn.digitaloceanspaces.com/github/excalidraw_github_cover_2_dark.png" />
    <img alt="Excalidraw" src="https://excalidraw.nyc3.cdn.digitaloceanspaces.com/github/excalidraw_github_cover_2.png" />
  </picture>
</a>

<h4 align="center">
  <a href="https://excalidraw.com">Excalidraw Editor</a> |
  <a href="https://plus.excalidraw.com/blog">Blog</a> |
  <a href="https://docs.excalidraw.com">Documentation</a> |
  <a href="https://plus.excalidraw.com">Excalidraw+</a>
</h4>

<div align="center">
  <h2>
    An open source virtual hand-drawn style whiteboard. </br>
    Collaborative and end-to-end encrypted. </br>
  <br />
  </h2>
</div>

<br />
<p align="center">
  <a href="https://github.com/excalidraw/excalidraw/blob/master/LICENSE">
    <img alt="Excalidraw is released under the MIT license." src="https://img.shields.io/badge/license-MIT-blue.svg"  /></a>
  <a href="https://www.npmjs.com/package/@excalidraw/excalidraw">
    <img alt="npm downloads/month" src="https://img.shields.io/npm/dm/@excalidraw/excalidraw"  /></a>
  <a href="https://docs.excalidraw.com/docs/introduction/contributing">
    <img alt="PRs welcome!" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat"  /></a>
  <a href="https://discord.gg/UexuTaE">
    <img alt="Chat on Discord" src="https://img.shields.io/discord/723672430744174682?color=738ad6&label=Chat%20on%20Discord&logo=discord&logoColor=ffffff&widget=false"/></a>
  <a href="https://deepwiki.com/excalidraw/excalidraw">
    <img alt="Ask DeepWiki" src="https://deepwiki.com/badge.svg" /></a>
  <a href="https://twitter.com/excalidraw">
    <img alt="Follow Excalidraw on Twitter" src="https://img.shields.io/twitter/follow/excalidraw.svg?label=follow+@excalidraw&style=social&logo=twitter"/></a>
</p>

<div align="center">
  <figure>
    <a href="https://excalidraw.com" target="_blank" rel="noopener">
      <img src="https://excalidraw.nyc3.cdn.digitaloceanspaces.com/github%2Fproduct_showcase.png" alt="Product showcase" />
    </a>
    <figcaption>
      <p align="center">
        Create beautiful hand-drawn like diagrams, wireframes, or whatever you like.
      </p>
    </figcaption>
  </figure>
</div>

## Features

The Excalidraw editor (npm package) supports:

- 💯&nbsp;Free & open-source.
- 🎨&nbsp;Infinite, canvas-based whiteboard.
- ✍️&nbsp;Hand-drawn like style.
- 🌓&nbsp;Dark mode.
- 🏗️&nbsp;Customizable.
- 📷&nbsp;Image support.
- 😀&nbsp;Shape libraries support.
- 🌐&nbsp;Localization (i18n) support.
- 🖼️&nbsp;Export to PNG, SVG & clipboard.
- 💾&nbsp;Open format - export drawings as an `.excalidraw` json file.
- ⚒️&nbsp;Wide range of tools - rectangle, circle, diamond, arrow, line, free-draw, eraser...
- ➡️&nbsp;Arrow-binding & labeled arrows.
- 🔙&nbsp;Undo / Redo.
- 🔍&nbsp;Zoom and panning support.

## Excalidraw.com

The app hosted at [excalidraw.com](https://excalidraw.com) is a minimal showcase of what you can build with Excalidraw. Its [source code](https://github.com/excalidraw/excalidraw/tree/master/excalidraw-app) is part of this repository as well, and the app features:

- 📡&nbsp;PWA support (works offline).
- 🤼&nbsp;Real-time collaboration.
- 🔒&nbsp;End-to-end encryption.
- 💾&nbsp;Local-first support (autosaves to the browser).
- 🔗&nbsp;Shareable links (export to a readonly link you can share with others).

We'll be adding these features as drop-in plugins for the npm package in the future.

## Self-Hosting with Docker

This fork replaces Firebase with a self-hosted PostgreSQL backend. Everything runs locally via Docker Compose — no external services, no Firebase account needed.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- Ports **3000**, **3002**, and **5432** available on your machine

### Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/Diamond3/excalidraw.git
cd excalidraw

# 2. Start everything
docker-compose up --build
```

That's it. Three services will start:

| Service | Port | Description |
|---|---|---|
| **excalidraw** | [localhost:3000](http://localhost:3000) | The frontend app (nginx) |
| **backend** | [localhost:3002](http://localhost:3002) | Express API + WebSocket server |
| **postgres** | localhost:5432 | PostgreSQL database |

Open **http://localhost:3000** in your browser and start drawing.

### What Works

- Drawing and local save (autosave to browser)
- Real-time collaboration (share a link, open in two tabs)
- End-to-end encryption (unchanged from upstream)
- Share links (export to shareable readonly link)
- Image support in collaboration mode
- Scene persistence across page refreshes

### Architecture

```
Browser (:3000)  ──HTTP──>  Express API (:3002)  ──SQL──>  PostgreSQL (:5432)
                 ──WS────>  Socket.IO   (:3002)
```

- **Frontend** is the standard Excalidraw app served by nginx
- **Backend** handles scene CRUD, file storage, share links, and WebSocket relay
- **PostgreSQL** stores scenes (encrypted), uploaded files, and share link data
- All collaboration data is end-to-end encrypted — the server only sees ciphertext

### Stopping

```bash
docker-compose down
```

To also wipe the database:

```bash
docker-compose down -v
```

### Running Without Docker (Development)

If you want to run the services individually for development:

#### 1. Start PostgreSQL

Use any PostgreSQL instance (local install, Docker, cloud). Create a database:

```bash
createdb excalidraw
```

#### 2. Start the backend

```bash
cd self-hosted-backend
cp .env.example .env
# Edit .env if your DATABASE_URL differs from the default
npm install
npm run build
npm start
```

The backend starts on port 3002 and auto-runs migrations on first boot.

#### 3. Start the frontend

```bash
# From the repo root
yarn
yarn start
```

The dev server starts on port 3001 (configured in `.env.development`). It's already configured to point at `localhost:3002` for the API and WebSocket server.

### Environment Variables

#### Frontend (set in `.env.development` or `.env.production`)

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_API_URL` | `http://localhost:3002` | Backend API base URL |
| `VITE_APP_BACKEND_V2_GET_URL` | `http://localhost:3002/api/v2/` | Share link GET endpoint |
| `VITE_APP_BACKEND_V2_POST_URL` | `http://localhost:3002/api/v2/post/` | Share link POST endpoint |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | WebSocket server URL |

#### Backend (set in `self-hosted-backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/excalidraw` | PostgreSQL connection string |
| `PORT` | `3002` | Server listen port |

### Customizing for Production

When deploying to a server, update the URLs in `docker-compose.yml` build args to match your domain:

```yaml
excalidraw:
  build:
    args:
      - VITE_APP_API_URL=https://api.yourdomain.com
      - VITE_APP_BACKEND_V2_GET_URL=https://api.yourdomain.com/api/v2/
      - VITE_APP_BACKEND_V2_POST_URL=https://api.yourdomain.com/api/v2/post/
      - VITE_APP_WS_SERVER_URL=https://api.yourdomain.com
```

You should also:
- Put a reverse proxy (nginx/Caddy) in front with HTTPS
- Change the default PostgreSQL password in `docker-compose.yml`
- Set up database backups for the `pgdata` volume

### Troubleshooting

| Problem | Fix |
|---|---|
| `port 3000 already in use` | Stop whatever is using port 3000, or change the port in `docker-compose.yml` |
| `port 5432 already in use` | You have a local PostgreSQL running. Stop it or change the port mapping |
| Backend crashes on startup | Check `docker-compose logs backend` — usually a database connection issue |
| Collaboration doesn't work | Make sure port 3002 is accessible from your browser (not just from Docker) |
| Images don't load in collab | Check that the backend is running and `VITE_APP_API_URL` is correct |

---

## Quick start

**Note:** following instructions are for installing the Excalidraw [npm package](https://www.npmjs.com/package/@excalidraw/excalidraw) when integrating Excalidraw into your own app. To run the repository locally for development, please refer to our [Development Guide](https://docs.excalidraw.com/docs/introduction/development).

Use `npm` or `yarn` to install the package.

```bash
npm install react react-dom @excalidraw/excalidraw
# or
yarn add react react-dom @excalidraw/excalidraw
```

Check out our [documentation](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/installation) for more details!

## Contributing

- Missing something or found a bug? [Report here](https://github.com/excalidraw/excalidraw/issues).
- Want to contribute? Check out our [contribution guide](https://docs.excalidraw.com/docs/introduction/contributing) or let us know on [Discord](https://discord.gg/UexuTaE).
- Want to help with translations? See the [translation guide](https://docs.excalidraw.com/docs/introduction/contributing#translating).

## Integrations

- [VScode extension](https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor)
- [npm package](https://www.npmjs.com/package/@excalidraw/excalidraw)

## Who's integrating Excalidraw

[Google Cloud](https://googlecloudcheatsheet.withgoogle.com/architecture) • [Meta](https://meta.com/) • [CodeSandbox](https://codesandbox.io/) • [Obsidian Excalidraw](https://github.com/zsviczian/obsidian-excalidraw-plugin) • [Replit](https://replit.com/) • [Slite](https://slite.com/) • [Notion](https://notion.so/) • [HackerRank](https://www.hackerrank.com/) • and many others

## Sponsors & support

If you like the project, you can become a sponsor at [Open Collective](https://opencollective.com/excalidraw) or use [Excalidraw+](https://plus.excalidraw.com/).

## Thank you for supporting Excalidraw

[<img src="https://opencollective.com/excalidraw/tiers/sponsors/0/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/0/website) [<img src="https://opencollective.com/excalidraw/tiers/sponsors/1/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/1/website) [<img src="https://opencollective.com/excalidraw/tiers/sponsors/2/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/2/website) [<img src="https://opencollective.com/excalidraw/tiers/sponsors/3/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/3/website) [<img src="https://opencollective.com/excalidraw/tiers/sponsors/4/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/4/website) [<img src="https://opencollective.com/excalidraw/tiers/sponsors/5/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/5/website) [<img src="https://opencollective.com/excalidraw/tiers/sponsors/6/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/6/website) [<img src="https://opencollective.com/excalidraw/tiers/sponsors/7/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/7/website) [<img src="https://opencollective.com/excalidraw/tiers/sponsors/8/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/8/website) [<img src="https://opencollective.com/excalidraw/tiers/sponsors/9/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/9/website) [<img src="https://opencollective.com/excalidraw/tiers/sponsors/10/avatar.svg?avatarHeight=120"/>](https://opencollective.com/excalidraw/tiers/sponsors/10/website)

<a href="https://opencollective.com/excalidraw#category-CONTRIBUTE" target="_blank"><img src="https://opencollective.com/excalidraw/tiers/backers.svg?avatarHeight=32"/></a>

Last but not least, we're thankful to these companies for offering their services for free:

[![Vercel](./.github/assets/vercel.svg)](https://vercel.com) [![Sentry](./.github/assets/sentry.svg)](https://sentry.io) [![Crowdin](./.github/assets/crowdin.svg)](https://crowdin.com)
