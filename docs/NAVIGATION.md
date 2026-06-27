# CareerVerse — Navigation Plan

> Routes and primary navigation are pre-declared so future features
> integrate without restructuring the app shell.

## Route registry

Defined in `frontend/src/constants/routes.js`. Currently rendered routes:

- `/` → `LandingShowcase` (design-system showcase)
- `*` → `NotFound`

All other routes below are **declared, not yet rendered** — the navbar
shows them with a "Soon" badge.

### Discovery
- `/classes` — Class Explorer (8, 9, 10, 11, 12, UG)
- `/classes/:classId` — Class detail (stream paths, milestones)
- `/streams` — Stream Explorer (Science/Commerce/Humanities/Hybrid)
- `/streams/:slug` — Stream detail
- `/careers` — Career Library (search + filter)
- `/careers/:slug` — Career detail (overview, roadmap, skills, salary)
- `/careers/compare` — Compare up to 4 careers side-by-side
- `/skills` & `/skills/:slug`
- `/roadmaps` — Roadmap browser

### AI & Tests
- `/ai-mentor` — Conversational AI mentor
- `/career-dna` — Career DNA Test (traits → recommendations)

### Funding
- `/scholarships`, `/scholarships/:slug`

### Account
- `/login`, `/register`
- `/dashboard` — Student dashboard
- `/dashboard/saved` — Saved careers + bookmarks
- `/dashboard/settings`

### Admin
- `/admin` — Admin panel (content moderation, analytics)

## Primary navbar (foundation)

The navbar exposes the top 6 destinations:

1. Explore (Classes)
2. Streams
3. Careers
4. Career DNA
5. AI Mentor
6. Scholarships

Each item is currently disabled with a "Soon" badge until the underlying
page ships. The CTAs (`Sign in`, `Get started`) link to `/login` and
`/register` which today fall through to `NotFound`.

## Mobile navigation

The navbar collapses below `md` into a single overflow menu (toggle in
top-right). The mobile menu mirrors the desktop primary nav.

## Breadcrumbs (future)

A `<Breadcrumbs>` component will read directly from the matched route
and the route registry — no manual configuration per page.

## Footer navigation

Four planned link groups, configured in `constants/navigation.js`:

- **Product**: Class Explorer, Stream Explorer, Career Library, Career DNA, AI Mentor
- **Resources**: Roadmaps, Skill Library, Scholarships, Career Comparison
- **Account**: Sign in, Create account, Dashboard, Saved Careers
- **Company**: About, Privacy, Terms, Contact
