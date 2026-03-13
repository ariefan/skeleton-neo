"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { QRCodeSVG } from "qrcode.react";
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
import { Loader2Icon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";

export function SetupTwoFactor() {
	const [step, setStep] = useState<"generate" | "verify">("generate");
	const [loading, setLoading] = useState(false);
	const [secret, setSecret] = useState("");
	const [qrCode, setQrCode] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [verificationCode, setVerificationCode] = useState("");

	// Generate TOTP secret
	const handleGenerate = async () => {
		setLoading(true);
		const res = await (authClient.twoFactor as any).enableTotp();

		if (res.error) {
			toast.error(res.error.message || "Failed to generate 2FA");
			setLoading(false);
			return;
		}

		if (res.data) {
			setSecret(res.data.secret || "");
			setQrCode(res.data.qrCode || "");
			setBackupCodes(res.data.backupCodes?.codes || []);
			setStep("verify");
		}
		setLoading(false);
	};

	// Verify TOTP code
	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const res = await (authClient.twoFactor as any).verifyTotp({
			code: verificationCode,
		});

		if (res.error) {
			toast.error(res.error.message || "Invalid code");
		} else {
			toast.success("Two-factor authentication enabled!");
			setStep("generate");
			setVerificationCode("");
		}
		setLoading(false);
	};

	// Copy secret to clipboard
	const handleCopySecret = () => {
		navigator.clipboard.writeText(secret);
		toast.success("Secret copied to clipboard");
	};

	// Copy backup codes
	const handleCopyBackupCodes = () => {
		navigator.clipboard.writeText(backupCodes.join("\n"));
		toast.success("Backup codes copied to clipboard");
	};

	if (step === "generate") {
		return (
			<Card className="mx-auto max-w-md">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShieldCheck className="h-5 w-5" />
						Two-Factor Authentication
					</CardTitle>
					<CardDescription>
						Protect your account with TOTP authenticator app
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<Field>
							<FieldDescription>
								Two-factor authentication adds an extra layer of security to your
								account. You&apos;ll need to enter a code from your authenticator
								app when you sign in.
							</FieldDescription>
						</Field>
						<Field>
							<Button
								onClick={handleGenerate}
								disabled={loading}
								className="w-full"
							>
								{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
								Set up authenticator app
							</Button>
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mx-auto max-w-md">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ShieldCheck className="h-5 w-5" />
					Setup Two-Factor Authentication
				</CardTitle>
				<CardDescription>
					Scan the QR code with your authenticator app
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					{/* QR Code */}
					<Field className="flex justify-center">
						<div className="border rounded-lg p-4 bg-white">
							{qrCode && <QRCodeSVG value={qrCode} size={200} />}
						</div>
					</Field>

					{/* Secret */}
					<Field>
						<FieldLabel>Secret Key</FieldLabel>
						<div className="flex gap-2">
							<Input value={secret} readOnly className="font-mono text-sm" />
							<Button type="button" variant="outline" onClick={handleCopySecret}>
								Copy
							</Button>
						</div>
						<FieldDescription>
							Store this secret key safely. You can use it to recover your
							authenticator.
						</FieldDescription>
					</Field>

					{/* Verification */}
					<form onSubmit={handleVerify}>
						<Field>
							<FieldLabel htmlFor="code">Verification Code</FieldLabel>
							<Input
								id="code"
								type="text"
								placeholder="123456"
								value={verificationCode}
								onChange={(e) => setVerificationCode(e.target.value)}
								maxLength={6}
								pattern="[0-9]{6}"
								required
								className="text-center text-lg tracking-widest"
							/>
							<FieldDescription>
								Enter the 6-digit code from your authenticator app.
							</FieldDescription>
						</Field>
						<Field>
							<Button type="submit" disabled={loading} className="w-full">
								{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
								Verify and Enable
							</Button>
						</Field>
					</form>

					{/* Backup Codes */}
					{backupCodes.length > 0 && (
						<Alert>
							<AlertTitle>Backup Codes</AlertTitle>
							<AlertDescription>
								<p className="mb-2">
									Save these backup codes. You can use them to access your
									account if you lose your authenticator device.
								</p>
								<div className="grid grid-cols-2 gap-1 font-mono text-xs bg-muted p-2 rounded mb-2">
									{backupCodes.map((code) => (
										<span key={code}>{code}</span>
									))}
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleCopyBackupCodes}
								>
									Copy all codes
								</Button>
							</AlertDescription>
						</Alert>
					)}

					<Field>
						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								setStep("generate");
								setSecret("");
								setQrCode("");
								setBackupCodes([]);
								setVerificationCode("");
							}}
						>
							Cancel
						</Button>
					</Field>
				</FieldGroup>
			</CardContent>
		</Card>
	);
}
