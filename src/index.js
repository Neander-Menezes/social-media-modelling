const express = require("express");
const { config } = require("./config");
const { waitUntilReady, pool } = require("./db");
const { runMigrations } = require("./migrate");
const healthRouter = require("./routes/health");
const schemasRouter = require("./routes/schemas");

async function main() {
  console.log("[boot] waiting for postgres readiness (tcp then sql)...");
  await waitUntilReady();

  console.log("[boot] running migrations...");
  await runMigrations();

  const app = express();
  app.use(healthRouter);
  app.use(schemasRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  const server = app.listen(config.port, () => {
    console.log(`[boot] listening on :${config.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`[boot] ${signal} received, shutting down...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error(`[boot] fatal: ${err.message}`);
  process.exit(1);
});
