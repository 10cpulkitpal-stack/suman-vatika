# Suman Vatika backend

This is a standalone Node.js API server. The Next.js frontend lives in `../frontend` and calls this server using `NEXT_PUBLIC_API_URL`.

## Run locally

1. Copy `.env.example` to `.env` and set a unique `ADMIN_PASSWORD` and an `ADMIN_SESSION_SECRET` of at least 32 characters.
2. Run `pnpm install` in this directory.
3. Run `pnpm dev` to start the API at `http://localhost:4000`.
4. Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `../frontend/.env.local` and run the frontend separately.

The backend uses Node.js 22.5 or newer. Local SQLite data is written to `backend/data/suman-vatika.db` and ignored by Git.

## API

- `POST /api/inquiries` stores a validated guest enquiry, including their preferred contact method (`whatsapp`, `phone`, or `email`). Email contact requires an email address.
- `GET /api/availability?date=YYYY-MM-DD&space=Grand%20AC%20Hall` returns `available`, `unavailable`, or `unknown`.
- `POST /api/admin/session` signs in with the configured password and issues an eight-hour HTTP-only session cookie. `GET` checks the session; `DELETE` signs out.
- `GET /api/admin/inquiries` lists the latest 100 enquiries; `PATCH /api/admin/inquiries/:id` updates a status (`new`, `contacted`, `quoted`, `confirmed`, or `closed`) or edits the request details; `DELETE /api/admin/inquiries/:id` permanently deletes a request.
- `GET /api/admin/availability` lists availability records; `PUT` sets a date/space status. Use `*` as the space to apply a status to every space.

Admin APIs require a valid session or (when configured) `Authorization: Bearer <ADMIN_API_KEY>`. Public enquiry submissions never reserve dates.

## PostgreSQL deployment

Set `DATABASE_URL` to `postgresql://user:password@host:5432/suman_vatika`. The server selects PostgreSQL based on the URL scheme and initializes the same tables automatically. Set `FRONTEND_ORIGIN`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` as deployment environment values. Use a persistent PostgreSQL service in deployment. The server binds to all interfaces automatically in production; local development binds to loopback.
