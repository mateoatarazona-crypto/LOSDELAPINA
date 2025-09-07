import { prisma } from '@/lib/prisma'
import EmpresariosTable from './table'

export const dynamic = 'force-dynamic'

export type EmpresarioRow = {
  id: number
  nombre: string
  empresa: string | null
  ciudad: string | null
  pais: string | null
  email: string | null
  telefono: string | null
  nit: string | null
  notas: string | null
  fechasCount: number
}

async function getEmpresarios(): Promise<EmpresarioRow[]> {
  const list = await prisma.promoter.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { fechas: true } } },
  })
  return list.map(e => ({
    id: e.id,
    nombre: e.nombre,
    empresa: e.empresa ?? null,
    ciudad: e.ciudad ?? null,
    pais: e.pais ?? null,
    email: e.email ?? null,
    telefono: e.telefono ?? null,
    nit: e.nit ?? null,
    notas: e.notas ?? null,
    fechasCount: e._count.fechas,
  }))
}

export default async function EmpresariosPage() {
  const rows = await getEmpresarios()
  const paisesUnicos = new Set(rows.map(r => r.pais).filter(Boolean)).size
  const ciudadesUnicas = new Set(rows.map(r => r.ciudad).filter(Boolean)).size
  
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-green-900/30 to-black/50 backdrop-blur-sm border border-green-700/20 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-4xl text-gradient-green text-shadow-glow mb-2">💼 Empresarios</h1>
            <p className="font-body text-lg text-green-200/80">Administra tu red de promotores y empresarios musicales</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl text-white font-bold">{rows.length}</div>
            <div className="font-subheading text-sm text-green-300/80 uppercase tracking-wider">Total Empresarios</div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-sm border border-emerald-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
            <div className="text-emerald-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">📅</span>
              Con Fechas Activas
            </div>
            <div className="text-white text-xl font-display">{rows.filter(r => r.fechasCount > 0).length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="text-blue-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">🌍</span>
              Países
            </div>
            <div className="text-white text-xl font-display">{paisesUnicos}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-sm border border-purple-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="text-purple-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">🏙️</span>
              Ciudades
            </div>
            <div className="text-white text-xl font-display">{ciudadesUnicas}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-red-600/10 backdrop-blur-sm border border-orange-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
            <div className="text-orange-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">📧</span>
              Con Email
            </div>
            <div className="text-white text-xl font-display">{rows.filter(r => r.email).length}</div>
          </div>
        </div>
      </div>
      
      <EmpresariosTable initialData={rows} />
    </div>
  )
}