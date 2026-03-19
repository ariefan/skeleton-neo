/**
 * Backup Runner - Cron Daemon
 *
 * Runs automated daily backups at 2 AM using node-cron.
 *
 * To run directly:
 *   npm run backup:daemon
 *
 * To run with PM2 (production):
 *   pm2 start npm --name "backup-service" -- run backup:daemon
 *   pm2 save
 *   pm2 startup
 */

import { config as dotenvConfig } from "dotenv"
import cron from "node-cron"
import { performBackup } from "../lib/services/backup.js"

// Load environment variables
const result = dotenvConfig({ path: ".env.local" })
if (result.error) {
	// Ignore if file doesn't exist
}

/**
 * Logger with timestamp.
 */
function log(message: string): void {
	const timestamp = new Date().toISOString()
	console.log(`[${timestamp}] ${message}`)
}

/**
 * Main backup job handler.
 */
async function runBackupJob(): Promise<void> {
	log("========================================")
	log("Starting scheduled backup...")
	log("========================================")

	const result = await performBackup({
		onProgress: (message) => log(message),
	})

	if (result.success) {
		log(`✓ Backup succeeded: ${result.backupPath}`)
		if (result.size) {
			log(`  Size: ${formatBytes(result.size)}`)
		}
		if (result.duration) {
			log(`  Duration: ${(result.duration / 1000).toFixed(2)}s`)
		}
	} else {
		log(`✗ Backup failed: ${result.error || "Unknown error"}`)
	}

	log("========================================")
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
 * Initialize and start the cron daemon.
 */
function startDaemon(): void {
	// Check if backup is enabled
	if (process.env.BACKUP_ENABLED === "false") {
		log("Backup is disabled (BACKUP_ENABLED=false). Daemon will not start.")
		process.exit(0)
		return
	}

	// Validate DATABASE_URL
	if (!process.env.DATABASE_URL) {
		log("ERROR: DATABASE_URL is not set!")
		process.exit(1)
		return
	}

	// Schedule: Run at 2:00 AM every day
	// Cron format: minute hour day month weekday
	// '0 2 * * *' = 2:00 AM daily
	const schedulePattern = process.env.BACKUP_SCHEDULE || "0 2 * * *"

	log("========================================")
	log("Backup Daemon Started")
	log("========================================")
	log(`Schedule: ${schedulePattern} (2:00 AM daily)`)
	log(`Retention: ${process.env.BACKUP_RETENTION_DAYS || 30} days`)
	log(`Backup Dir: ${process.env.BACKUP_DIR || "./backups"}`)
	log("========================================")
	log("Press Ctrl+C to stop")
	log("========================================")

	// Schedule the backup job
	const task = cron.schedule(schedulePattern, async () => {
		try {
			await runBackupJob()
		} catch (error) {
			log(`ERROR in scheduled job: ${error instanceof Error ? error.message : String(error)}`)
		}
	}, {
		timezone: process.env.TZ || "UTC",
	})

	// Optionally run an initial backup on startup
	if (process.env.BACKUP_RUN_ON_START === "true") {
		log("Running initial backup on startup...")
		runBackupJob().catch((error) => {
			log(`ERROR in initial backup: ${error instanceof Error ? error.message : String(error)}`)
		})
	}

	// Handle graceful shutdown
	process.on("SIGINT", () => {
		log("\nReceived SIGINT, stopping backup daemon...")
		task.stop()
		process.exit(0)
	})

	process.on("SIGTERM", () => {
		log("\nReceived SIGTERM, stopping backup daemon...")
		task.stop()
		process.exit(0)
	})
}

// Start the daemon
startDaemon()
