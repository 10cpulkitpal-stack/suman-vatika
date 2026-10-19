# Frontend and backend

The Next.js frontend makes HTTP requests through `lib/api.ts` to the standalone API in `../backend`. It does not own database access, password validation, or API handlers.

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the backend origin. For local development, use `http://localhost:4000`. See the root `README.md` and `../backend/README.md` for startup and backend configuration.
