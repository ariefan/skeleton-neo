"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserIcon, ShieldIcon, Building2Icon, BellIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const settingsTabs = [
	{
		title: "Account",
		href: "/settings/account",
		icon: UserIcon,
	},
	{
		title: "Security",
		href: "/settings/security",
		icon: ShieldIcon,
	},
	{
		title: "Organizations",
		href: "/settings/organizations",
		icon: Building2Icon,
	},
	{
		title: "Notifications",
		href: "/settings/notifications",
		icon: BellIcon,
	},
]

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()

	return (
		<div className="space-y-6">
			{/* Settings Navigation Tabs */}
			<div className="border-b">
				<nav className="flex gap-1 overflow-x-auto">
					{settingsTabs.map((tab) => {
						const Icon = tab.icon
						const isActive = pathname === tab.href || (pathname.startsWith(tab.href) && tab.href !== "/settings")
						return (
							<Link
								key={tab.href}
								href={tab.href}
								className={cn(
									"flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
									isActive
										? "border-primary text-foreground"
										: "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
								)}
							>
								<Icon className="h-4 w-4" />
								{tab.title}
							</Link>
						)
					})}
				</nav>
			</div>

			{/* Settings Content */}
			<div>{children}</div>
		</div>
	)
}
