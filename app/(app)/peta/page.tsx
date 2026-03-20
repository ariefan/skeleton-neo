'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Map } from 'lucide-react'

export default function PetaPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Peta</h1>
        <p className="text-muted-foreground">Peta interaktif objek pajak (GIS)</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Map size={48} className="mx-auto mb-3 opacity-10" />
          <p>Peta interaktif (react-leaflet) akan diimplementasi pada Phase 10.</p>
        </CardContent>
      </Card>
    </div>
  )
}
