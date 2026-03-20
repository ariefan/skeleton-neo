'use client'

import { Card, CardContent } from '@/components/ui/card'
import { GitBranch } from 'lucide-react'

export default function PemekaranPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Pemekaran</h1>
        <p className="text-muted-foreground">Manajemen pemekaran wilayah dan objek pajak</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <GitBranch size={48} className="mx-auto mb-3 opacity-10" />
          <p>Modul pemekaran akan diimplementasi pada Phase 9.</p>
        </CardContent>
      </Card>
    </div>
  )
}
