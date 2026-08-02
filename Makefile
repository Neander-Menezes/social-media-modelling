.PHONY: up down reset logs ps migrate

up:
	docker compose up --build -d

down:
	docker compose down

# Destructive: removes the named volume (DB state). Use when you want a clean slate.
reset:
	docker compose down -v

logs:
	docker compose logs -f

ps:
	docker compose ps

# Re-run app container entrypoint (migrations run on startup).
migrate:
	docker compose up --build -d app
