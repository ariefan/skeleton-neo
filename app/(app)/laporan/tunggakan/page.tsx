'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatRupiah } from '@/components/data-table/column-helpers'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

export default function LaporanTunggakanPage() {
  const orpc = useORPC()

  const summaryQuery = useQuery(
    orpc.tunggakan.summaryPerYear.queryOptions({ input: {} }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Laporan Tunggakan</h1>
        <p className="text-muted-foreground">Rekapitulasi tunggakan per tahun pajak</p>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tahun Pajak</TableHead>
              <TableHead>Jumlah SPPT</TableHead>
              <TableHead>Total Tunggakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : summaryQuery.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">Tidak ada tunggakan</TableCell>
              </TableRow>
            ) : (
              summaryQuery.data?.map((r) => (
                <TableRow key={r.thnPajak}>
                  <TableCell className="font-medium">{r.thnPajak}</TableCell>
                  <TableCell>{r.jumlahSppt}</TableCell>
                  <TableCell className="font-mono text-red-600">{formatRupiah(r.totalTunggakan)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
