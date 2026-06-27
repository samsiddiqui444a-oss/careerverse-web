# CareerVerse — Architecture

> Status: **Foundation only**. No feature pages, no career data, no AI logic.
> This document is the single source of truth for how CareerVerse is built.

## 1. Stack

| Layer    | Choice                                                         |
|----------|----------------------------------------------------------------|
| Frontend | React 19 + React Router 7 + Tailwind CSS + shadcn/ui + framer-motion |
| Backend  | FastAPI (Python) with `/api` prefix routed via Kubernetes ingress |
| Database | MongoDB via motor (async). `id` field as `str(uuid4())` — never raw ObjectId. |
| Styling  | Tailwind tokens driven by CSS variables in `src/index.css`     |
| Theme    | Light + Dark, controlled by `.dark` class on `<html>`          |
| Fonts    | Outfit (display) + Plus Jakarta Sans (body) + JetBrains Mono   |
| Icons    | `lucide-react` (no emoji)                                      |
| State    | React Query (server cache) + local context (theme, auth)       |

## 2. Frontend folder layout

```
frontend/src/
├── App.js, App.css, index.js, index.css
├── components/
│   ├── ui/             # shadcn primitives (do not edit)
│   ├── layout/         # Navbar, Footer, AppLayout
│   ├── common/         # Reusable: CareerCard, StreamCard, ClassCard,
│   │                   # SkillCard, SectionHeading, ThemeToggle,
│   │                   # EmptyState, ErrorState, LoadingSkeleton
│   └── showcase/       # (reserved) sections used only by LandingShowcase
├── constants/
│   ├── routes.js       # Single source for all route paths
│   ├── navigation.js   # Primary nav + footer link groups
│   └── testIds/        # data-testid registry per feature
├── context/
│   └── ThemeProvider.jsx
├── hooks/
│   └── useTheme.js, use-toast.js
├── lib/
│   └── utils.js        # cn() and shared helpers
├── pages/
│   ├── LandingShowcase.jsx
│   └── NotFound.jsx
└── services/
    └── api.js          # axios instance bound to REACT_APP_BACKEND_URL/api
```

Reserved (created as features ship):
- `pages/{ClassExplorer,StreamExplorer,CareerLibrary,CareerDetail,CareerDNA,AIMentor,Scholarships,Dashboard,Auth,Admin}/`
- `features/<feature>/` — colocated hooks/services/components for vertical features
- `assets/`, `icons/`, `images/`
- `types/` — JSDoc typedef registry (project is JS, no TS yet)

## 3. Backend folder layout

```
backend/
├── server.py           # FastAPI app + /api router + foundation endpoints
└── .env                # MONGO_URL, DB_NAME, CORS_ORIGINS
```

Planned (created as features ship):
```
backend/
├── core/               # config, security, logging
├── db/                 # mongo connection helpers, base document, indexes
├── models/             # Pydantic document models (BaseDocument extends)
├── schemas/            # request/response DTOs
├── routers/            # auth, careers, streams, classes, skills,
│                       # roadmaps, scholarships, ai, admin, ...
└── services/           # business logic — providers (LLM), repositories
```

## 4. Routing contract

- All backend endpoints live under `/api/...`.
- Frontend calls **always** use `process.env.REACT_APP_BACKEND_URL`.
- All UI routes are declared in `frontend/src/constants/routes.js`.
- The current implementation renders only `/` (LandingShowcase) and `*` (NotFound).
  Every other future route is **declared but not yet rendered**.

## 5. Theming

- `ThemeProvider` reads `localStorage["careerverse:theme"]` or system preference.
- Toggling sets `<html class="dark">`.
- All colors flow from CSS variables in `index.css` → consumed by Tailwind in
  `tailwind.config.js`. **Never hardcode hex** values in components.

## 6. Component rules

- Components stay under ~80 lines.
- Reusable cards (Career/Stream/Class/Skill) accept structured props matching
  the future database schema in `DATABASE.md`.
- Every interactive element carries a `data-testid` (kebab-case, action-based).
- shadcn/ui primitives are imported from `@/components/ui/*` — never duplicated.

## 7. Performance

- Lazy-load all feature pages with `React.lazy + Suspense` once they exist.
- Images served from Unsplash with `?q=85` and `cs=srgb` query params.
- React Query is preconfigured (`staleTime: 60s`, no refetch on focus).

## 8. Future feature integration checklist

When adding a new feature (e.g. "Career DNA"):
1. Add route to `constants/routes.js`.
2. Add nav entry (if user-facing) to `constants/navigation.js`.
3. Add testIds file at `constants/testIds/<feature>.js`.
4. Add page under `pages/<Feature>.jsx` lazy-loaded in `App.js`.
5. Add backend router under `backend/routers/<feature>.py`, mounted on `api_router`.
6. Add Mongo collection + models, see `DATABASE.md`.
7. Update `PRD.md`.
