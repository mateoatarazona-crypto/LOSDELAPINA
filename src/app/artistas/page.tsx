import { PrismaClient } from '@prisma/client'
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
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?prepared_statements=false&statement_cache_size=0'
      }
    }
  })
  
  try {
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
  } catch (error) {
    console.error('Error fetching artistas:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function ArtistasPage() {
  const rows = await getArtistas()
  return (
    <div className="space-y-4 sm:space-y-6" style={{ background: 'var(--background)', minHeight: '100vh', padding: '1rem' }}>
      {/* Header Section */}
      <div className="card p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl mb-2" style={{ color: 'var(--foreground)' }}>🎤 Artistas</h1>
            <p className="font-caption text-sm sm:text-base lg:text-lg" style={{ color: 'var(--foreground-secondary)' }}>Gestiona tu catálogo de artistas y talentos musicales</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="font-display text-2xl sm:text-3xl font-bold" style={{ color: 'var(--accent)' }}>{rows.length}</div>
            <div className="font-caption text-xs sm:text-sm uppercase tracking-wider" style={{ color: 'var(--foreground-secondary)' }}>Total Artistas</div>
          </div>
        </div>
        


        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="card p-3 sm:p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-xs sm:text-sm uppercase tracking-wider mb-1 flex items-center gap-1 sm:gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-base sm:text-lg">🎤</span>
              <span className="truncate">Con Fechas Activas</span>
            </div>
            <div className="font-display text-lg sm:text-xl" style={{ color: 'var(--accent)' }}>{rows.filter(r => r.fechasCount > 0).length}</div>
          </div>
          <div className="card p-3 sm:p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-xs sm:text-sm uppercase tracking-wider mb-1 flex items-center gap-1 sm:gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-base sm:text-lg">🎵</span>
              <span className="truncate">Géneros Únicos</span>
            </div>
            <div className="font-display text-lg sm:text-xl" style={{ color: 'var(--accent)' }}>{new Set(rows.map(r => r.genero).filter(Boolean)).size}</div>
          </div>
          <div className="card p-3 sm:p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-xs sm:text-sm uppercase tracking-wider mb-1 flex items-center gap-1 sm:gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-base sm:text-lg">👥</span>
              <span className="truncate">Con Representante</span>
            </div>
            <div className="font-display text-lg sm:text-xl" style={{ color: 'var(--accent)' }}>{rows.filter(r => r.representante).length}</div>
          </div>
        </div>
      </div>
      
      <ArtistasTable initialData={rows} />
    </div>
  )
}