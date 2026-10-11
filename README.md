# IssueFlow

**Engineering Intelligence Platform** — a typed full-stack issue tracker with explainable risk scoring, duplicate hints, audit history, SLA jobs, and release-readiness analytics.

## Stack

- **Web:** React, TypeScript, Vite, Recharts, Lucide
- **API:** Node.js, Express, TypeScript, Zod, JWT, bcrypt
- **Data:** PostgreSQL + Prisma ORM
- **Background processing:** Redis + BullMQ
- **Quality:** Vitest, Supertest, Playwright
- **Delivery:** Dockerfiles, Docker Compose for local dependencies, GitHub Actions

## Prerequisites on Windows

1. Install **Node.js 22 LTS** (Node 20+ should also work) and Git.
2. Install **Docker Desktop** and start it.
3. Install **VS Code**.
4. Open the extracted `issueflow` folder in VS Code.

Check in a PowerShell terminal:

```powershell
node --version
npm --version
docker --version
docker compose version
```

## Start the project locally

Run these commands in the VS Code **PowerShell terminal**, from the root `issueflow` folder:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace `JWT_SECRET` with a random secret of at least 32 characters. Then start PostgreSQL and Redis:

```powershell
docker compose up -d
```

Install packages and generate the Prisma client:

```powershell
npm install
npm run db:generate
```

Create the local database migration and load sample data:

```powershell
npm run db:migrate
npm run db:seed
```

Start the web app and API:

```powershell
npm run dev
```

Open **http://localhost:5173**. API health check: **http://localhost:4000/api/health**.

### Demo login

- Email: `demo@issueflow.dev`
- Password: `IssueFlowDemo!2026`

The seed command creates this local demo account. Change or remove these credentials before any public deployment.

### Start the background worker

Keep the `npm run dev` terminal running. Open a **second** PowerShell terminal in the root folder and run:

```powershell
npm run worker
```

This worker processes queued overdue-issue scans and creates in-app notifications. The API endpoint `POST /api/jobs/sla-scan` queues a scan for an authenticated user.

## Tests and build

```powershell
npm test
npm run build
```

For browser tests, install the Playwright browser once, then run the E2E suite:

```powershell
npx playwright install chromium
npm run test:e2e
```

## Useful commands

```powershell
npm run dev             # frontend + API
npm run worker          # background jobs (second terminal)
npm run build           # type-check/build both apps
npm test                # unit tests
npm run test:e2e        # Playwright browser tests
npm run db:generate     # regenerate Prisma client
npm run db:migrate      # create/apply a development migration
npm run db:seed         # load repeatable demo data

docker compose logs -f  # inspect PostgreSQL/Redis

docker compose down     # stop services; database volume remains
```

## Current implementation and known scope

Implemented in this starter: registration/login API, workspace membership, issue creation/update/list/detail endpoints, search and filters, pagination, audit entries, deterministic risk scoring with reasons, lexical duplicate suggestions, dashboard overview, release-readiness calculation, and BullMQ overdue scanning. The UI includes a demo sign-in path and a dashboard for the seeded account.

GitHub linkage fields are a foundation, not a completed GitHub OAuth/webhook integration. The dashboard's weekly chart currently uses sample values and is explicitly labeled as illustrative; it must be backed by event-based analytics before being presented as real historical data. Email delivery, semantic/LLM features, deployment configuration, and comprehensive authorization integration tests are future tasks, not claimed as finished.

## Before production deployment

- Generate a unique high-entropy `JWT_SECRET`; configure it via the host's secret manager.
- Replace local PostgreSQL/Redis with managed services and enable TLS/backups.
- Configure `WEB_ORIGIN`, HTTPS, CORS, rate limits, and logging for the deployment.
- Review token storage and session design; the demo frontend uses local storage and should be hardened for production.
- Add integration tests for workspace isolation and role enforcement, plus end-to-end tests for issue workflows.
- Configure database migration execution as a controlled deployment step; do not run development migrations in a production release.
