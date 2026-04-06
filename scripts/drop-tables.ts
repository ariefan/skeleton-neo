import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/simpbb_neo",
});

const result = await pool.query(`
  SELECT tablename
  FROM pg_tables
  WHERE schemaname = 'public';
`);
console.log("Tables in database:", result.rows);

for (const row of result.rows) {
  if (row) {
      const tableName = row.tablename;
      await pool.query(`DROP TABLE "${tableName}" CASCADE`);
      console.log(`Dropped table: ${tableName}`);
  }
}

console.log("All tables dropped!");
await pool.end();
