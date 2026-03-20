'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { NopDisplay } from '@/components/nop/nop-display'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatRupiah, formatTanggal } from '@/components/data-table/column-helpers'
import { CreditCard } from 'lucide-react'

type Row = {
  kdPropinsi: string; kdDati2: string; kdKecamatan: string; kdKelurahan: string
  kdBlok: string; noUrut: string; kdJnsOp: string
  thnPajakSppt: number; tglPembayaranSppt: Date | string
  jmlSpptYgDibayar: string; dendaSppt: string; jmlBayar: string; namaBayar: string | null
}

const columns: ColumnDef<Row>[] = [
  { id: 'nop', header: 'NOP', cell: ({ row }) => <NopDisplay parts={row.original} copyable={false} /> },
  { accessorKey: 'thnPajakSppt', header: 'Tahun' },
  { accessorKey: 'tglPembayaranSppt', header: 'Tanggal', cell: ({ row }) => formatTanggal(row.original.tglPembayaranSppt) },
  { accessorKey: 'jmlSpptYgDibayar', header: 'Pokok', cell: ({ row }) => <span className="font-mono text-sm">{formatRupiah(row.original.jmlSpptYgDibayar)}</span> },
  { accessorKey: 'dendaSppt', header: 'Denda', cell: ({ row }) => <span className="font-mono text-sm">{formatRupiah(row.original.dendaSppt)}</span> },
  { accessorKey: 'jmlBayar', header: 'Total', cell: ({ row }) => <span className="font-mono text-sm font-medium">{formatRupiah(row.original.jmlBayar)}</span> },
  { accessorKey: 'namaBayar', header: 'Pembayar', cell: ({ row }) => row.original.namaBayar ?? '-' },
]

const PAGE_SIZE = 50

export default function LaporanPembayaranPage() {
  const orpc = useORPC()
  const currentYear = new Date().getFullYear()
  const [page, setPage] = React.useState(1)
  const [thnPajak, setThnPajak] = React.useState(currentYear)

  const listQuery = useQuery(
    orpc.pembayaran.list.queryOptions({
      input: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, thnPajak },
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Laporan Pembayaran</h1>
          <p className="text-muted-foreground">Rincian pembayaran PBB per periode</p>
        </div>
        <Select value={String(thnPajak)} onValueChange={(v) => { setThnPajak(parseInt(v)); setPage(1) }}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as Row[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page} pageSize={PAGE_SIZE} onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada data pembayaran."
        emptyIcon={<CreditCard size={48} className="opacity-10" />}
      />
    </div>
  )
}
