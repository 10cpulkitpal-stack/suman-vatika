# Suman Vatika backend

This is a standalone Node.js API server. The Next.js frontend lives in `../frontend` and calls this server using `NEXT_PUBLIC_API_URL`.

## Run locally

1. Copy `.env.example` to `.env` and set a unique `ADMIN_PASSWORD` and an `ADMIN_SESSION_SECRET` of at least 32 characters.
2. Run `pnpm install` in this directory.
3. Run `pnpm dev` to start the API at `http://localhost:4000`.
4. Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `../frontend/.env.local` and run the frontend separately.

The backend uses Node.js 22.5 or newer. Local SQLite data is written to `backend/data/suman-vatika.db` and ignored by Git.

Gallery photos can be managed at `/admin/gallery` after signing into the admin portal. Its Homepage preview and Full gallery page tabs manage independent image lists. The first database initialization imports the current four website gallery photos into both lists. New uploads are limited to 8 MB (JPG, PNG, WebP, or AVIF); uploaded files are saved under `backend/data/gallery/`, which is also ignored by Git.

## API

- `POST /api/inquiries` stores a validated guest enquiry, including their preferred contact method (`whatsapp`, `phone`, or `email`). Email contact requires an email address.
- `GET /api/availability?date=YYYY-MM-DD&space=Grand%20AC%20Hall` returns `available`, `unavailable`, or `unknown`.
- `POST /api/admin/session` signs in with the configured password and issues an eight-hour HTTP-only session cookie. `GET` checks the session; `DELETE` signs out.
- `GET /api/admin/inquiries` lists the latest 100 enquiries; `PATCH /api/admin/inquiries/:id` updates a status (`new`, `contacted`, `quoted`, `confirmed`, or `closed`) or edits the request details; `DELETE /api/admin/inquiries/:id` permanently deletes a request.
- `GET /api/admin/availability` lists availability records; `PUT` sets a date/space status. Use `*` as the space to apply a status to every space.
- `GET /api/gallery?placement=home|full` lists photos for the homepage preview or full gallery page. Admin `GET /api/admin/gallery?placement=home|full` lists that collection; `POST` uploads a photo with a matching `placement` field; `PATCH /api/admin/gallery/:id` edits its caption/category or ordering; `DELETE` removes it.

Admin APIs require a valid session or (when configured) `Authorization: Bearer <ADMIN_API_KEY>`. Public enquiry submissions never reserve dates.

## PostgreSQL deployment

The repository includes a root `render.yaml` blueprint for the Node API. Create a Supabase project, then set the following values in Render's environment settings:

- `DATABASE_URL`: the Supabase PostgreSQL connection URI. For a long-running Render backend, choose the Supabase Session pooler URI if Render cannot reach the direct IPv6 database endpoint. Keep the URI private.
- `SUPABASE_URL`: the Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: the server-side service-role key. Do not add it to Vercel or frontend code.
- `SUPABASE_GALLERY_BUCKET`: `gallery`, matching the public Storage bucket created in Supabase.
- `GALLERY_STORAGE_DRIVER`: `supabase` (already configured by the Render blueprint).
- `FRONTEND_ORIGIN`: the exact deployed Vercel origin, such as `https://your-site.vercel.app`.
- `ADMIN_PASSWORD`: a strong admin password.
- `ADMIN_SESSION_SECRET`: a random secret of at least 32 characters (Render's blueprint generates one).

The API initializes its tables automatically in the configured PostgreSQL database. Existing SQLite enquiries and gallery records on your computer are not copied automatically; they remain in the local database until separately migrated.

Local development keeps gallery files under `backend/data/gallery/`. Production uploads and deletions use Supabase Storage, so images persist across Render restarts and deploys.

## Frontend on Vercel

Set the Vercel project root directory to `frontend/` and select the Next.js framework. Configure `BACKEND_API_URL` as the Render API origin (for example, `https://suman-vatika-api.onrender.com`). The frontend proxies `/api` and `/media` through this URL. Keep `NEXT_PUBLIC_API_URL=http://localhost:4000` for local development only. Set the exact Vercel production origin in Render's `FRONTEND_ORIGIN`; include additional origins only if you want to allow specific preview deployments.

The Vercel and Render services can be deployed after the Supabase project and required environment values are ready. Follow the connection details shown in Supabase's Connect panel; for this persistent Node service, use the direct connection when reachable or the Session pooler when IPv4 connectivity is required.
