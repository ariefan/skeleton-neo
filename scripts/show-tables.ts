import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "simpbb_neo",
});

const [tables] = await conn.query("SHOW TABLES");
console.log("Tables:", JSON.stringify(tables, null, 2));

// Also check for drizzle migration journal
const [journal] = await conn.query(
  "SELECT * FROM information_schema.tables WHERE table_schema = 'simpbb_neo' AND table_name LIKE '%drizzle%'"
);
console.log("Drizzle tables:", JSON.stringify(journal, null, 2));

await conn.end();
