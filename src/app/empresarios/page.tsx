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
    <div className="space-y-6" style={{ background: 'var(--background)', minHeight: '100vh', padding: '2rem' }}>
      {/* Header Section */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-4xl mb-2" style={{ color: 'var(--foreground)' }}>🤝 Empresarios</h1>
            <p className="font-caption text-lg" style={{ color: 'var(--foreground-secondary)' }}>Administra tu red de promotores y empresarios musicales</p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-bold" style={{ color: 'var(--accent)' }}>{rows.length}</div>
            <div className="font-caption text-sm uppercase tracking-wider" style={{ color: 'var(--foreground-secondary)' }}>Total Empresarios</div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
          <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">📅</span>
              Con Fechas Activas
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>{rows.filter(r => r.fechasCount > 0).length}</div>
          </div>
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">🌍</span>
              Países
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>{paisesUnicos}</div>
          </div>
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">🏙️</span>
              Ciudades
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>{ciudadesUnicas}</div>
          </div>
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">📧</span>
              Con Email
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>{rows.filter(r => r.email).length}</div>
          </div>
        </div>
      </div>
      
      <EmpresariosTable initialData={rows} />
    </div>
  )
}