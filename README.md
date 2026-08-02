# Social Media Modelling

Lab notebook for ramping to mid–senior eng: PostgreSQL data modelling for a social platform, one ~1h Product Engineer sprint at a time.

Clone it, run it, steal the process — or just skim the journal.

| | |
|---|---|
| **Curriculum** | [Hello Interview — PostgreSQL](https://www.hellointerview.com/learn/system-design/deep-dives/postgres) |
| **Now** | Bootstrap shipped · modelling next |
| **Process** | Done criteria → challenge → settle → ship → retro |

---

## Quick start

```bash
make up
curl -s localhost:3000/health
curl -s localhost:3000/schemas/users
make down    # keep data
make reset   # wipe data
```

Needs Docker + Make. Defaults in `.env.example`.

---

## Journal

<details>
<summary><strong>2026-08-02 — Sprint 001: Bootstrap</strong> · pipe + tiny <code>users</code> table</summary>

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

<!-- New entries: copy a <details> block above; newest on top. -->

---

<details>
<summary><strong>How we work</strong> · steal the sprint loop</summary>

<br>

1. Done criteria + defer list (~5 min).
2. Challenge assumptions that would cause rework.
3. Options + tradeoffs on real forks.
4. Time-box settle → implement.
5. Retro: product + eng + AI patterns → `docs/sprints/`, promote reuse to `docs/knowledge/`.

**Good progress:** criteria proven with evidence · ≥1 assumption tested · deferrals listed · docs updated.

</details>

<details>
<summary><strong>Who this is for</strong></summary>

<br>

| You | Do this |
|-----|---------|
| Me | Deliberate PE sprints with AI as mentor/partner. |
| Ramping the same way | Redo the thinking; don’t paste the schema. |
| Curious | Skim journal + process; code optional. |

Domain from the article (users, posts, comments, follows, likes, DMs) — built **incrementally**, not big-bang.

</details>

<details>
<summary><strong>Layout</strong></summary>

<br>

```
src/            Node API
migrations/     versioned SQL
docs/sprints/   per-sprint journal
docs/knowledge/ lasting lessons
.cursor/skills/ repeatable process
```

</details>
