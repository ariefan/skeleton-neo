"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Ban, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
	id: string;
	name: string;
	email: string;
	username?: string;
	role: string | null | undefined;
	banned?: boolean;
	createdAt: string | Date;
}

export function AdminDashboard() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchUsers = useCallback(async () => {
		const res = await (authClient.admin as {
			listUsers: (opts: { query: { limit: number } }) => Promise<{ data?: User[] }>;
		}).listUsers({
			query: {
				limit: 50,
			},
		});
		if (res.data) {
			setUsers(res.data as User[]);
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchUsers();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const banUser = async (userId: string) => {
		const res = await authClient.admin.banUser({
			userId,
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to ban user");
		} else {
			toast.success("User banned");
			fetchUsers();
		}
	};

	const unbanUser = async (userId: string) => {
		const res = await authClient.admin.unbanUser({
			userId,
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to unban user");
		} else {
			toast.success("User unbanned");
			fetchUsers();
		}
	};

	const setRole = async (userId: string, role: string) => {
		const res = await (authClient.admin as {
			setRole: (opts: { userId: string; role: string }) => Promise<{ error?: { message?: string } }>;
		}).setRole({
			userId,
			role,
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to update role");
		} else {
			toast.success("Role updated");
			fetchUsers();
		}
	};

	const getInitials = (name: string) => {
		return name
			?.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2) || "U";
	};

	const getRoleBadge = (role: string | null | undefined) => {
		if (!role) return <Badge variant="secondary">User</Badge>;
		if (role === "admin") return <Badge variant="default">Admin</Badge>;
		return <Badge variant="secondary">{role}</Badge>;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>User Management</CardTitle>
			</CardHeader>
			<CardContent>
				{loading ? (
					<p>Loading users...</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Joined</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar>
												<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
											</Avatar>
											<div>
												<div className="font-medium">{user.name}</div>
												<div className="text-sm text-muted-foreground">
													{user.email}
												</div>
												{user.username && (
													<div className="text-xs text-muted-foreground">
														@{user.username}
													</div>
												)}
											</div>
										</div>
									</TableCell>
									<TableCell>{getRoleBadge(user.role)}</TableCell>
									<TableCell>
										{user.banned ? (
											<Badge variant="destructive">Banned</Badge>
										) : (
											<Badge variant="outline">Active</Badge>
										)}
									</TableCell>
									<TableCell>
										{new Date(user.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												{user.banned ? (
													<DropdownMenuItem
														onClick={() => unbanUser(user.id)}
													>
														<UserCheck className="mr-2 h-4 w-4" />
														Unban User
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem
														className="text-destructive"
														onClick={() => banUser(user.id)}
													>
														<Ban className="mr-2 h-4 w-4" />
														Ban User
													</DropdownMenuItem>
												)}
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => setRole(user.id, "admin")}
												>
													<Shield className="mr-2 h-4 w-4" />
													Make Admin
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => setRole(user.id, "user")}
												>
													<UserCheck className="mr-2 h-4 w-4" />
													Make User
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
