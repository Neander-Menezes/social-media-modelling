# Session knowledge — 001 Bootstrap

Reusable lessons from the first mentoring session. Not a sprint diary (see [../sprints/001-bootstrap.md](../sprints/001-bootstrap.md)); this is what to reuse next time you bootstrap a learning system or mentor yourself with AI.

## Anchor article

[PostgreSQL Deep Dive — Hello Interview](https://www.hellointerview.com/learn/system-design/deep-dives/postgres)

Use it as the *curriculum*, not as a checklist to implement in one sitting. Extract one vertical slice per sprint.

## Mental models corrected this session

| Wrong assumption | Correct model |
|------------------|---------------|
| `docker compose down -v` keeps data | `-v` **removes** volumes. Plain `down` keeps named volumes. |
| “Durable” = volume in the git repo | ACID durability ≠ container persistence. Prefer a **named volume**, not a bind-mounted data dir in source control. |
| Data modelling = starting Docker | Modelling = entities/relationships/constraints/consistency. Infra proves the model; it isn’t the model. |
| Health should return DB URL / full schema | Health = cheap liveness (`ok` / 503). Introspection = separate endpoint. Never echo credentials. |
| Port open ⇒ Postgres ready | Port can be up while DB still starting. Prove readiness with `pg_isready` and/or a real SQL query. |
| `docker-entrypoint-initdb.d` always runs | Init scripts run only when the data directory is **empty**. After a volume exists, they are skipped. Prefer versioned migrations for schema. |
| Dynamo-style “SK” on Postgres tables | Relational terms: PK, FK, unique constraints, indexes. |

## Architecture defaults that worked

- **Topology:** Compose `db` + `app`; app uses `DATABASE_HOST=db`.
- **Persistence:** named volume; `make down` (keep) vs `make reset` (`down -v`, wipe).
- **Readiness:** Compose healthcheck + app startup TCP → SQL with exponential backoff (~63s ceiling); HTTP `/health` is single-shot.
- **Schema source of truth:** numbered SQL files + `schema_migrations` table, applied on app boot.
- **API split:** `/health` vs `/schemas` vs `/schemas/:table` (+ mock LLM description).

## Product Engineer stance

Act as **both** product and engineer on every sprint:

1. **Product:** what user/developer outcome ships in ≤1h? what is explicitly deferred?
2. **Engineering:** what contract, failure mode, and verification prove it?
3. **AI usage:** which patterns helped, which wasted time, what to change next iteration?

## AI collaboration patterns (v1)

| Pattern | When | Rule |
|---------|------|------|
| Socratic challenge | Assumptions that would cause rework | Challenge without spoiling; force the learner to correct the model |
| Options + tradeoffs | Real forks (init scripts vs migrations, etc.) | Table of pros/cons/scenarios; pick one |
| Done criteria first | Start of every sprint | Lock “done when” + defer list in ~5 minutes |
| Time-box settle | Debate fatigue or diminishing returns | Mentor decides against objective criteria; ship |
| Implement after lock | Scope is consistent | AI writes code only after contracts are settled |
| Retro in-repo | End of sprint | Product + eng + AI patterns + gaps + next |

## Objective “good progress” bar

A sprint is shippable when:

1. Done criteria were written up front and checked off with evidence (commands/curl/logs).
2. At least one misconception was pressure-tested (or explicitly marked N/A).
3. Deferrals are listed so the next sprint has a clear backlog.
4. Docs updated: sprint note + this knowledge file if a reusable lesson emerged.

## Next knowledge to capture (Sprint 002+)

- Entity graph and consistency classes from the article (atomic DMs vs eventually consistent like counts).
- Index choices tied to access patterns (not “index everything”).
- When Postgres FTS/JSONB/PostGIS is enough vs specialized stores.
