# CareerVerse — Product Requirements Document

> Last updated: 2026-02 · Stage: **Foundation only** (no feature pages yet).

## 1. Vision

Build the most comprehensive, AI-powered career guidance platform for
Indian students from Class 8 through college. The product helps a student
confidently choose their stream, discover careers, follow a personalized
roadmap, identify required skills, find scholarships, and consult an AI
mentor — all in one place.

## 2. Original problem statement (verbatim summary)

A scalable, production-grade career guidance web app for Class 8 → College
Indian students. This phase explicitly **excludes** building pages, dummy
data, AI flows, or any feature implementation. It only creates the project
foundation: design system, component library, folder architecture, route
& navigation planning, database planning, auth planning, and a single
design-system showcase landing page.

## 3. User personas

- **Class 9–10 student** — Curious, deciding stream. Needs clarity over jargon.
- **Class 11–12 student** — Locked stream, building shortlist of careers.
- **Undergraduate** — Specializing, planning internships and first job.
- **Parent** — Skim-reads with the student; needs trust signals + outcomes.
- **Admin / Content team** — Curates careers, scholarships, roadmaps.

## 4. Core requirements (static)

- Premium ed-tech feel, trustworthy, student-friendly.
- Light + dark themes equally supported from day one.
- Reusable component library: Career, Stream, Class, Skill cards;
  navbar, footer, badges, inputs, accordion, breadcrumbs, pagination,
  skeletons, empty/error/loading states.
- Routing pre-declared for every future page in `constants/routes.js`.
- Mobile-first responsive design.

## 5. Foundation deliverables (implemented in this iteration)

- ✅ Design tokens (colors, radii, typography, spacing) wired through
  Tailwind + CSS variables in `index.css`.
- ✅ Outfit + Plus Jakarta Sans + JetBrains Mono loaded via Google Fonts.
- ✅ Light + dark theming via `<ThemeProvider>` + `useTheme()` hook.
- ✅ Global app shell: `<Navbar>`, `<Footer>`, `<AppLayout>` with sticky
  glass navbar on scroll and mobile menu.
- ✅ Reusable components: `CareerCard`, `StreamCard`, `ClassCard`,
  `SkillCard`, `SectionHeading`, `ThemeToggle`, `EmptyState`,
  `ErrorState`, `LoadingSkeleton`.
- ✅ Design-system showcase landing page at `/` (Hero, Color palette,
  Typography, Buttons + Badges, Cards, Forms, States, FAQ, CTA).
- ✅ `NotFound` page at `*`.
- ✅ Route registry, navigation registry, testIds registry per feature.
- ✅ Axios client bound to `REACT_APP_BACKEND_URL/api`.
- ✅ Backend `/api/health`, `/api/`, `/api/status` endpoints + CORS.
- ✅ Architecture, database, auth, navigation planning docs in `/app/docs/`.

## 5b. Iteration 2 — Class → Stream → Career flow (Feb 2026)

- ✅ Curated India-first seed data: 25 careers, 6 streams, 6 classes,
  8 categories, 12 scholarships in `backend/data/seed_data.py`.
- ✅ Backend read-only API: `/api/classes`, `/api/classes/:id`,
  `/api/streams`, `/api/streams/:slug`, `/api/careers` (with
  `q`/`category`/`stream`/`class_level` query params),
  `/api/careers/:slug`, `/api/categories`, `/api/scholarships`.
- ✅ Lazy idempotent seeding on first read.
- ✅ React Query hooks in `hooks/useContent.js`.
- ✅ Pages: `ClassExplorer`, `ClassDetail`, `StreamExplorer`,
  `StreamDetail`, `CareerLibrary` (search + category filter),
  `CareerDetail` (salary bands, skills, related streams).
- ✅ Navbar Classes / Streams / Careers items now enabled.
- ✅ `EMERGENT_LLM_KEY` added to backend `.env` for future AI Mentor.
- ✅ Tested 100% backend + 100% frontend (`iteration_2.json`).

## 6. Prioritized backlog (post-foundation)

### P0 — Discovery core
- Class Explorer page (`/classes` + `/classes/:classId`)
- Stream Explorer page (`/streams` + `/streams/:slug`)
- Career Library page (`/careers` with search + filters)
- Career Detail page (`/careers/:slug` with overview, roadmap, skills, salary)
- Backend: `careers`, `streams`, `career_categories` collections + CRUD
- Auth (JWT email/password + Emergent Google) — see `docs/AUTH.md`

### P1 — Personalization
- Saved Careers + Bookmarks
- Career Comparison (`/careers/compare`)
- Student Dashboard (`/dashboard`)
- Career DNA Test (`/career-dna`)
- Scholarship Explorer (`/scholarships`)

### P2 — AI + Growth
- AI Career Mentor (provider chosen at integration time)
- Roadmap deep-dives + Skill detail pages
- Admin panel
- Notifications + email digests
- Premium tier gating

## 5c. Iteration 3 — Email/Password Auth (Feb 2026)

- ✅ Backend `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
  (PyJWT HS256, 30-day TTL, bcrypt rounds=12, Pydantic EmailStr).
- ✅ React `AuthProvider` (token persisted in `localStorage` key
  `careerverse:auth`, axios `Authorization: Bearer` header, `/auth/me`
  re-validation on reload, `signIn`/`signUp`/`signOut`).
- ✅ `/login` and `/register` pages with inline validation + error
  surfaces (`login-error`, `register-error` data-testids).
- ✅ Navbar reflects signed-in state ("Hi, <name>" + Sign out).
- ✅ Seeded test user `test.student@careerverse.io / Test@1234`
  documented in `/app/memory/test_credentials.md`.
- ✅ Testing agent iteration_5: 100% backend (11/11 pytest) +
  100% frontend (12/12 Playwright assertions). No defects.

## 7. Next action items

1. **AI Career Mentor (P0)** — pick model (Claude Sonnet 4.6 / GPT 5.2 /
   Gemini 3 Pro) → integrate via `EMERGENT_LLM_KEY` with streaming chat
   UI + MongoDB chat history.
2. **Emergent Google Auth (P1)** — add Google social login alongside
   email/password.
3. **Save Career / Bookmark (P1)** — now unblocked by auth; persist
   bookmarks on the user document.
4. **Save Career DNA result to profile (P1)**.
5. **Student Dashboard / Profile page (P2)**.
6. Source real career & scholarship data (or content partner).
