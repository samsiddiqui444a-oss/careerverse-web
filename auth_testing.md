# Auth Testing Playbook (Emergent Google Auth)

> Source: Emergent Integration Playbook — adapted for CareerVerse.

CareerVerse uses a **bridge** between Emergent-managed Google Auth and its
own JWT + bcrypt email/password system, so the testing surface is:

1. `POST /api/auth/google/exchange` accepts `{session_id}` and returns the
   standard `AuthOut { token, user }` payload (same shape as
   `/api/auth/login`). No httpOnly cookies; the existing localStorage
   `careerverse:auth` key is reused.
2. Frontend route `/auth/google/callback` reads `session_id` from the URL
   hash, calls the exchange endpoint, stores the JWT via `AuthProvider`,
   then navigates to `next` (default `/`).
3. The Emergent endpoint contacted from the backend is
   `GET https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data`
   with header `X-Session-ID: <session_id>`. Response includes
   `{id, email, name, picture, session_token}` — we use email/name and
   ignore the cookie path entirely.

## Manual E2E test

1. Open `/login`, click **Continue with Google** → external redirect to
   `https://auth.emergentagent.com/?redirect=<origin>/auth/google/callback`.
2. After Google consent, the browser lands at
   `<origin>/auth/google/callback#session_id=<sid>`.
3. The callback page exchanges `<sid>` → JWT, then redirects to the
   originally requested page (or `/`).

## Curl-level test (synthetic session_id will return 401)

```bash
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d= -f2)
curl -s -X POST "$API/api/auth/google/exchange" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"invalid-sid"}'
# → 401 "Could not verify Google session"
```

## DB validation

A first-time Google login should create a `users` doc with:

- `provider = "google"`
- no `password_hash`
- `picture` set to the Google avatar URL
- `role = "user"`, `lastLoginAt` populated

Subsequent Google logins update `lastLoginAt` only — no duplicate accounts.

## Pitfalls (carry-over from playbook)

- Do **NOT** hardcode the redirect URL; always derive it dynamically via
  `window.location.origin + '/auth/google/callback'`.
- Session-id only travels in the URL **fragment** (`#session_id=…`),
  not query string.
- AuthCallback must be idempotent under React StrictMode — use a `useRef`
  guard, not `useState`.
