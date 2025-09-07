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
        


        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-sm border border-emerald-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
            <div className="text-emerald-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">🎤</span>
              Con Fechas Activas
            </div>
            <div className="text-white text-xl font-display">{rows.filter(r => r.fechasCount > 0).length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-sm border border-purple-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="text-purple-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">🎵</span>
              Géneros Únicos
            </div>
            <div className="text-white text-xl font-display">{new Set(rows.map(r => r.genero).filter(Boolean)).size}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="text-blue-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">👥</span>
              Con Representante
            </div>
            <div className="text-white text-xl font-display">{rows.filter(r => r.representante).length}</div>
          </div>
        </div>
      </div>
      
      <ArtistasTable initialData={rows} />
    </div>
  )
}