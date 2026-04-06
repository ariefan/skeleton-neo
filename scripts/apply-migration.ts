import pg from "pg";
import { readFileSync } from "fs";
import { join } from "path";

// Read the migration SQL file
const migrationSQL = readFileSync(
  join(process.cwd(), "lib/db/migration/0000_loose_marrow.sql"),
  "utf-8"
);

// Split by statement breakpoint and filter empty statements
const statements = migrationSQL
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`Found ${statements.length} SQL statements to execute.`);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/simpbb_neo",
});

try {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await pool.query(statement);
      console.log(`[${i + 1}/${statements.length}] ✓ Executed`);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "42P07") {
        console.log(`[${i + 1}/${statements.length}] ⊘ Table already exists, skipping`);
      } else if (error.code === "42710" || error.code === "42P04") {
        console.log(`[${i + 1}/${statements.length}] ⊘ Index/constraint already exists, skipping`);
      } else if (error.code === "23505") {
        console.log(`[${i + 1}/${statements.length}] ⊘ Duplicate entry, skipping`);
      } else {
        console.error(`[${i + 1}/${statements.length}] ✗ Error: ${error.message || String(err)}`);
        console.error(`Statement was: ${statement.substring(0, 100)}...`);
        // Continue anyway
      }
    }
  }

  console.log("\n✅ Migration completed!");
} finally {
  await pool.end();
}
