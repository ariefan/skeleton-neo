'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { NopDisplay } from '@/components/nop/nop-display'
import { PembayaranBadge } from '@/components/status/pembayaran-badge'
import { WilayahCascade, type WilayahValue } from '@/components/wilayah/wilayah-cascade'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Printer } from 'lucide-react'
import { formatRupiah } from '@/components/data-table/column-helpers'

type SpptRow = {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdBlok: string
  noUrut: string
  kdJnsOp: string
  thnPajakSppt: number
  nmWp: string | null
  pbbYgHarusDibayarSppt: string
  statusPembayaranSppt: string
  statusCetakSppt: string
}

const columns: ColumnDef<SpptRow>[] = [
  {
    id: 'nop',
    header: 'NOP',
    cell: ({ row }) => <NopDisplay parts={row.original} copyable={false} />,
  },
  { accessorKey: 'thnPajakSppt', header: 'Tahun' },
  { accessorKey: 'nmWp', header: 'Nama WP', cell: ({ row }) => row.original.nmWp ?? '-' },
  {
    accessorKey: 'pbbYgHarusDibayarSppt',
    header: 'PBB',
    cell: ({ row }) => <span className="font-mono text-sm">{formatRupiah(row.original.pbbYgHarusDibayarSppt)}</span>,
  },
  {
    accessorKey: 'statusPembayaranSppt',
    header: 'Bayar',
    cell: ({ row }) => <PembayaranBadge status={row.original.statusPembayaranSppt} />,
  },
  {
    accessorKey: 'statusCetakSppt',
    header: 'Cetak',
    cell: ({ row }) =>
      row.original.statusCetakSppt === '1' ? (
        <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-500/10">Sudah Cetak</Badge>
      ) : (
        <Badge variant="outline">Belum Cetak</Badge>
      ),
  },
]

const PAGE_SIZE = 20

export default function CetakSpptPage() {
  const orpc = useORPC()
  const currentYear = new Date().getFullYear()
  const [page, setPage] = React.useState(1)
  const [thnPajak, setThnPajak] = React.useState(currentYear)
  const [statusCetak, setStatusCetak] = React.useState<string>('all')
  const [wilayah, setWilayah] = React.useState<Partial<WilayahValue>>({})

  const listQuery = useQuery(
    orpc.sppt.list.queryOptions({
      input: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        thnPajak: thnPajak,
        statusCetak: statusCetak !== 'all' ? statusCetak : undefined,
        kdPropinsi: wilayah.kdPropinsi || undefined,
        kdDati2: wilayah.kdDati2 || undefined,
        kdKecamatan: wilayah.kdKecamatan || undefined,
        kdKelurahan: wilayah.kdKelurahan || undefined,
      },
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Cetak SPPT</h1>
          <p className="text-muted-foreground">Cetak Surat Pemberitahuan Pajak Terhutang</p>
        </div>
        <Button disabled>
          <Printer className="w-4 h-4 mr-2" />
          Cetak Massal
        </Button>
      </div>

      <div className="rounded-md border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Tahun Pajak</label>
            <Select value={String(thnPajak)} onValueChange={(v) => { setThnPajak(parseInt(v)); setPage(1) }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Status Cetak</label>
            <Select value={statusCetak} onValueChange={(v) => { setStatusCetak(v); setPage(1) }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="0">Belum Cetak</SelectItem>
                <SelectItem value="1">Sudah Cetak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <WilayahCascade value={wilayah} onChange={(v) => { setWilayah(v); setPage(1) }} />
      </div>

      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as SpptRow[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada data SPPT."
        emptyIcon={<Printer size={48} className="opacity-10" />}
      />
    </div>
  )
}
