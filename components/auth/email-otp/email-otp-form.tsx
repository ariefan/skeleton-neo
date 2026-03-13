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
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2Icon, Mail } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EmailOtpForm() {
	const [step, setStep] = useState<"send" | "verify">("send");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [otp, setOtp] = useState("");

	// Send OTP
	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const res = await authClient.signIn.emailOtp({
			email,
			callbackURL: "/dashboard",
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to send OTP");
		} else {
			toast.success("OTP sent to your email!");
			setStep("verify");
		}
		setLoading(false);
	};

	// Verify OTP
	const handleVerifyOtp = async () => {
		setLoading(true);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const res = await (authClient.signIn.emailOtp as any).verifyOTP({
			email,
			otp,
		});

		if (res.error) {
			toast.error(res.error.message || "Invalid OTP");
		} else {
			toast.success("Verified successfully!");
			window.location.href = "/dashboard";
		}
		setLoading(false);
	};

	return (
		<Card className="mx-auto max-w-md">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Mail className="h-5 w-5" />
					Email OTP Login
				</CardTitle>
				<CardDescription>
					{step === "send"
						? "Enter your email to receive a one-time code"
						: "Enter the code sent to your email"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{step === "send" ? (
					<form onSubmit={handleSendOtp}>
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
								<Button type="submit" disabled={loading} className="w-full">
									{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
									Send Code
								</Button>
							</Field>
						</FieldGroup>
					</form>
				) : (
					<FieldGroup>
						<Alert>
							<AlertDescription>
								We sent a 6-digit code to <strong>{email}</strong>
							</AlertDescription>
						</Alert>
						<Field>
							<FieldLabel>Enter Code</FieldLabel>
							<div className="flex justify-center">
								<InputOTP
									maxLength={6}
									value={otp}
									onChange={setOtp}
									render={({ slots }) => (
										<InputOTPGroup>
											{slots.map((slot, index) => (
												<InputOTPSlot
													key={index}
													index={index}
													{...slot}
													className="w-10 h-12 text-lg"
												/>
											))}
										</InputOTPGroup>
									)}
								/>
							</div>
						</Field>
						<Field>
							<Button
								onClick={handleVerifyOtp}
								disabled={loading || otp.length !== 6}
								className="w-full"
							>
								{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
								Verify
							</Button>
						</Field>
						<Field>
							<Button
								type="button"
								variant="link"
								className="w-full text-sm"
								onClick={() => {
									setStep("send");
									setOtp("");
								}}
							>
								Back to email input
							</Button>
						</Field>
					</FieldGroup>
				)}
			</CardContent>
		</Card>
	);
}
