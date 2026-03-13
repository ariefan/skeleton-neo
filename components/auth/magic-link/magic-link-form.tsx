"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2Icon, Send, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MagicLinkForm() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const res = await (authClient.signIn as any).magicLink({
			email,
			callbackURL: "/dashboard",
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to send magic link");
		} else {
			toast.success("Magic link sent!");
			setSent(true);
		}
		setLoading(false);
	};

	return (
		<Card className="mx-auto max-w-md">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Send className="h-5 w-5" />
					Magic Link Login
				</CardTitle>
				<CardDescription>
					Sign in without a password using a magic link
				</CardDescription>
			</CardHeader>
			<CardContent>
				{!sent ? (
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="email">Email Address</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</Field>
							<Field>
								<FieldDescription>
									We&apos;ll send a magic link to your email. Click the link to sign
									in instantly without a password.
								</FieldDescription>
							</Field>
							<Field>
								<Button type="submit" disabled={loading} className="w-full">
									{loading ? (
										<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<Mail className="mr-2 h-4 w-4" />
									)}
									Send Magic Link
								</Button>
							</Field>
						</FieldGroup>
					</form>
				) : (
					<FieldGroup>
						<Alert>
							<CheckCircle className="h-4 w-4" />
							<AlertDescription className="ml-2">
								<strong>Magic link sent!</strong>
								<br />
								Check your email at <strong>{email}</strong> for a sign-in link.
								The link expires in 24 hours.
							</AlertDescription>
						</Alert>
						<Field>
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => {
									setSent(false);
									setEmail("");
								}}
							>
								Send to another email
							</Button>
						</Field>
						<Field>
							<FieldDescription className="text-center text-sm">
								Didn&apos;t receive the email? Check your spam folder or{" "}
								<button
									type="button"
									className="underline underline-offset-4"
									onClick={() => setSent(false)}
								>
									try again
								</button>
								.
							</FieldDescription>
						</Field>
					</FieldGroup>
				)}
			</CardContent>
		</Card>
	);
}
