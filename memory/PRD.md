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

## 7. Next action items

1. Pick AI provider for Career Mentor (Claude Sonnet 4.6 / GPT 5.2 /
   Gemini 3) and obtain Emergent LLM key.
2. Decide on first feature batch (suggested: Classes → Streams → Careers
   read-only flow with mock seed data).
3. Confirm authentication priority (email/password first vs Google first).
4. Source real career & scholarship data (or content partner).
