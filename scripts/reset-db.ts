import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL?.replace(/\/simpbb_neo$/, "/postgres") || "postgresql://postgres:postgres@localhost:5432/postgres",
});

try {
  await pool.query("DROP DATABASE IF EXISTS simpbb_neo");
  await pool.query("CREATE DATABASE simpbb_neo");
  console.log("✅ Database dropped and recreated successfully!");
} catch (error) {
  console.error("Error resetting database:", error);
}

await pool.end();
