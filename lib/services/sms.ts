/**
 * SMS Service Configuration
 * Handles SMS sending via Twilio (https://twilio.com)
 */

export interface SMSOptions {
	to: string; // Phone number in E.164 format (e.g., +1234567890)
	body: string;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
	// E.164 format: + followed by 10-15 digits
	return /^\+[1-9]\d{1,14}$/.test(phone);
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string): string {
	// Remove all non-numeric characters except +
	let cleaned = phone.replace(/[^\d+]/g, "");

	// If starts with 0, replace with country code (default: +1)
	if (cleaned.startsWith("0")) {
		cleaned = "+1" + cleaned.slice(1);
	}

	// If no + prefix, add it
	if (!cleaned.startsWith("+")) {
		cleaned = "+" + cleaned;
	}

	return cleaned;
}

/**
 * Send an SMS using Twilio API
 */
export async function sendSMS({
	to,
	body,
}: SMSOptions): Promise<{ success: boolean; error?: string; sid?: string }> {
	const accountSid = process.env.TWILIO_ACCOUNT_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	const fromNumber = process.env.TWILIO_PHONE_NUMBER;

	if (!accountSid || !authToken || !fromNumber) {
		console.warn("[SMS] Twilio not configured - skipping SMS send");
		console.warn(`[SMS] Would send to: ${to} | Body: ${body}`);
		// For development, return success without actually sending
		if (process.env.NODE_ENV === "development") {
			return { success: true };
		}
		return {
			success: false,
			error: "SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.",
		};
	}

	// Format phone number
	const formattedTo = formatPhoneNumber(to);

	if (!isValidPhoneNumber(formattedTo)) {
		return {
			success: false,
			error: `Invalid phone number format: ${to}. Expected E.164 format (e.g., +1234567890)`,
		};
	}

	try {
		const auth = btoa(`${accountSid}:${authToken}`);
		const response = await fetch(
			`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
			{
				method: "POST",
				headers: {
					Authorization: `Basic ${auth}`,
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					From: fromNumber,
					To: formattedTo,
					Body: body,
				}),
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error("[SMS] Failed to send SMS:", errorData);
			return {
				success: false,
				error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
			};
		}

		const data = await response.json();
		console.log("[SMS] SMS sent successfully:", data.sid);

		return {
			success: true,
			sid: data.sid,
		};
	} catch (error) {
		console.error("[SMS] Error sending SMS:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * SMS templates
 */
export const smsTemplates = {
	/**
	 * Phone verification OTP
	 */
	phoneVerificationOTP: (otp: string, expiryMinutes: number = 5) => ({
		body: `Your verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Don't share this code with anyone.`,
	}),

	/**
	 * Phone login OTP
	 */
	phoneLoginOTP: (otp: string, expiryMinutes: number = 5) => ({
		body: `Your sign in code is: ${otp}. Valid for ${expiryMinutes} minutes. Don't share this code with anyone.`,
	}),

	/**
	 * Two-factor authentication SMS backup
	 */
	twoFactorSMS: (otp: string, expiryMinutes: number = 5) => ({
		body: `Your verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Don't share this code with anyone.`,
	}),

	/**
	 * Alert notification
	 */
	alert: (message: string) => ({
		body: `[SimpBB Neo] ${message}`,
	}),

	/**
	 * Organization invitation SMS
	 */
	orgInvitation: (orgName: string, inviterName: string) => ({
		body: `${inviterName} invited you to join ${orgName} on SimpBB Neo. Check your email to accept the invitation.`,
	}),
};

/**
 * Send a phone verification OTP
 */
export async function sendPhoneVerificationOTP(
	to: string,
	otp: string,
	expiryMinutes: number = 5
) {
	return sendSMS({
		to,
		...smsTemplates.phoneVerificationOTP(otp, expiryMinutes),
	});
}

/**
 * Send a phone login OTP
 */
export async function sendPhoneLoginOTP(
	to: string,
	otp: string,
	expiryMinutes: number = 5
) {
	return sendSMS({
		to,
		...smsTemplates.phoneLoginOTP(otp, expiryMinutes),
	});
}

/**
 * Send 2FA SMS backup code
 */
export async function sendTwoFactorSMS(
	to: string,
	otp: string,
	expiryMinutes: number = 5
) {
	return sendSMS({
		to,
		...smsTemplates.twoFactorSMS(otp, expiryMinutes),
	});
}

/**
 * Send an alert notification
 */
export async function sendAlertSMS(to: string, message: string) {
	return sendSMS({
		to,
		...smsTemplates.alert(message),
	});
}

/**
 * Send organization invitation SMS
 */
export async function sendOrgInvitationSMS(
	to: string,
	orgName: string,
	inviterName: string
) {
	return sendSMS({
		to,
		...smsTemplates.orgInvitation(orgName, inviterName),
	});
}
