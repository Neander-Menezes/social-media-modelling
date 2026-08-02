# Sprint 001 — Bootstrap (pipe + tiny schema)

**Date:** 2026-08-02  
**Duration target:** ~1 hour  
**Role stance:** Product Engineer (product decisions + engineering delivery)

## Source material

Hands-on practice based on Hello Interview’s PostgreSQL deep dive for system design interviews:

- [PostgreSQL Deep Dive (Hello Interview)](https://www.hellointerview.com/learn/system-design/deep-dives/postgres)

Motivating scenario from the article: a growing social media platform (users, posts, comments, follows, likes, DMs) used to explore Postgres strengths/limits — consistency, indexing, replication, and when *not* to use Postgres. Sprint 001 only bootstraps the runnable foundation; modelling that domain is Sprint 002+.

**Reusable session knowledge:** [../knowledge/001-bootstrap-session.md](../knowledge/001-bootstrap-session.md)  
**Cursor skill (process):** [.cursor/skills/product-engineer-sprint/SKILL.md](../../.cursor/skills/product-engineer-sprint/SKILL.md)

## Objective (done when)

1. `make up` brings up Postgres + Node API via Compose.
2. Named volume survives `make down` (`docker compose down`, **no** `-v`).
3. App startup: TCP check → SQL check (backoff 1s…32s), then migrations, then listen.
4. `GET /health` → `200 {"status":"ok"}` or `503`.
5. `GET /schemas` → public table names + sizes (excludes `schema_migrations`).
6. `GET /schemas/:tableName` → catalog facts + **mock** LLM description.
7. `users(id, username)` exists via versioned SQL migration.

## Product thinking

| Decision | Why |
|----------|-----|
| Ship bootstrap before full social-media modelling | Unblock iterative learning; modelling without a runnable DB is theater. |
| Health returns only `ok` / unavailable | Health is for liveness/orchestration, not debugging or secrets. |
| Separate `/schemas` introspection | Product/debug surface for “what’s in the DB?” without overloading health. |
| Mock LLM on table describe | Reserve the API shape for future AI-assisted schema explanations; avoid infinite v1. |
| Defer rich constraints on `users` | Today’s value is the pipeline; uniqueness/FKs/indexes are the next modelling sprint. |
| Makefile `down` vs `reset` | Make “keep data” the default; destruction must be explicit (`make reset`). |

## Engineering thinking

| Decision | Why |
|----------|-----|
| Two services: `db` + `app` | Matches production-ish topology; forces service DNS (`DATABASE_HOST=db`). |
| Named volume `pgdata` | Persist across container recreate; not a bind mount in the git tree. |
| Compose `pg_isready` + app TCP/SQL | Compose reduces race on first boot; app still owns end-to-end readiness + clear crash errors. |
| Tiny SQL migrator + `schema_migrations` | Source of truth for DDL without picking a heavy tool yet; swap-friendly later. |
| Env vars with defaults | One config shape for Compose and local `npm start`. |
| No credentials in `/health` | Settled after challenging the earlier “return URL” idea. |

### Settled calls (so we stop debating)

- **`down -v` removes volumes** — `make down` never uses `-v`; `make reset` does.
- **Retry backoff only at startup** for readiness; HTTP `/health` is a single attempt → 200/503 (fast signal).
- **Constraints on `users`:** only `SERIAL PRIMARY KEY` + `username TEXT NOT NULL` for sprint 001.

## AI usage this sprint

| Pattern | How we used it | Lesson |
|---------|----------------|--------|
| Socratic design review | Mentor challenged assumptions (volume flags, health vs schema, initdb vs migrations) before code | Prevented shipping inverted `down -v` persistence. |
| Time-box + settle | When debate fatigue hit, mentor made decisive defaults against objective done criteria | Iteration > perfect design on day 1. |
| Options with tradeoffs | Presented approaches (init scripts / startup DDL / migrations) with pros/cons | Faster decisions when choices are framed. |
| Implementation assist | Generated Compose/Makefile/app skeleton after scope locked | AI codes after humans lock contracts. |

**Improve next iteration:** Lead with “done criteria + defer list” in the first 5 minutes; challenge only decisions that would cause rework.

## What went well

- Corrected mental model of Compose volume lifecycle before it hit production-of-learning.
- Split health vs schema vs (future) LLM description cleanly.
- Migrations path set so modelling sprint can add tables without rewriting bootstrap.

## Gaps

- No real LLM provider; mock only.
- No auth on `/schemas` (fine locally; not production-safe).
- Minimal `users` model — not yet a social platform.
- No automated tests for endpoints.
- App `depends_on: service_healthy` + app TCP is slightly overlapping (acceptable for clarity).

## Pending next steps (Sprint 002+)

1. Data modelling from the article: posts, comments, follows, likes, DMs — with consistency notes.
2. Constraints/indexes justified by access patterns.
3. Optional: swap mock LLM for a real provider behind the same response shape.
4. ~~Capture a Cursor skill for “1h Product Engineer sprints”~~ → done: `.cursor/skills/product-engineer-sprint/`.

## How to run

```bash
make up
curl -s localhost:3000/health
curl -s localhost:3000/schemas
curl -s localhost:3000/schemas/users
make down    # keeps volume
make reset   # wipes DB volume
```
