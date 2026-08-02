function env(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return fallback;
  }
  return value;
}

const config = {
  port: Number(env("PORT", "3000")),
  database: {
    host: env("DATABASE_HOST", "localhost"),
    port: Number(env("DATABASE_PORT", "5432")),
    name: env("DATABASE_NAME", "social_media"),
    user: env("DATABASE_USER", "postgres"),
    password: env("DATABASE_PASSWORD", "postgres"),
  },
  readiness: {
    delaysMs: [1000, 2000, 4000, 8000, 16000, 32000],
  },
};

module.exports = { config };
