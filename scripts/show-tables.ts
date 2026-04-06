import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/simpbb_neo",
});

const result = await pool.query(`
  SELECT tablename
  FROM pg_tables
  WHERE schemaname = 'public';
`);
console.log("Tables:", JSON.stringify(result.rows, null, 2));

// Also check for drizzle migration journal
const journalResult = await pool.query(
  "SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%drizzle%'"
);
console.log("Drizzle tables:", JSON.stringify(journalResult.rows, null, 2));

await pool.end();
