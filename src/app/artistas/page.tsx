import { prisma } from '@/lib/prisma'
import ArtistasTable from './table'

export const dynamic = 'force-dynamic'

export type ArtistaRow = {
  id: number
  nombre: string
  genero: string | null
  representante: string | null
  contacto: string | null
  notas: string | null
  fechasCount: number
}

async function getArtistas(): Promise<ArtistaRow[]> {
  const list = await prisma.artist.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { fechas: true } } },
  })
  return list.map(a => ({
    id: a.id,
    nombre: a.nombre,
    genero: a.genero ?? null,
    representante: a.representante ?? null,
    contacto: a.contacto ?? null,
    notas: a.notas ?? null,
    fechasCount: a._count.fechas,
  }))
}

export default async function ArtistasPage() {
  const rows = await getArtistas()
  return (
    <div className="space-y-6" style={{ background: 'var(--background)', minHeight: '100vh', padding: '2rem' }}>
      {/* Header Section */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-4xl mb-2" style={{ color: 'var(--foreground)' }}>🎤 Artistas</h1>
            <p className="font-caption text-lg" style={{ color: 'var(--foreground-secondary)' }}>Gestiona tu catálogo de artistas y talentos musicales</p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-bold" style={{ color: 'var(--accent)' }}>{rows.length}</div>
            <div className="font-caption text-sm uppercase tracking-wider" style={{ color: 'var(--foreground-secondary)' }}>Total Artistas</div>
          </div>
        </div>
        


        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">🎤</span>
              Con Fechas Activas
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>{rows.filter(r => r.fechasCount > 0).length}</div>
          </div>
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">🎵</span>
              Géneros Únicos
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>{new Set(rows.map(r => r.genero).filter(Boolean)).size}</div>
          </div>
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">👥</span>
              Con Representante
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>{rows.filter(r => r.representante).length}</div>
          </div>
        </div>
      </div>
      
      <ArtistasTable initialData={rows} />
    </div>
  )
}