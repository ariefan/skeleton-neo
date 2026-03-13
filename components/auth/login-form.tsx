"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2Icon, KeyRound, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type IdentifierType = "email" | "username" | "phone" | "unknown";
type SignInMode = "password" | "magic-link" | "email-otp";

// Better Auth callback context types
interface AuthCallbackContext {
	error?: { message: string };
}

interface AuthCallbackOptions {
	onRequest?: () => void;
	onResponse?: () => void;
	onError?: (ctx: AuthCallbackContext) => void;
	onSuccess?: () => void;
}

/**
 * Detect what type of identifier the user entered.
 * Phone: starts with + and has 10-15 digits
 * Email: contains @ and domain with .
 * Username: alphanumeric with optional @ prefix, 3-20 chars
 */
function detectIdentifierType(value: string): IdentifierType {
	const trimmed = value.trim();

	// Phone: starts with + and has 10-15 digits
	if (/^\+\d{10,15}$/.test(trimmed)) return "phone";

	// Email: contains @ and domain with .
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";

	// Username: starts with @ or is alphanumeric/underscore, 3-20 chars
	if (/^@?[a-zA-Z0-9_]{3,20}$/.test(trimmed)) return "username";

	return "unknown";
}

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [signInMode, setSignInMode] = useState<SignInMode>("password");
	const [emailForPasswordless, setEmailForPasswordless] = useState("");

	const detectedType = detectIdentifierType(identifier);
	const isIdentifierValid = detectedType !== "unknown" || identifier.length === 0;
	const canUsePasswordless = detectedType === "email";
	const isPasswordlessMode = signInMode !== "password";

	// Unified sign-in handler
	const handleSignIn = async () => {
		const trimmedIdentifier = identifier.trim();
		if (!trimmedIdentifier) {
			toast.error("Please enter your email, username, or phone number");
			return;
		}

		// Strip @ from username if present
		let finalIdentifier = trimmedIdentifier;
		if (detectedType === "username" && trimmedIdentifier.startsWith("@")) {
			finalIdentifier = trimmedIdentifier.slice(1);
		}

		setLoading(true);

		if (signInMode === "magic-link") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (authClient.signIn as any).magicLink(
				{
					email: emailForPasswordless,
					callbackURL: "/dashboard",
				},
				{
					onRequest: () => setLoading(true),
					onResponse: () => setLoading(false),
					onError: (ctx: AuthCallbackContext) => {
						toast.error(ctx.error?.message || "Failed to send magic link");
					},
					onSuccess: () => {
						toast.success("Magic link sent! Check your email.");
						setIdentifier("");
						setEmailForPasswordless("");
						setSignInMode("password");
					},
				} as AuthCallbackOptions
			);
			return;
		}

		if (signInMode === "email-otp") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (authClient.signIn as any).emailOtp(
				{
					email: emailForPasswordless,
					callbackURL: "/dashboard",
				},
				{
					onRequest: () => setLoading(true),
					onResponse: () => setLoading(false),
					onError: (ctx: AuthCallbackContext) => {
						toast.error(ctx.error?.message || "Failed to send OTP");
					},
					onSuccess: () => {
						toast.success("OTP sent! Check your email.");
						setIdentifier("");
						setEmailForPasswordless("");
						setSignInMode("password");
					},
				} as AuthCallbackOptions
			);
			return;
		}

		// Password-based sign in
		if (detectedType === "email") {
			await authClient.signIn.email(
				{
					email: finalIdentifier,
					password,
					callbackURL: "/dashboard",
				},
				{
					onRequest: () => setLoading(true),
					onResponse: () => setLoading(false),
					onError: (ctx: AuthCallbackContext) => {
						toast.error(ctx.error?.message || "Failed to sign in");
					},
					onSuccess: () => {
						toast.success("Signed in successfully!");
						router.push("/dashboard");
					},
				} as AuthCallbackOptions
			);
		} else if (detectedType === "username") {
			await authClient.signIn.username(
				{
					username: finalIdentifier,
					password,
					callbackURL: "/dashboard",
				},
				{
					onRequest: () => setLoading(true),
					onResponse: () => setLoading(false),
					onError: (ctx: AuthCallbackContext) => {
						toast.error(ctx.error?.message || "Failed to sign in");
					},
					onSuccess: () => {
						toast.success("Signed in successfully!");
						router.push("/dashboard");
					},
				} as AuthCallbackOptions
			);
		} else if (detectedType === "phone") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (authClient.signIn.phoneNumber as any)(
				{
					phoneNumber: finalIdentifier,
					password,
					callbackURL: "/dashboard",
				},
				{
					onRequest: () => setLoading(true),
					onResponse: () => setLoading(false),
					onError: (ctx: AuthCallbackContext) => {
						toast.error(ctx.error?.message || "Failed to sign in");
					},
					onSuccess: () => {
						toast.success("Signed in successfully!");
						router.push("/dashboard");
					},
				} as AuthCallbackOptions
			);
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!identifier) {
			toast.error("Please enter your email, username, or phone number");
			return;
		}

		if (signInMode !== "password") {
			await handleSignIn();
			return;
		}

		if (!password) {
			toast.error("Please enter your password");
			return;
		}

		await handleSignIn();
	};

	// Switch to passwordless mode
	const switchToPasswordless = (mode: Extract<SignInMode, "magic-link" | "email-otp">) => {
		setEmailForPasswordless(identifier);
		setSignInMode(mode);
		setPassword("");
	};

	// Switch back to password mode
	const switchToPassword = () => {
		setSignInMode("password");
		setEmailForPasswordless("");
	};

	// Reset mode when identifier changes
	const handleIdentifierChange = (value: string) => {
		setIdentifier(value);
		if (isPasswordlessMode && value !== emailForPasswordless) {
			setSignInMode("password");
			setEmailForPasswordless("");
		}
	};

	// Google OAuth handler
	const handleGoogleLogin = () => {
		authClient.signIn.social({
			provider: "google",
			callbackURL: "/dashboard",
		});
	};

	// Get the label for the identifier input
	const getIdentifierLabel = () => {
		if (!identifier) return "Email, username, or phone";
		const type = detectIdentifierType(identifier);
		switch (type) {
			case "email":
				return "Email";
			case "phone":
				return "Phone number";
			case "username":
				return "Username";
			default:
				return "Email, username, or phone";
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>Sign in to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							{/* Google OAuth */}
							<Field>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={handleGoogleLogin}
									disabled={loading}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										className="h-5 w-5 mr-2"
									>
										<path
											d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
											fill="currentColor"
										/>
									</svg>
									Continue with Google
								</Button>
							</Field>

							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>

							{/* Unified Identifier Field */}
							<Field>
								<FieldLabel htmlFor="identifier">{getIdentifierLabel()}</FieldLabel>
								<Input
									id="identifier"
									name="identifier"
									type="text"
									autoComplete="username webauthn"
									value={identifier}
									onChange={(e) => handleIdentifierChange(e.target.value)}
									required
									disabled={loading || isPasswordlessMode}
									className={
										!isIdentifierValid && identifier.length > 0
											? "border-destructive focus-visible:ring-destructive"
											: ""
									}
								/>
								{!isIdentifierValid && identifier.length > 0 && (
									<FieldDescription className="text-destructive">
										Enter a valid email (@), username (@), or phone number (+)
									</FieldDescription>
								)}
							</Field>

							{/* Password Field - shown for password mode only */}
							{!isPasswordlessMode && (
								<Field>
									<div className="flex items-center justify-between">
										<FieldLabel htmlFor="password">Password</FieldLabel>
										<Link
											href="/forgot-password"
											className="text-sm text-muted-foreground hover:underline underline-offset-4"
											tabIndex={loading ? -1 : 0}
										>
											Forgot password?
										</Link>
									</div>
									<PasswordInput
										id="password"
										name="password"
										autoComplete="current-password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										disabled={loading}
									/>
								</Field>
							)}

							{/* Passwordless Mode - Back Link */}
							{isPasswordlessMode && (
								<Field>
									<button
										type="button"
										className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
										onClick={switchToPassword}
									>
										<ArrowLeft className="h-4 w-4" />
										Back to password sign in
									</button>
								</Field>
							)}

							{/* Sign In Button */}
							<Field>
								<Button
									type="submit"
									className="w-full"
									disabled={loading || !isIdentifierValid || (!isPasswordlessMode && !password)}
								>
									{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
									{isPasswordlessMode ? "Send" : "Sign in"}
								</Button>
							</Field>

							{/* Passwordless Options - shown when email is detected */}
							{!isPasswordlessMode && canUsePasswordless && identifier && (
								<Field>
									<FieldSeparator />
									<FieldDescription className="text-sm text-center mb-2">
										Or sign in without a password
									</FieldDescription>
									<div className="grid grid-cols-2 gap-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => switchToPasswordless("magic-link")}
											disabled={loading}
										>
											<KeyRound className="h-4 w-4 mr-1.5" />
											Magic Link
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => switchToPasswordless("email-otp")}
											disabled={loading}
										>
											<Sparkles className="h-4 w-4 mr-1.5" />
											Email OTP
										</Button>
									</div>
								</Field>
							)}
						</FieldGroup>
					</form>

					<Field className="mt-2">
						<FieldDescription className="text-center">
							Don&apos;t have an account?{" "}
							<Link href="/register" className="underline underline-offset-4">
								Sign up
							</Link>
						</FieldDescription>
					</Field>
				</CardContent>
			</Card>

			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
				and <a href="#">Privacy Policy</a>.
			</FieldDescription>
		</div>
	);
}
