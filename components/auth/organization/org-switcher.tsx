"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Plus, Settings } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Organization {
	id: string;
	name: string;
	isActive?: boolean;
}

export function OrgSwitcher() {
	const router = useRouter();
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchOrganizations = useCallback(async () => {
		const res = await authClient.organization.list();
		if (res.data) {
			const orgs = res.data as Organization[];
			setOrganizations(orgs);
			setActiveOrg(orgs.find((org) => org.isActive) || orgs[0] || null);
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchOrganizations();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const switchOrganization = async (orgId: string) => {
		const res = await authClient.organization.setActive({
			organizationId: orgId,
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to switch organization");
		} else {
			toast.success("Organization switched");
			router.refresh();
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					{loading ? (
						<>Loading...</>
					) : activeOrg ? (
						<>
							<Building2 className="h-4 w-4" />
							<span className="max-w-[150px] truncate">{activeOrg.name}</span>
						</>
					) : (
						<>
							<Building2 className="h-4 w-4" />
							<span>Select Organization</span>
						</>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>Organizations</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{organizations.map((org) => (
					<DropdownMenuItem
						key={org.id}
						onClick={() => switchOrganization(org.id)}
					>
						<Building2 className="mr-2 h-4 w-4" />
						<span className="flex-1 truncate">{org.name}</span>
						{org.isActive && (
							<DropdownMenuShortcut>✓</DropdownMenuShortcut>
						)}
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => router.push("/settings/organizations/new")}>
					<Plus className="mr-2 h-4 w-4" />
					<span>Create Organization</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => router.push("/settings/organizations")}>
					<Settings className="mr-2 h-4 w-4" />
					<span>Manage Organizations</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
