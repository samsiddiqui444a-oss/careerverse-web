# CareerVerse — Authentication Plan

> No auth UI yet. This document outlines the architecture so the upcoming
> implementation does not require any rework.

## Goals

- Support **email + password** login (JWT-based) — default for most users.
- Support **Google OAuth** via Emergent-managed social login.
- Support **Guest Mode** — full read access without account; saved state
  lives in `localStorage` and migrates on sign-up.
- Support future role-based access (`student`, `admin`).

## Token strategy

- Access token: short-lived JWT (15 min), stored in memory + httpOnly cookie.
- Refresh token: long-lived (30 days), httpOnly + secure cookie.
- Token payload: `{ sub: user_id, role, tier, iat, exp }`.

## API endpoints (planned)

| Method | Path                       | Purpose                          |
|--------|----------------------------|----------------------------------|
| POST   | `/api/auth/register`       | email/password sign-up           |
| POST   | `/api/auth/login`          | email/password sign-in           |
| POST   | `/api/auth/logout`         | invalidate refresh cookie        |
| POST   | `/api/auth/refresh`        | rotate access token              |
| GET    | `/api/auth/me`             | current user                     |
| POST   | `/api/auth/google/start`   | initiate Emergent Google flow    |
| POST   | `/api/auth/google/callback`| finalize Google login            |
| POST   | `/api/auth/forgot`         | send password reset link         |
| POST   | `/api/auth/reset`          | accept new password with token   |

## Frontend integration

- `services/api.js` exposes the axios instance — a request interceptor will
  attach the access token from memory.
- A `useAuth()` hook (to be added under `hooks/`) reads from `AuthContext`,
  exposes `{ user, status: "guest|loading|authed", signIn, signOut }`.
- Route guards via a `<ProtectedRoute>` wrapper (TBD) — falls back to
  `/login?next=...` on `status === "guest"`.

## Security checklist (when implementing)

- Hash with bcrypt (cost ≥ 12). Never store plain password.
- Rate-limit `/auth/login` and `/auth/forgot` (10 req / 15 min / IP).
- CSRF protection for cookie-based auth — same-site `lax` + double-submit
  token for state-changing endpoints.
- All auth endpoints respond in **constant time** for unknown users to
  prevent enumeration.
- Audit log entries for password changes, role changes, admin sign-ins.

## Admin auth

- Same JWT flow with `role: admin` claim.
- Admin panel at `/admin` (route declared, not yet rendered).
- Server-side guard on every `/api/admin/*` endpoint.
