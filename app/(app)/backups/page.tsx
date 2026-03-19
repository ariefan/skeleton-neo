'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { BackupActions, type BackupItem } from "@/components/backups/backup-actions"
import { BackupCreateDialog } from "@/components/backups/backup-create-dialog"
import {
	Plus,
	Loader2,
	Archive,
	HardDrive,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

const PAGE_SIZE = 20

type BackupRow = {
	name: string
	path: string
	size: number
	createdAt: Date
}

type BackupsListResponse = {
	rows: BackupRow[]
	total: number
}

type DeleteVariables = { filename: string }

function formatBytes(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"]
	let size = bytes
	let unitIndex = 0

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024
		unitIndex++
	}

	return `${size.toFixed(2)} ${units[unitIndex]}`
}

function parseBackupFilename(filename: string): { date: Date; label: string } {
	// Format: backup-YYYY-MM-DD-HHMMSS.zip
	const match = filename.match(/backup-(\d{4})-(\d{2})-(\d{2})-(\d{6})\.zip/)
	if (match) {
		const [, year, month, day, time] = match
		const hours = time.substring(0, 2)
		const minutes = time.substring(2, 4)
		const seconds = time.substring(4, 6)
		const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`)
		return {
			date,
			label: `Backup from ${format(date, "MMM d, yyyy 'at' HH:mm")}`,
		}
	}
	return {
		date: new Date(),
		label: filename,
	}
}

export default function BackupsPage() {
	const orpc = useORPC()
	const queryClient = useQueryClient()

	const [page, setPage] = React.useState(1)
	const [showCreateDialog, setShowCreateDialog] = React.useState(false)

	const listQuery = useQuery(orpc.backups.list.queryOptions({
		input: {
			limit: PAGE_SIZE,
			offset: (page - 1) * PAGE_SIZE,
		}
	}))

	const backups = listQuery.data?.rows ?? []
	const total = listQuery.data?.total ?? 0
	const totalPages = Math.ceil(total / PAGE_SIZE)
	const isLoading = listQuery.isLoading

	const deleteMutation = useMutation(orpc.backups.delete.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.backups.key() })
			toast.success('Backup deleted successfully')
		},
		onError: (error: Error) => {
			toast.error('Failed to delete backup: ' + error.message)
		}
	}))

	const handleDelete = (filename: string) => {
		deleteMutation.mutate({ filename })
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight">Backups</h1>
					<p className="text-muted-foreground">
						Manage database and file backups. Create, download, or delete backups.
					</p>
				</div>
				<Button onClick={() => setShowCreateDialog(true)}>
					<Plus className="w-4 h-4 mr-2" />
					Create Backup
				</Button>
			</div>

			<div className="rounded-md border bg-card overflow-hidden flex flex-col">
				<div className="flex-1 overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Size</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={4} className="h-56 text-center">
										<div className="flex items-center justify-center gap-2">
											<Loader2 className="animate-spin" size={24} />
											<span>Loading backups...</span>
										</div>
									</TableCell>
								</TableRow>
							) : backups.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="h-56 text-center text-muted-foreground">
										<div className="flex flex-col items-center justify-center gap-3">
											<HardDrive size={48} className="opacity-10" />
											<p className="font-medium">No backups found.</p>
											<p className="text-sm">Create your first backup to get started!</p>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setShowCreateDialog(true)}
												className="mt-2"
											>
												<Archive className="w-4 h-4 mr-2" />
												Create Backup
											</Button>
										</div>
									</TableCell>
								</TableRow>
							) : (
								backups.map((backup) => {
									const { label } = parseBackupFilename(backup.name)
									return (
										<TableRow key={backup.name}>
											<TableCell>
												<div className="flex items-center gap-2">
													<Archive className="w-4 h-4 text-muted-foreground" />
													<span className="font-medium">{label}</span>
												</div>
												<span className="text-xs text-muted-foreground ml-6">
													{backup.name}
												</span>
											</TableCell>
											<TableCell>
												<code className="text-sm bg-muted px-2 py-1 rounded">
													{formatBytes(backup.size)}
												</code>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{format(new Date(backup.createdAt), "MMM d, yyyy HH:mm")}
											</TableCell>
											<TableCell className="text-right">
												<BackupActions
													backup={backup}
													onDelete={handleDelete}
													isDeleting={
														deleteMutation.isPending &&
														(deleteMutation.variables as DeleteVariables)?.filename === backup.name
													}
												/>
											</TableCell>
										</TableRow>
									)
								})
							)}
						</TableBody>
					</Table>
				</div>

				{totalPages > 1 && (
					<div className="border-t p-4 flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} backups
						</p>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(p => Math.max(1, p - 1))}
								disabled={page <= 1}
							>
								Previous
							</Button>
							<span className="text-sm">
								Page {page} of {totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(p => Math.min(totalPages, p + 1))}
								disabled={page >= totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>

			<BackupCreateDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: orpc.backups.key() })
					toast.success('Backup created successfully')
				}}
			/>
		</div>
	)
}
