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
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Section */}
      <div className="text-center mb-12 py-16 px-6 rounded-3xl bg-gradient-to-br from-green-900/30 to-black/50 backdrop-blur-sm border border-green-700/20">
        <h1 className="font-display text-5xl md:text-6xl mb-6 text-gradient-green text-shadow-glow">
          📚 Historial de Eventos
        </h1>
        <p className="font-body text-xl text-green-200/80 max-w-2xl mx-auto leading-relaxed">
          Revisa el historial completo de eventos realizados y analiza el rendimiento de tu negocio musical
        </p>
      </div>

      {/* Estadísticas del Historial */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900/20 to-black/40 backdrop-blur-md border border-blue-700/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📊</span>
            <h3 className="font-subheading text-blue-300 uppercase tracking-wider text-sm">Total Eventos</h3>
          </div>
          <p className="font-display text-3xl text-white">{rows.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/20 to-black/40 backdrop-blur-md border border-green-700/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💰</span>
            <h3 className="font-subheading text-green-300 uppercase tracking-wider text-sm">Ingresos Totales</h3>
          </div>
          <p className="font-display text-2xl text-white">${Intl.NumberFormat('es-CO').format(totalIngresos)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/20 to-black/40 backdrop-blur-md border border-purple-700/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⏳</span>
            <h3 className="font-subheading text-purple-300 uppercase tracking-wider text-sm">Anticipos</h3>
          </div>
          <p className="font-display text-2xl text-white">${Intl.NumberFormat('es-CO').format(totalAnticipos)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-900/20 to-black/40 backdrop-blur-md border border-orange-700/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💳</span>
            <h3 className="font-subheading text-orange-300 uppercase tracking-wider text-sm">Segundos Pagos</h3>
          </div>
          <p className="font-display text-2xl text-white">${Intl.NumberFormat('es-CO').format(totalSegundos)}</p>
        </div>
      </div>

      {/* Tabla de Eventos */}
      <div className="bg-gradient-to-br from-green-900/20 to-black/40 backdrop-blur-md border border-green-700/30 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl text-gradient-green">Eventos Completados</h2>
          <div className="text-right">
            <div className="font-mono text-lg text-white font-bold">{rows.length}</div>
            <div className="font-subheading text-xs text-green-300/80 uppercase tracking-wider">Total</div>
          </div>
        </div>
        <FechasTable initialData={rows} basePath="/historial" />
      </div>
    </div>
  )
}