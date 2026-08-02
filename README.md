# Social Media Modelling

A public learning journal: ramping up toward mid–senior engineering by building a social media data model on PostgreSQL — one focused sprint at a time.

This is not a polished product. It’s a lab notebook you can clone, run, argue with, and steal process from.

**Curriculum anchor:** [PostgreSQL Deep Dive (Hello Interview)](https://www.hellointerview.com/learn/system-design/deep-dives/postgres)

---

## What this repo is for

| Audience | How to use it |
|----------|----------------|
| **Me (Neander)** | Deliberate practice: Product Engineer sprints, Socratic design with AI, ship something real every hour-ish. |
| **Someone ramping the same way** | Follow the sprint notes + knowledge docs; reuse the Cursor skill; don’t copy the schema blindly — redo the thinking. |
| **Someone curious** | Read the journal. Steal the process (done criteria → challenge → settle → ship → retro). Ignore the code if you want. |

The motivating domain comes from the article: users, posts, comments, follows, likes, DMs — with mixed consistency needs and room to grow. We’re implementing that world **incrementally**, not as a big-bang schema dump.

---

## Journal

### 2026-08-02 — Sprint 001: Bootstrap

**Shipped:** Dockerized Postgres + Node API, named volume persistence, startup readiness (TCP → SQL with backoff), tiny SQL migrator, `users(id, username)`, and:

- `GET /health` → `ok` / `503`
- `GET /schemas` → table names + sizes
- `GET /schemas/:tableName` → catalog facts + **mock** LLM description

**Product stance:** Prove the pipe before modelling the social graph. Health stays dumb on purpose. Schema introspection is a separate surface. Constraints beyond “exists” wait for the modelling sprint.

**Lessons learned**

1. **`docker compose down -v` deletes volumes.** I had this backwards. Persistence = named volume + plain `down`. Wipe = explicit `make reset`.
2. **“Durable” is overloaded.** ACID durability ≠ “my container can restart.” Don’t bind-mount Postgres data into the git tree “for durability.”
3. **Port open ≠ Postgres ready.** Readiness needs `pg_isready` and/or a real query.
4. **Init scripts lie after day one.** `docker-entrypoint-initdb.d` only runs on an empty data directory. Versioned migrations are the schema source of truth.
5. **Health must not leak credentials.** Returning a connection URL from `/health` felt convenient; it’s a footgun.
6. **Socratic mentoring has a half-life.** Challenge hard until the model is sharp, then **settle and ship**. Endless debate is not mid-senior behavior either.
7. **AI is a process partner, not an oracle.** Best pattern today: lock done criteria → options/tradeoffs → implement → retro (product + eng + AI usage) in-repo.

**Where it went well:** Corrected volume/readiness mental models *before* they became production-of-learning bugs. Left a migrator so Sprint 002 can add tables without rewriting bootstrap.

**Gaps / next:** Full social graph modelling, indexes tied to access patterns, real LLM behind the describe endpoint (optional), tests.

**Write-ups**

- [Sprint note](docs/sprints/001-bootstrap.md)
- [Reusable session knowledge](docs/knowledge/001-bootstrap-session.md)
- [Cursor skill: product-engineer-sprint](.cursor/skills/product-engineer-sprint/SKILL.md)

---

## How we work (steal this)

~1 hour Product Engineer sprints:

1. **Done criteria + defer list** in the first ~5 minutes.
2. **Challenge assumptions** that would cause rework (Socratic — no free answers while the model is mushy).
3. **Options with tradeoffs** when there’s a real fork.
4. **Time-box settle** when debate fatigues — pick against the done criteria and implement.
5. **Document** product thinking, engineering thinking, AI usage patterns, gaps, next steps.
6. Promote anything reusable into `docs/knowledge/`.

Objective bar for “good progress”: criteria checked with evidence, at least one assumption pressure-tested, deferrals listed, docs updated.

---

## Quick start

Needs Docker + Make.

```bash
make up

curl -s localhost:3000/health
curl -s localhost:3000/schemas
curl -s localhost:3000/schemas/users

make down    # keeps DB volume
make reset   # wipes DB volume (destructive)
```

Env defaults match Compose; see `.env.example`.

---

## Layout

```
├── src/                 # Node API (Express + pg)
├── migrations/          # Versioned SQL (source of truth for schema)
├── docs/sprints/        # Per-sprint journal (product + eng + AI)
├── docs/knowledge/      # Lessons that outlive a single sprint
├── .cursor/skills/      # Process skill for repeating this workflow
├── docker-compose.yml
└── Makefile
```

---

## Status

**Now:** Bootstrap works; modelling from the article is next.

**Not yet:** A production social network. That’s fine — the point is the reps.
