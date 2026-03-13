/**
 * Email Service Configuration
 * Handles email sending via Resend (https://resend.com)
 */

export interface EmailOptions {
	to: string;
	subject: string;
	html?: string;
	text?: string;
	from?: string;
	replyTo?: string;
}

/**
 * Get the configured sender email address
 */
export function getSenderEmail(): string {
	return (
		process.env.RESEND_FROM ||
		process.env.EMAIL_FROM ||
		"noreply@localhost"
	);
}

/**
 * Send an email using Resend API
 */
export async function sendEmail({
	to,
	subject,
	html,
	text,
	from,
	replyTo,
}: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
	const apiKey = process.env.RESEND_API_KEY;

	if (!apiKey) {
		console.warn("[Email] RESEND_API_KEY not configured - skipping email send");
		console.warn(`[Email] Would send to: ${to} | Subject: ${subject}`);
		// For development, return success without actually sending
		if (process.env.NODE_ENV === "development") {
			return { success: true };
		}
		return {
			success: false,
			error: "Email service not configured. Set RESEND_API_KEY environment variable.",
		};
	}

	try {
		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: from || getSenderEmail(),
				to,
				subject,
				html: html || text, // Resend uses html field, falls back to text
				text: text,
				replyTo: replyTo || undefined,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error("[Email] Failed to send email:", errorData);
			return {
				success: false,
				error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
			};
		}

		const data = await response.json();
		console.log("[Email] Email sent successfully:", data);

		return {
			success: true,
			messageId: data.id,
		};
	} catch (error) {
		console.error("[Email] Error sending email:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Email templates
 */
export const emailTemplates = {
	/**
	 * Password reset email
	 */
	passwordReset: (resetUrl: string, userName?: string) => ({
		subject: "Reset your password",
		html: `
			<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Password Reset Request</h2>
				${userName ? `<p>Hi ${userName},</p>` : "<p>Hi,</p>"}
				<p>We received a request to reset your password. Click the link below to create a new password:</p>
				<p>
					<a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px;">
						Reset Password
					</a>
				</p>
				<p>Or copy and paste this link into your browser:</p>
				<p style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all;">
					${resetUrl}
				</p>
				<p>This link will expire in 1 hour.</p>
				<p>If you didn't request this, please ignore this email.</p>
			</div>
		`,
	}),

	/**
	 * Email verification
	 */
	emailVerification: (verifyUrl: string, userName?: string) => ({
		subject: "Verify your email address",
		html: `
			<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Verify Your Email</h2>
				${userName ? `<p>Hi ${userName},</p>` : "<p>Hi,</p>"}
				<p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
				<p>
					<a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px;">
						Verify Email
					</a>
				</p>
				<p>Or copy and paste this link into your browser:</p>
				<p style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all;">
					${verifyUrl}
				</p>
				<p>This link will expire in 24 hours.</p>
				<p>If you didn't create an account, please ignore this email.</p>
			</div>
		`,
	}),

	/**
	 * Two-factor authentication OTP
	 */
	twoFactorOTP: (otp: string, expiryMinutes: number = 5) => ({
		subject: "Your verification code",
		html: `
			<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Verification Code</h2>
				<p>Use the following code to complete your sign in:</p>
				<p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">
					${otp}
				</p>
				<p>This code will expire in ${expiryMinutes} minutes.</p>
				<p>If you didn't request this code, please ignore this email.</p>
			</div>
		`,
		text: `Your verification code is: ${otp}. This code will expire in ${expiryMinutes} minutes.`,
	}),

	/**
	 * Email OTP login
	 */
	emailOTP: (otp: string, expiryMinutes: number = 5) => ({
		subject: "Your login code",
		html: `
			<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Sign In Code</h2>
				<p>Use the following code to sign in to your account:</p>
				<p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">
					${otp}
				</p>
				<p>This code will expire in ${expiryMinutes} minutes.</p>
				<p>If you didn't request this code, please ignore this email.</p>
			</div>
		`,
		text: `Your sign in code is: ${otp}. This code will expire in ${expiryMinutes} minutes.`,
	}),

	/**
	 * Magic link login
	 */
	magicLink: (magicLinkUrl: string, userName?: string) => ({
		subject: "Your magic login link",
		html: `
			<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Sign In to Your Account</h2>
				${userName ? `<p>Hi ${userName},</p>` : "<p>Hi,</p>"}
				<p>Click the button below to sign in instantly:</p>
				<p>
					<a href="${magicLinkUrl}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px;">
						Sign In
					</a>
				</p>
				<p>Or copy and paste this link into your browser:</p>
				<p style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all;">
					${magicLinkUrl}
				</p>
				<p>This link will expire in 24 hours.</p>
				<p>If you didn't request this, please ignore this email.</p>
			</div>
		`,
	}),

	/**
	 * Organization invitation
	 */
	orgInvitation: (
		orgName: string,
		inviteUrl: string,
		inviterName: string,
		role: string
	) => ({
		subject: `You're invited to join ${orgName}`,
		html: `
			<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>You're Invited!</h2>
				<p><strong>${inviterName}</strong> invited you to join <strong>${orgName}</strong> as a <strong>${role}</strong>.</p>
				<p>
					<a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px;">
						Accept Invitation
					</a>
				</p>
				<p>This invitation will expire in 7 days.</p>
			</div>
		`,
	}),

	/**
	 * Welcome email
	 */
	welcome: (userName?: string) => ({
		subject: "Welcome to SimpBB Neo!",
		html: `
			<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Welcome to SimpBB Neo!</h2>
				${userName ? `<p>Hi ${userName},</p>` : "<p>Hi,</p>"}
				<p>Thanks for joining us! We're excited to have you on board.</p>
				<h3>Getting Started</h3>
				<ul>
					<li>Complete your profile settings</li>
					<li>Set up two-factor authentication for added security</li>
					<li>Explore your dashboard</li>
				</ul>
				<p>If you have any questions, feel free to reach out.</p>
				<p>Happy exploring!</p>
			</div>
		`,
	}),
};

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
	to: string,
	resetUrl: string,
	userName?: string
) {
	return sendEmail({
		to,
		...emailTemplates.passwordReset(resetUrl, userName),
	});
}

/**
 * Send an email verification email
 */
export async function sendEmailVerification(
	to: string,
	verifyUrl: string,
	userName?: string
) {
	return sendEmail({
		to,
		...emailTemplates.emailVerification(verifyUrl, userName),
	});
}

/**
 * Send a 2FA OTP email
 */
export async function sendTwoFactorOTP(
	to: string,
	otp: string,
	expiryMinutes: number = 5
) {
	return sendEmail({
		to,
		...emailTemplates.twoFactorOTP(otp, expiryMinutes),
	});
}

/**
 * Send an email OTP for login
 */
export async function sendEmailOTP(
	to: string,
	otp: string,
	expiryMinutes: number = 5
) {
	return sendEmail({
		to,
		...emailTemplates.emailOTP(otp, expiryMinutes),
	});
}

/**
 * Send a magic link email
 */
export async function sendMagicLink(
	to: string,
	magicLinkUrl: string,
	userName?: string
) {
	return sendEmail({
		to,
		...emailTemplates.magicLink(magicLinkUrl, userName),
	});
}

/**
 * Send an organization invitation email
 */
export async function sendOrgInvitation(
	to: string,
	orgName: string,
	inviteUrl: string,
	inviterName: string,
	role: string
) {
	return sendEmail({
		to,
		...emailTemplates.orgInvitation(orgName, inviteUrl, inviterName, role),
	});
}

/**
 * Send a welcome email
 */
export async function sendWelcomeEmail(to: string, userName?: string) {
	return sendEmail({
		to,
		...emailTemplates.welcome(userName),
	});
}
