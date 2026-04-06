/**
 * Manual Backup Trigger
 *
 * Run a backup immediately without waiting for the scheduled cron job.
 * Useful for testing and on-demand backups.
 *
 * Usage:
 *   npm run backup:now
 *
 * Options (environment variables):
 *   BACKUP_ENABLED=true|false     - Enable/disable backup (default: true)
 *   BACKUP_RETENTION_DAYS=30      - Days to keep backups (default: 30)
 *   BACKUP_DIR=./backups          - Backup directory (default: ./backups)
 *   PGDUMP_PATH=/path/to/pg_dump - Path to pg_dump binary
 */

import { config as dotenvConfig } from "dotenv"
import { performBackup, listBackups } from "../lib/services/backup.js"

// Load environment variables
const result = dotenvConfig({ path: ".env.local" })
if (result.error) {
	// Ignore if file doesn't exist
}

/**
 * Format bytes to human-readable string.
 */
function formatBytes(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"]
	let size = bytes
	let unitIndex = 0

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024
		unitIndex++
	}

	return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * Main execution.
 */
async function main(): Promise<void> {
	console.log("========================================")
	console.log("Manual Backup Trigger")
	console.log("========================================")

	// Check if backup is enabled
	if (process.env.BACKUP_ENABLED === "false") {
		console.log("⚠ Backup is disabled (BACKUP_ENABLED=false)")
		console.log("Set BACKUP_ENABLED=true to enable backups.")
		process.exit(1)
		return
	}

	// Validate DATABASE_URL
	if (!process.env.DATABASE_URL) {
		console.log("✗ ERROR: DATABASE_URL is not set!")
		console.log("Please set DATABASE_URL in your .env.local file.")
		process.exit(1)
		return
	}

	// Show existing backups
	const backupDir = process.env.BACKUP_DIR || "./backups"
	console.log(`Backup Directory: ${backupDir}`)

	const existingBackups = await listBackups(backupDir)
	console.log(`Existing backups: ${existingBackups.length}`)

	for (const backup of existingBackups.slice(0, 5)) {
		console.log(
			`  - ${backup.name} (${formatBytes(backup.size)}, ${backup.createdAt.toISOString()})`
		)
	}

	if (existingBackups.length > 5) {
		console.log(`  ... and ${existingBackups.length - 5} more`)
	}

	console.log("========================================")

	// Perform the backup
	const result = await performBackup({
		onProgress: (message) => console.log(message),
	})

	// Show result
	console.log("========================================")
	if (result.success) {
		console.log("✓ Backup completed successfully!")
		console.log(`  File: ${result.backupPath}`)
		if (result.size) {
			console.log(`  Size: ${formatBytes(result.size)}`)
		}
		if (result.duration) {
			console.log(`  Duration: ${(result.duration / 1000).toFixed(2)}s`)
		}
		console.log("========================================")
		process.exit(0)
	} else {
		console.log("✗ Backup failed!")
		console.log(`  Error: ${result.error || "Unknown error"}`)
		console.log("========================================")
		process.exit(1)
	}
}

main().catch((error) => {
	console.error("Fatal error:", error)
	process.exit(1)
})
