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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2Icon, RefreshCw, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function BackupCodes() {
	const [loading, setLoading] = useState(false);
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [showCodes, setShowCodes] = useState(false);

	// Generate new backup codes
	const handleGenerateCodes = async () => {
		setLoading(true);
		const res = await (authClient.twoFactor as any).generateBackupCodes();

		if (res.error) {
			toast.error(res.error.message || "Failed to generate backup codes");
		} else if (res.data) {
			setBackupCodes(res.data.codes || []);
			setShowCodes(true);
			toast.success("New backup codes generated");
		}
		setLoading(false);
	};

	// Copy codes to clipboard
	const handleCopyCodes = () => {
		navigator.clipboard.writeText(backupCodes.join("\n"));
		toast.success("Backup codes copied to clipboard");
	};

	return (
		<Card className="mx-auto max-w-md">
			<CardHeader>
				<CardTitle>Backup Codes</CardTitle>
				<CardDescription>
					Store these codes securely to recover your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				{backupCodes.length === 0 ? (
					<>
						<Alert>
							<AlertDescription>
								You haven&apos;t generated backup codes yet. Generate them now so
								you can access your account if you lose your authenticator device.
							</AlertDescription>
						</Alert>
						<Button
							onClick={handleGenerateCodes}
							disabled={loading}
							className="w-full"
						>
							{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
							Generate Backup Codes
						</Button>
					</>
				) : (
					<>
						<Alert>
							<AlertTitle>Important</AlertTitle>
							<AlertDescription>
								Store these codes in a safe place. Each code can only be used once.
								Generate new codes only when necessary.
							</AlertDescription>
						</Alert>

						<div className="bg-muted p-4 rounded-lg space-y-1">
							{backupCodes.map((code, index) => (
								<div
									key={code}
									className="font-mono text-sm flex justify-between items-center"
								>
									{showCodes ? (
										<code>{code}</code>
									) : (
										<code>{code.replace(/./g, "•")}</code>
									)}
								</div>
							))}
						</div>

						<div className="flex gap-2">
							<Button
								onClick={handleCopyCodes}
								variant="outline"
								className="flex-1"
							>
								Copy Codes
							</Button>
							<Button
								onClick={() => setShowCodes(!showCodes)}
								variant="outline"
							>
								{showCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</Button>
							<Button
								onClick={handleGenerateCodes}
								variant="outline"
								disabled={loading}
							>
								{loading ? (
									<Loader2Icon className="h-4 w-4 animate-spin" />
								) : (
									<RefreshCw className="h-4 w-4" />
								)}
							</Button>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
