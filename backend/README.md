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

Set `DATABASE_URL` to `postgresql://user:password@host:5432/suman_vatika`. The server selects PostgreSQL based on the URL scheme and initializes the same tables automatically. Set `FRONTEND_ORIGIN`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` as deployment environment values. Use a persistent PostgreSQL service in deployment. The server binds to all interfaces automatically in production; local development binds to loopback.

Uploaded gallery files currently use local disk storage. This is suitable for local development. Before deploying the API on Render, configure persistent image storage (for example, a Render persistent disk mounted for `backend/data`, or an object storage provider); otherwise uploaded files on an ephemeral service filesystem can be lost on redeploy or restart. When the API is hosted at a public URL, set `PUBLIC_API_URL` to that URL so gallery images load correctly on the frontend.
