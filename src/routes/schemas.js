const express = require("express");
const { pool } = require("../db");
const { describeTableMock } = require("../llm/mock");

const router = express.Router();

async function listTables() {
  const result = await pool.query(`
    SELECT
      c.relname AS name,
      pg_total_relation_size(c.oid) AS size_bytes
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = 'public'
      AND c.relname <> 'schema_migrations'
    ORDER BY c.relname
  `);

  return result.rows.map((row) => ({
    name: row.name,
    sizeBytes: Number(row.size_bytes),
  }));
}

async function tableExists(tableName) {
  const result = await pool.query(
    `
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname = 'public'
        AND c.relname = $1
    `,
    [tableName]
  );
  return result.rowCount > 0;
}

async function describeTable(tableName) {
  const columnsResult = await pool.query(
    `
      SELECT
        a.attname AS name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
        NOT a.attnotnull AS is_nullable
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = $1
        AND n.nspname = 'public'
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum
    `,
    [tableName]
  );

  const pkResult = await pool.query(
    `
      SELECT a.attname AS name
      FROM pg_index i
      JOIN pg_class c ON c.oid = i.indrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY (i.indkey)
      WHERE c.relname = $1
        AND n.nspname = 'public'
        AND i.indisprimary
      ORDER BY a.attnum
    `,
    [tableName]
  );

  const indexesResult = await pool.query(
    `
      SELECT
        i.relname AS name,
        ix.indisunique AS is_unique,
        ix.indisprimary AS is_primary
      FROM pg_index ix
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE t.relname = $1
        AND n.nspname = 'public'
      ORDER BY i.relname
    `,
    [tableName]
  );

  const sizeResult = await pool.query(
    `
      SELECT
        pg_total_relation_size(c.oid) AS size_bytes,
        COALESCE(c.reltuples, 0)::bigint AS row_estimate
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = $1
        AND n.nspname = 'public'
    `,
    [tableName]
  );

  return {
    name: tableName,
    columns: columnsResult.rows.map((row) => ({
      name: row.name,
      dataType: row.data_type,
      isNullable: row.is_nullable,
    })),
    primaryKey: pkResult.rows.map((row) => row.name),
    indexes: indexesResult.rows.map((row) => ({
      name: row.name,
      isUnique: row.is_unique,
      isPrimary: row.is_primary,
    })),
    sizeBytes: Number(sizeResult.rows[0]?.size_bytes ?? 0),
    // pg reports -1 when reltuples has never been analyzed
    rowEstimate: Math.max(0, Number(sizeResult.rows[0]?.row_estimate ?? 0)),
  };
}

router.get("/schemas", async (_req, res) => {
  try {
    const tables = await listTables();
    if (tables.length === 0) {
      return res.status(200).json({ tables: [] });
    }
    return res.status(200).json({ tables });
  } catch (err) {
    return res.status(503).json({
      error: "Could not list schemas",
      detail: err.message,
    });
  }
});

router.get("/schemas/:tableName", async (req, res) => {
  const { tableName } = req.params;

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  try {
    const exists = await tableExists(tableName);
    if (!exists) {
      return res.status(404).json({ error: `Table "${tableName}" not found` });
    }

    const table = await describeTable(tableName);
    const description = describeTableMock({
      tableName: table.name,
      columns: table.columns,
      primaryKey: table.primaryKey,
      indexes: table.indexes,
      rowEstimate: table.rowEstimate < 0 ? 0 : table.rowEstimate,
    });

    return res.status(200).json({
      status: "ok",
      table,
      description,
    });
  } catch (err) {
    return res.status(503).json({
      error: "Could not describe table",
      detail: err.message,
    });
  }
});

module.exports = router;
