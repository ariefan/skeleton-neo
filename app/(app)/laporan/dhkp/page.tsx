'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function LaporanDhkpPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Laporan DHKP</h1>
        <p className="text-muted-foreground">Daftar Himpunan Ketetapan Pajak</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <BookOpen size={48} className="mx-auto mb-3 opacity-10" />
          <p>Generator DHKP akan tersedia setelah PDF template diimplementasi.</p>
        </CardContent>
      </Card>
    </div>
  )
}
