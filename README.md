# Suman Vatika

The project is split into two independent apps:

- `frontend/` — Next.js website and admin dashboard.
- `backend/` — standalone Node.js API, SQLite/PostgreSQL database access, and admin authentication.

## Run locally

Start the backend in one terminal:

```powershell
cd backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in .env
pnpm install
pnpm dev
```

Start the frontend in another terminal:

```powershell
cd frontend
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The admin dashboard is at `/admin`. SQLite data and backend credentials stay under `backend/`; the frontend only needs `NEXT_PUBLIC_API_URL=http://localhost:4000`.

See [backend/README.md](backend/README.md) for API routes, admin authentication, and PostgreSQL deployment configuration.
