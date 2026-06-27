# CareerVerse — Database Plan

> MongoDB collections, planned for forward compatibility. **No data is
> seeded at this stage.** This document drives the schema we will build out
> as each feature ships.

## Conventions

- Primary key: `id: str` (uuid4 string) — never raw `ObjectId` over the API.
- Timestamps: `created_at`, `updated_at` as ISO-8601 strings.
- Soft delete: `deleted_at: Optional[str]` where applicable.
- All write paths use `Model.to_mongo()`; reads use `Model.from_mongo(doc)`.

## Collections

### `users`
| Field             | Type     | Notes                                              |
|-------------------|----------|----------------------------------------------------|
| id                | string   | uuid4                                              |
| email             | string   | unique, indexed                                    |
| password_hash     | string?  | only for email/password auth                       |
| google_id         | string?  | for Google social login                            |
| name              | string   |                                                    |
| avatar_url        | string?  |                                                    |
| class_level       | string   | one of `8, 9, 10, 11, 12, UG, PG`                  |
| stream            | string?  | one of `science, commerce, humanities, ...`        |
| onboarding_done   | bool     | default false                                      |
| role              | string   | `student` \| `admin`                               |
| premium_tier      | string   | `free` \| `pro` \| `pro_plus` (future)             |
| created_at        | string   |                                                    |
| last_seen_at      | string   |                                                    |

### `careers`
| Field         | Type      | Notes |
|---------------|-----------|-------|
| id            | string    | uuid4 |
| slug          | string    | unique, kebab-case |
| title         | string    |       |
| category_id   | string    | FK → `career_categories` |
| stream_ids    | string[]  | FKs → `streams` (a career may span streams) |
| summary       | string    | short marketing line |
| description   | string    | rich/markdown |
| salary_band   | object    | `{ entry, mid, senior, currency }` |
| growth_pct    | number    | YoY industry projection |
| required_skill_ids | string[] | FKs → `skills` |
| roadmap_id    | string?   | FK → `roadmaps` |
| backup_career_ids | string[] | FKs → `careers` (graceful alternatives) |
| seo           | object    | `{ meta_title, meta_desc, og_image }` |
| created_at    | string    |       |

### `career_categories`
`{ id, slug, name, icon, color_token }`

### `streams`
`{ id, slug, name, description, applicable_classes: ["9","10","11","12"] }`

### `skills`
`{ id, slug, name, type: "technical|soft|domain", est_hours, level }`

### `roadmaps`
| Field       | Type       | Notes |
|-------------|------------|-------|
| id          | string     |       |
| career_id   | string     | FK → `careers` |
| stages      | object[]   | `[{ stage, age_range, milestones[], skill_ids[], resources[] }]` |

### `scholarships`
`{ id, slug, name, provider, eligibility, amount, deadline, url, tags[] }`

### `saved_careers`
`{ id, user_id, career_id, note, created_at }`  (compound index on `user_id+career_id`)

### `bookmarks`
Polymorphic: `{ id, user_id, target_type: "career|scholarship|stream|skill", target_id, created_at }`

### `career_comparisons`
`{ id, user_id, career_ids: string[], created_at }`  (max 4 careers per row)

### `career_dna_results`
`{ id, user_id, answers: object[], traits: object, recommended_career_ids: string[], created_at }`

### `ai_chat_history`
`{ id, user_id, thread_id, role, content, model, tokens, created_at }`

### `notifications`
`{ id, user_id, type, title, body, read_at?, created_at }`

### `settings`
`{ id, user_id, theme: "system|light|dark", locale, notifications: { ... } }`

### `admin_audit_log`
`{ id, admin_user_id, action, target_collection, target_id, payload, created_at }`

## Indexes (to be applied on first write)

- `users.email` — unique
- `users.google_id` — sparse unique
- `careers.slug`, `scholarships.slug`, `streams.slug` — unique
- `saved_careers` — `{ user_id: 1, career_id: 1 }` unique compound
- `ai_chat_history` — `{ user_id: 1, thread_id: 1, created_at: 1 }`
- `notifications` — `{ user_id: 1, read_at: 1, created_at: -1 }`
