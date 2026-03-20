'use client'

import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

export default function UpdateMasalPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Update Masal</h1>
        <p className="text-muted-foreground">Pembaruan data secara massal — NJOP, tarif, kalkulasi ulang SPPT</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <RefreshCw size={48} className="mx-auto mb-3 opacity-10" />
          <p>Wizard update masal akan diimplementasi pada Phase 9. Memerlukan SPPT generator dan progress tracking.</p>
        </CardContent>
      </Card>
    </div>
  )
}
