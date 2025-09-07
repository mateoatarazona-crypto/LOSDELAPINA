import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import FechasTable from '../fechas/FechasTable'

export const dynamic = 'force-dynamic'

export type FechaRow = {
  id: number
  fecha: string
  estado: string
  artistas: string
  empresario: string
  ciudad: string | null
  venue: string | null
  total: number
  anticipo: number
  segundoPago: number
}

async function getHistorial(sp: Record<string, string | string[] | undefined>): Promise<FechaRow[]> {
  const getFirst = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v
  const estado = getFirst(sp.estado) ?? undefined
  const desdeStr = getFirst(sp.desde)
  const hastaStr = getFirst(sp.hasta)
  const desde = desdeStr ? new Date(desdeStr) : undefined
  const hasta = hastaStr ? new Date(hastaStr) : undefined

  const today = new Date()
  const where: any = {
    fechaEvento: { lte: hasta ?? new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
    estado: {
      in: ['Ejecutada','Cerrada','Cancelada'],
    },
  }
  if (desde) where.fechaEvento.gte = desde
  if (estado) where.estado = estado as any

  const eventos = await prisma.event.findMany({
    where,
    orderBy: { fechaEvento: 'desc' },
    include: {
      artistas: { include: { artista: true } },
      empresario: true,
    },
  })

  return eventos.map((e) => ({
    id: e.id,
    fecha: format(e.fechaEvento, 'PP', { locale: es }),
    estado: e.estado,
    artistas: e.artistas.map((a) => a.artista.nombre).join(', '),
    empresario: e.empresario?.nombre ?? '',
    ciudad: e.ciudad ?? null,
    venue: e.venue ?? null,
    total: Number(e.totalNegociado),
    anticipo: Number(e.anticipo),
    segundoPago: Number(e.segundoPago),
  }))
}

export default async function HistorialPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const rows = await getHistorial(sp)
  
  const totalIngresos = rows.reduce((sum, row) => sum + row.total, 0)
  const totalAnticipos = rows.reduce((sum, row) => sum + row.anticipo, 0)
  const totalSegundos = rows.reduce((sum, row) => sum + row.segundoPago, 0)
  
  return (
    <div className="space-y-6" style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <div className="card p-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          📚 Historial de Eventos
        </h1>
        <p className="font-caption text-lg md:text-xl max-w-2xl mx-auto mb-6" style={{ color: 'var(--foreground-secondary)' }}>
          Revisa el historial completo de eventos realizados y analiza el rendimiento de tu negocio musical
        </p>
        <a href="/fechas/nueva" className="btn-primary inline-flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Fecha Nueva
        </a>
      </div>

      {/* Estadísticas del Historial */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📊</span>
            <h3 className="font-caption uppercase tracking-wider text-sm" style={{ color: 'var(--foreground-secondary)' }}>Total Eventos</h3>
          </div>
          <p className="font-display text-3xl" style={{ color: 'var(--accent)' }}>{rows.length}</p>
        </div>
        
        <div className="card p-6 hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💰</span>
            <h3 className="font-caption uppercase tracking-wider text-sm" style={{ color: 'var(--foreground-secondary)' }}>Ingresos Totales</h3>
          </div>
          <p className="font-display text-2xl" style={{ color: 'var(--accent)' }}>${Intl.NumberFormat('es-CO').format(totalIngresos)}</p>
        </div>
        
        <div className="card p-6 hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⏳</span>
            <h3 className="font-caption uppercase tracking-wider text-sm" style={{ color: 'var(--foreground-secondary)' }}>Anticipos</h3>
          </div>
          <p className="font-display text-2xl" style={{ color: 'var(--accent)' }}>${Intl.NumberFormat('es-CO').format(totalAnticipos)}</p>
        </div>
        
        <div className="card p-6 hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💳</span>
            <h3 className="font-caption uppercase tracking-wider text-sm" style={{ color: 'var(--foreground-secondary)' }}>Segundos Pagos</h3>
          </div>
          <p className="font-display text-2xl" style={{ color: 'var(--accent)' }}>${Intl.NumberFormat('es-CO').format(totalSegundos)}</p>
        </div>
      </div>

      {/* Tabla de Eventos */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl" style={{ color: 'var(--foreground)' }}>Eventos Completados</h2>
          <div className="text-right">
            <div className="font-display text-lg font-bold" style={{ color: 'var(--accent)' }}>{rows.length}</div>
            <div className="font-caption text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-secondary)' }}>Total</div>
          </div>
        </div>
        <FechasTable initialData={rows} basePath="/historial" />
      </div>
    </div>
  )
}