# EnergyMix — Backend

REST API for the UK energy mix and optimal EV‑charging window, built on data from
the public [Carbon Intensity API](https://carbon-intensity.github.io/api-definitions/).

**Clean energy** = `biomass + nuclear + hydro + wind + solar`.

## Tech stack

Node.js · TypeScript · Express 5 · Vitest · ESLint · Prettier · Docker

## Endpoints

| Method & path | Description |
| --- | --- |
| `GET /health` | Liveness probe → `{ status, timestamp }` |
| `GET /api/energy/mix` | Averaged generation mix for **today, tomorrow, day after**, grouped by UK (Europe/London) calendar date. |
| `GET /api/energy/charging-window?hours=1..6` | Window with the highest average clean‑energy share over the **next 48 h**. |

Half‑hourly intervals from the source API are grouped by London date (GMT/BST aware) and
averaged. The charging window slides over the half‑hour forecast (1 h = 2 intervals).

### Example responses

```jsonc
// GET /api/energy/mix
{ "data": [
  { "date": "2026-07-06", "intervals": 48, "cleanEnergyPercent": 71.86,
    "generationMix": { "wind": 30, "nuclear": 15, "gas": 22, /* … */ } }
] }

// GET /api/energy/charging-window?hours=3
{ "data": {
  "windowHours": 3,
  "start": "2026-07-06T14:00Z", "end": "2026-07-06T17:00Z",
  "averageCleanEnergyPercent": 78.2,
  "series": [ { "time": "2026-07-06T14:00Z", "cleanPercent": 72 } /* … */ ]
} }
```

Validation errors and upstream failures return a consistent shape:
`{ "error": "message" }` with an appropriate status (`400`, `500`).

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values
npm run dev               # http://localhost:3000 (nodemon + ts-node)
```

### Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `API_URL` | ✅ | — | Carbon Intensity API base, |
| `PORT` | | `3000` | Port to listen on |
| `FRONT_URL` | | `http://localhost:5173` | Allowed CORS origin (the frontend) |

`API_URL` has **no fallback** on purpose — if it is missing, data endpoints return `500`
instead of silently hitting a hardcoded URL.

## Scripts

| Script | Action |
| --- | --- |
| `npm run dev` | Dev server with reload |
| `npm run build` | Compile TS → `dist/` (`tsconfig.build.json`, excludes tests) |
| `npm start` | Run the compiled server |
| `npm test` | Run the Vitest unit tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier write / check |

## Tests

Unit tests live in `src/tests/` (Vitest), written in a given‑when‑then style. They cover the
date/energy/validation utilities and the services (the network boundary `fetchGeneration`
is mocked, so tests are deterministic and offline).

```bash
npm test
```

## Docker

```bash
docker build -t energymix-backend .
docker run -p 3000:3000 -e API_URL=https://api.carbonintensity.org.uk energymix-backend
```

Multi‑stage build: TypeScript is compiled in a build stage; the runtime image ships only
production dependencies and `dist/`. The container listens on `PORT` (defaults to `3000`).

## Project structure

```text
src/
├── index.ts            # bootstrap (loads env, starts the server)
├── server.ts           # express app, CORS, JSON, routes, error handling
├── controllers/        # thin request handlers
├── services/           # domain logic + Carbon Intensity API client
├── routers/            # route definitions
├── middlewares/        # error handler, 404
├── utils/              # date, energy and validation helpers
├── types/              # shared types
└── tests/              # Vitest unit tests
```
