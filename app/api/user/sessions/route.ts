import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/user/sessions
 *
 * Fetch all sessions for the currently authenticated user.
 */
export async function GET(request: NextRequest) {
	try {
		// Get the current session
		const authSession = await auth.api.getSession({
			headers: request.headers,
		});

		if (!authSession?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Fetch all sessions for this user
		const userSessions = await db
			.select()
			.from(session)
			.where(eq(session.userId, authSession.user.id));

		// Get the token from the current session to mark it as current
		const currentSessionToken = authSession.session.token;

		// Transform and return sessions
		const sessions = userSessions.map((s) => ({
			id: s.id,
			token: s.token,
			createdAt: s.createdAt,
			updatedAt: s.updatedAt,
			expiresAt: s.expiresAt,
			ipAddress: s.ipAddress,
			userAgent: s.userAgent,
			isCurrent: s.token === currentSessionToken,
		}));

		return NextResponse.json(sessions);
	} catch (error) {
		console.error("[Sessions API] Error fetching sessions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch sessions" },
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/user/sessions?id=<session-id>
 *
 * Revoke a specific session.
 */
export async function DELETE(request: NextRequest) {
	try {
		// Get the current session
		const authSession = await auth.api.getSession({
			headers: request.headers,
		});

		if (!authSession?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get the session ID to revoke from query params
		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get("id");

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 }
			);
		}

		// Don't allow revoking the current session
		if (sessionId === authSession.session.id) {
			return NextResponse.json(
				{ error: "Cannot revoke current session" },
				{ status: 400 }
			);
		}

		// Verify the session belongs to the current user
		const sessions = await db
			.select()
			.from(session)
			.where(eq(session.userId, authSession.user.id));

		const targetSession = sessions.find((s) => s.id === sessionId);

		if (!targetSession) {
			return NextResponse.json(
				{ error: "Session not found" },
				{ status: 404 }
			);
		}

		// Delete the session
		await db.delete(session).where(eq(session.id, sessionId));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Sessions API] Error revoking session:", error);
		return NextResponse.json(
			{ error: "Failed to revoke session" },
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/user/sessions/all
 *
 * Revoke all sessions except the current one.
 */
export async function PATCH(request: NextRequest) {
	try {
		// Get the current session
		const authSession = await auth.api.getSession({
			headers: request.headers,
		});

		if (!authSession?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Fetch all sessions for this user
		const userSessions = await db
			.select()
			.from(session)
			.where(eq(session.userId, authSession.user.id));

		// Delete all sessions except the current one
		for (const s of userSessions) {
			if (s.id !== authSession.session.id) {
				await db.delete(session).where(eq(session.id, s.id));
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Sessions API] Error revoking all sessions:", error);
		return NextResponse.json(
			{ error: "Failed to revoke sessions" },
			{ status: 500 }
		);
	}
}
