import Link from "next/link";
import { UserIcon, ShieldIcon, Building2Icon, BellIcon } from "lucide-react";

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const settingsNav = [
		{
			title: "Account",
			href: "/settings/account",
			icon: UserIcon,
			description: "Manage your profile and personal information",
		},
		{
			title: "Security",
			href: "/settings/security",
			icon: ShieldIcon,
			description: "Password, 2FA, and session management",
		},
		{
			title: "Organizations",
			href: "/settings/organizations",
			icon: Building2Icon,
			description: "Manage your teams and organizations",
		},
		{
			title: "Notifications",
			href: "/settings/notifications",
			icon: BellIcon,
			description: "Configure your notification preferences",
		},
	];

	return (
		<div className="container max-w-6xl py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Settings</h1>
				<p className="text-muted-foreground">Manage your account preferences</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
				{/* Settings Navigation */}
				<aside className="space-y-2">
					<nav className="space-y-1">
						{settingsNav.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.href}
									href={item.href}
									className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
								>
									<Icon className="h-5 w-5 text-muted-foreground" />
									<div className="flex-1">
										<div>{item.title}</div>
										<div className="text-xs text-muted-foreground font-normal">
											{item.description}
										</div>
									</div>
								</Link>
							);
						})}
					</nav>
				</aside>

				{/* Settings Content */}
				<div className="min-h-[400px]">{children}</div>
			</div>
		</div>
	);
}
