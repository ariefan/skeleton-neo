import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";

// Plugin imports - importing from better-auth/plugins
import {
	twoFactor,
	username,
	phoneNumber,
	emailOTP,
	admin,
	mcp,
	organization,
	captcha,
	openAPI,
	lastLoginMethod,
	magicLink,
	anonymous,
	bearer,
} from "better-auth/plugins";

// Import external services
import {
	sendPasswordResetEmail,
	sendEmailVerification,
	sendTwoFactorOTP,
	sendEmailOTP,
	sendMagicLink,
} from "../services/email";
import {
	sendPhoneVerificationOTP,
	sendPhoneLoginOTP,
} from "../services/sms";

/**
 * Better Auth Configuration
 *
 * This file configures Better Auth with all 13 plugins and external service integrations.
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "mysql",
		schema,
	}),

	// Advanced email/password with rate limiting and email verification
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
			await sendPasswordResetEmail(user.email, url, user.name);
		},
		sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
			await sendEmailVerification(user.email, url, user.name);
		},
	},

	// Social providers
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			enabled: !!process.env.GOOGLE_CLIENT_ID,
		},
	},

	// Rate limiting to prevent abuse
	rateLimit: {
		window: 10, // 10 seconds
		max: 5, // 5 requests per window
	},

	plugins: [
		// 1. Two-Factor Authentication - TOTP authenticator + OTP backup codes
		twoFactor({
			issuer: "SimpBB Neo",
			totpOptions: {
				digits: 6,
				period: 30,
			},
			otpOptions: {
				sendOTP: async ({ user, otp }) => {
					await sendTwoFactorOTP(user.email, otp, 5);
				},
				period: 5, // 5 minutes
				digits: 6,
			},
			backupCodeOptions: {
				amount: 10,
				length: 10,
			},
		}),

		// 2. Username - Username-based login
		(username as any)({
			minLength: 3,
			maxLength: 20,
			unique: true,
		}),

		// 3. Phone Number - Phone number authentication
		(phoneNumber as any)({
			minLength: 10,
			maxLength: 15,
			unique: true,
			// Send SMS OTP using our SMS service
			sendSMS: async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
				await sendPhoneVerificationOTP(phoneNumber, otp, 5);
			},
			maxAttempts: 3,
		}),

		// 4. Email OTP - Email OTP login/verification
		(emailOTP as any)({
			sendVerificationEmail: async ({ user, otp }: { user: any; otp: string }) => {
				await sendEmailOTP(user.email, otp, 5);
			},
			maxAttempts: 5,
			expiresIn: 300, // 5 minutes
		}),

		// NOTE: passkey plugin does NOT exist in better-auth v1.5.5
		// Uncomment when upgrading to a version that supports it
		// passkey({
		// 	rp: {
		// 		name: "SimpBB Neo",
		// 		id: process.env.PASSKEY_ID || "localhost",
		// 	},
		// 	origin: process.env.BETTER_AUTH_URL || "http://localhost:3000",
		// }),

		// 5. Admin - Admin panel and user management
		(admin as any)({
			adminRole: "admin",
			defaultAdmin: {
				email: process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com",
				password: process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!",
				name: "Default Admin",
			},
		}),

		// NOTE: apiKey plugin does NOT exist in better-auth v1.5.5
		// Use bearer token authentication instead

		// 6. MCP - Model Context Protocol integration
		(mcp as any)({
			enabled: true,
		}),

		// 7. Organization - Multi-tenant org/team management
		(organization as any)({
			allowUserToCreateOrganization: true,
			organizationLimit: 5,
			membershipLimit: 100,
			teams: {
				enabled: true,
				maxTeamsPerOrganization: 20,
			},
			roles: ["owner", "admin", "member", "viewer", "guest"],
		}),

		// 8. Captcha - Bot protection (reCAPTCHA/hCaptcha/Cloudflare)
		(captcha as any)({
			provider: "google-recaptcha",
			siteKey: process.env.RECAPTCHA_SITE_KEY || "",
			secretKey: process.env.RECAPTCHA_SECRET_KEY || "",
			skipIfSecretKeyNotConfigured: true,
		}),

		// 9. OpenAPI - API documentation
		(openAPI as any)({
			endpoint: "/api/auth/openapi",
			info: {
				title: "SimpBB Neo Auth API",
				description: "Authentication and authorization API",
				version: "1.0.0",
			},
		}),

		// NOTE: i18n plugin does NOT exist in better-auth v1.5.5
		// Internationalization should be handled at the UI level

		// 10. Last Login Method - Track how users logged in
		lastLoginMethod(),

		// 11. Magic Link - Passwordless login via email link
		(magicLink as any)({
			sendMagicLink: async ({ user, url }: { user: any; url: string }) => {
				await sendMagicLink(user.email, url, user.name);
			},
			expiresIn: 60 * 60 * 24, // 24 hours
			maxAttempts: 3,
		}),

		// 12. Anonymous - Allow anonymous users with temporary sessions
		(anonymous as any)({
			convertAnonymousAccounts: true,
		}),

		// 13. Bearer - API bearer token authentication
		(bearer as any)({
			issuer: "SimpBB Neo",
			expiresIn: 60 * 60 * 24 * 30, // 30 days
		}),
	],

	// Base URL for authentication endpoints
	baseURL: process.env.BETTER_AUTH_URL,

	// Secret for signing tokens and sessions
	secret: process.env.BETTER_AUTH_SECRET || "",

	// Session configuration
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 5, // 5 seconds
		},
	},

	// Advanced security options
	advanced: {
		csrf: {
			enabled: true,
		},
		useSecureCookies: process.env.NODE_ENV === "production",
		cookiePrefix: "simpbb",
	},
});
