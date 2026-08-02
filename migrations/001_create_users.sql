-- Sprint 001: minimal users table. Constraints deferred to data-modelling sprint.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL
);
