# AI Scribe Notes — Frontend (web)

React + TypeScript + Vite frontend for the AI Voice Note Manager.

## Getting started

```bash
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:5173` and calls the NestJS API at
`http://localhost:3000`. The backend CORS allowlist must include the frontend
origin (`API_ALLOWED_ORIGINS`); the default allowlist already contains
`http://localhost:5173`.

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000/api/v1` | Base URL of the backend API (global prefix `/api` + version `v1`). |

Create a `.env.local` (or `.env`) file in `web/` to override, e.g.:

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

When deploying the SPA to another origin, set `VITE_API_URL` to the deployed API
and add that origin to the backend `API_ALLOWED_ORIGINS` (or serve the built app
from the same origin as the API so no CORS is involved).

## Scripts

- `pnpm dev` — start the Vite dev server
- `pnpm build` — type-check (`tsc -b`) and build (`vite build`)
- `pnpm preview` — preview the production build

## Notes

- Auth is token-based (JWT). The access token is stored in `localStorage` and sent
  as a `Bearer` header to `/api/v1`.
- Login/registration are rate-limited by the backend (`5` requests / 60 s).