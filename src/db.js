const net = require("net");
const { Pool } = require("pg");
const { config } = require("./config");

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkTcp(host, port, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const onError = (err) => {
      socket.destroy();
      reject(err);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => {
      socket.end();
      resolve();
    });
    socket.once("timeout", () => onError(new Error(`TCP timeout to ${host}:${port}`)));
    socket.once("error", onError);
  });
}

async function queryReady() {
  const result = await pool.query("SELECT 1 AS ok");
  return result.rows[0].ok === 1;
}

async function withBackoff(label, fn) {
  const delays = config.readiness.delaysMs;
  let lastError;

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    try {
      await fn();
      console.log(`[readiness] ${label} succeeded on attempt ${attempt + 1}`);
      return;
    } catch (err) {
      lastError = err;
      const waitMs = delays[attempt];
      console.warn(
        `[readiness] ${label} failed (attempt ${attempt + 1}/${delays.length}): ${err.message}. retry in ${waitMs}ms`
      );
      await sleep(waitMs);
    }
  }

  throw new Error(
    `[readiness] ${label} failed after ${delays.length} attempts (~63s). Last error: ${lastError.message}`
  );
}

async function waitUntilReady() {
  const { host, port } = config.database;
  await withBackoff("tcp", () => checkTcp(host, port));
  await withBackoff("sql", () => queryReady());
}

module.exports = {
  pool,
  checkTcp,
  queryReady,
  waitUntilReady,
};
