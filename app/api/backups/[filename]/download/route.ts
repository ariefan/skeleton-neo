import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import * as fs from "fs/promises"
import * as path from "path"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ filename: string }> }
) {
	const session = await auth.api.getSession({ headers: req.headers })
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	try {
		const { filename } = await params

		// Security check: prevent path traversal attacks
		if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
			return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
		}

		// Additional check: only allow .zip files with expected naming pattern
		if (!filename.startsWith("backup-") || !filename.endsWith(".zip")) {
			return NextResponse.json({ error: "Invalid backup file" }, { status: 400 })
		}

		const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), "backups")
		const filePath = path.join(backupDir, filename)

		try {
			const fileBuffer = await fs.readFile(filePath)
			const stats = await fs.stat(filePath)

			return new NextResponse(fileBuffer, {
				headers: {
					"Content-Type": "application/zip",
					"Content-Length": stats.size.toString(),
					"Content-Disposition": `attachment; filename="${filename}"`,
					"Cache-Control": "private, max-age=0",
				},
			})
		} catch (e) {
			return NextResponse.json({ error: "Backup file not found" }, { status: 404 })
		}
	} catch (error) {
		return NextResponse.json({ error: "Internal error" }, { status: 500 })
	}
}
