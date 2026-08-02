# Social Media Modelling

**Public practice lab:** system-design-grade PostgreSQL modelling for a social platform — shipped in short Product Engineer sprints, with the decisions written down.

Built by [Neander Menezes](https://github.com/Neander-Menezes) while leveling judgment on data modelling, consistency tradeoffs, and AI-assisted delivery.

| Signal | Detail |
|--------|--------|
| **Focus** | PostgreSQL · data modelling · system design · Node/Express |
| **Method** | ~1h sprints · done criteria first · challenge → settle → ship · public retros |
| **Curriculum** | [Hello Interview — PostgreSQL deep dive](https://www.hellointerview.com/learn/system-design/deep-dives/postgres) |
| **Status** | ✅ Bootstrap API + DB · 🔜 social graph schema (posts, comments, follows, likes, DMs) |

> Not a demo CRUD app. A **decision journal with runnable code** — useful if you’re hiring for how someone thinks, or if you’re an engineer who learns by reading tradeoffs.

---

## For recruiters (60 seconds)

- **What it shows:** intentional practice on interview-relevant Postgres design (relationships, integrity, readiness, migrations), not tutorial copy-paste.
- **How work gets done:** Product + engineering in the same loop — scope, tradeoffs, ship, retro.
- **What’s documented:** each sprint’s product calls, engineering calls, lessons, and AI usage patterns (see Journal / `docs/`).
- **Stack today:** Docker Compose · PostgreSQL 16 · Node.js · Express · versioned SQL migrations.

Deep dives live in collapsible journal entries and [`docs/sprints/`](docs/sprints/).

---

## For engineers who peek

Expect:

- Named-volume persistence done correctly (`down` vs `down -v`)
- Startup readiness: TCP → SQL with backoff (port-open ≠ ready)
- Tiny migrator + `schema_migrations` as DDL source of truth
- `/health` as liveness only (no credential leakage)
- `/schemas` introspection + mock LLM table descriptions (API shape reserved for a real provider later)

Steal the process skill: [`.cursor/skills/product-engineer-sprint/`](.cursor/skills/product-engineer-sprint/SKILL.md).

---

## Quick start

```bash
make up
curl -s localhost:3000/health
curl -s localhost:3000/schemas/users
make down    # keep data
make reset   # wipe data
```

Docker + Make. Defaults in `.env.example`.

---

## Journal

<details>
<summary><strong>2026-08-02 — Sprint 001: Bootstrap</strong> · runnable pipe + <code>users</code></summary>

<br>

**Shipped:** Compose (Postgres + Node), named volume, TCP→SQL readiness, SQL migrator, `users(id, username)`.

| Endpoint | Behavior |
|----------|----------|
| `GET /health` | `ok` / `503` |
| `GET /schemas` | table names + sizes |
| `GET /schemas/:table` | catalog + mock LLM blurb |

**Lessons**

1. `compose down -v` **removes** volumes — persistence is plain `down` + named volume.
2. ACID durability ≠ container restart survival; don’t bind-mount PG data into git.
3. Port open ≠ Postgres ready — use `pg_isready` / a real query.
4. `initdb.d` only runs on empty data dirs → versioned migrations own schema.
5. Never put connection URLs in `/health`.
6. Socratic debate has a half-life: challenge, then settle and ship.
7. AI pattern that worked: lock criteria → tradeoffs → implement → in-repo retro.

**Next:** social graph modelling, access-pattern indexes, optional real LLM, tests.

**Docs:** [sprint](docs/sprints/001-bootstrap.md) · [knowledge](docs/knowledge/001-bootstrap-session.md) · [skill](.cursor/skills/product-engineer-sprint/SKILL.md)

</details>

<!-- Newest journal entry on top. -->

---

<details>
<summary><strong>How sprints work</strong></summary>

<br>

1. Done criteria + defer list (~5 min).
2. Challenge assumptions that would cause rework.
3. Options + tradeoffs on real forks.
4. Time-box settle → implement.
5. Retro: product + eng + AI → `docs/sprints/`; lasting lessons → `docs/knowledge/`.

**Bar for “shipped”:** criteria proven with evidence · ≥1 assumption tested · deferrals listed · docs updated.

</details>

<details>
<summary><strong>Repo layout</strong></summary>

<br>

```
src/            Node API
migrations/     versioned SQL
docs/sprints/   per-sprint journal
docs/knowledge/ lasting lessons
.cursor/skills/ repeatable process
```

</details>
