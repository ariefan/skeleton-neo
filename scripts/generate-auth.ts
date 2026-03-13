import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";

/**
 * Better Auth Schema Generator Script
 *
 * This script generates the auth schema using Better Auth CLI.
 * It reads the auth configuration and outputs the complete schema
 * including all plugin tables.
 */

const AUTH_SCHEMA_PATH = path.join(process.cwd(), "lib/db/schema/auth.ts");
const SCHEMA_DIR = path.dirname(AUTH_SCHEMA_PATH);

console.log("🔐 Generating Better Auth schema...");

// Ensure schema directory exists
if (!existsSync(SCHEMA_DIR)) {
	mkdirSync(SCHEMA_DIR, { recursive: true });
	console.log(`📁 Created schema directory: ${SCHEMA_DIR}`);
}

try {
	// Generate schema using Better Auth CLI
	// The CLI reads the config from lib/auth/index.ts by default
	const command =
		"npx @better-auth/cli@latest generate --output lib/db/schema/auth.ts --config lib/auth/index.ts --yes";

	console.log(`🔨 Running: ${command}`);
	execSync(command, {
		stdio: "inherit",
		cwd: process.cwd(),
	});

	console.log("\n✅ Auth schema generated successfully!");
	console.log(`📄 Schema saved to: ${AUTH_SCHEMA_PATH}`);
	console.log("\n⚠️  Don't forget to run:");
	console.log("   npm run db:generate  # Generate Drizzle migrations");
	console.log("   npm run db:push      # Push to database");
} catch (error) {
	console.error("\n❌ Failed to generate auth schema:", error);
	console.error("\n💡 Troubleshooting:");
	console.error("   1. Ensure lib/auth/index.ts exists and is valid");
	console.error("   2. Check that all Better Auth plugins are correctly imported");
	console.error("   3. Verify the database connection in lib/db/index.ts");
	process.exit(1);
}
