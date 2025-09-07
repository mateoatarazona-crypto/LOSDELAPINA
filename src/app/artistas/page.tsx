import { prisma } from '@/lib/prisma'
import ArtistasTable from './table'
import SearchBar, { useSearch } from '@/components/SearchBar'
import FilterPanel, { useFilters } from '@/components/FilterPanel'

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
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-green-900/30 to-black/50 backdrop-blur-sm border border-green-700/20 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-4xl text-gradient-green text-shadow-glow mb-2">🎤 Artistas</h1>
            <p className="font-body text-lg text-green-200/80">Gestiona tu catálogo de artistas y talentos musicales</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl text-white font-bold">{rows.length}</div>
            <div className="font-subheading text-sm text-green-300/80 uppercase tracking-wider">Total Artistas</div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SearchBar 
                placeholder="Buscar artistas por nombre, género, país..."
                className="w-full"
              />
            </div>
            <div>
              <FilterPanel 
                filterGroups={[
                  {
                    title: "Género Musical",
                    key: "genero",
                    type: "checkbox",
                    options: [...new Set(rows.map(r => r.genero).filter(Boolean))]
                       .filter((genero): genero is string => genero !== null)
                       .map(genero => ({
                         label: genero,
                         value: genero,
                         count: rows.filter(r => r.genero === genero).length
                       }))
                  }
                ]}
                onFiltersChange={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="glass rounded-xl p-4 hover-lift">
            <div className="text-green-400 text-sm font-subheading uppercase tracking-wider mb-1">Con Fechas Activas</div>
            <div className="text-white text-xl font-display">{rows.filter(r => r.fechasCount > 0).length}</div>
          </div>
          <div className="glass rounded-xl p-4 hover-lift">
            <div className="text-green-400 text-sm font-subheading uppercase tracking-wider mb-1">Géneros Únicos</div>
            <div className="text-white text-xl font-display">{new Set(rows.map(r => r.genero).filter(Boolean)).size}</div>
          </div>
          <div className="glass rounded-xl p-4 hover-lift">
            <div className="text-green-400 text-sm font-subheading uppercase tracking-wider mb-1">Con Representante</div>
            <div className="text-white text-xl font-display">{rows.filter(r => r.representante).length}</div>
          </div>
        </div>
      </div>
      
      <ArtistasTable initialData={rows} />
    </div>
  )
}