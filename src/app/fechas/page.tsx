import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import FechasTable from './FechasTable'
import { Suspense } from 'react'
import ExpenseManager from '@/components/ExpenseManager'

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

async function getFechas(sp: Record<string, string | string[] | undefined>): Promise<FechaRow[]> {
  const getFirst = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v
  const estado = getFirst(sp.estado) ?? undefined
  const desdeStr = getFirst(sp.desde)
  const hastaStr = getFirst(sp.hasta)
  const desde = desdeStr ? new Date(desdeStr) : undefined
  const hasta = hastaStr ? new Date(hastaStr) : undefined

  const today = new Date()
  const where: any = {
    fechaEvento: { gte: desde ?? new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
    estado: {
      in: ['Propuesta','Negociacion','Contratada','PendienteAnticipo','Confirmada'],
    },
  }
  if (hasta) where.fechaEvento.lte = hasta
  if (estado) where.estado = estado as any

  const eventos = await prisma.event.findMany({
    where,
    orderBy: { fechaEvento: 'asc' },
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

export default async function FechasPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const rows = await getFechas(sp)
  
  // Calcular estadísticas
  const totalIngresos = rows.reduce((sum, row) => sum + row.total, 0)
  const totalAnticipos = rows.reduce((sum, row) => sum + row.anticipo, 0)
  const fechasConfirmadas = rows.filter(row => row.estado === 'Confirmada').length
  const fechasPendientes = rows.filter(row => ['Propuesta', 'Negociacion'].includes(row.estado)).length
  
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-green-900/30 to-black/50 backdrop-blur-sm border border-green-700/20 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-4xl text-gradient-green text-shadow-glow mb-2">📅 Próximas Fechas</h1>
            <p className="font-body text-lg text-green-200/80">Gestiona tu calendario de eventos y presentaciones</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl text-white font-bold">{rows.length}</div>
            <div className="font-subheading text-sm text-green-300/80 uppercase tracking-wider">Eventos Programados</div>
          </div>
        </div>
        
        {/* Advanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="glass rounded-xl p-4 hover-lift pulse-glow">
            <div className="text-green-400 text-sm font-subheading uppercase tracking-wider mb-1">Ingresos Totales</div>
            <div className="text-white text-xl font-display">${Intl.NumberFormat('es-CO').format(totalIngresos)}</div>
          </div>
          <div className="glass rounded-xl p-4 hover-lift">
            <div className="text-green-400 text-sm font-subheading uppercase tracking-wider mb-1">Anticipos</div>
            <div className="text-white text-xl font-display">${Intl.NumberFormat('es-CO').format(totalAnticipos)}</div>
          </div>
          <div className="glass rounded-xl p-4 hover-lift">
            <div className="text-green-400 text-sm font-subheading uppercase tracking-wider mb-1">Confirmadas</div>
            <div className="text-white text-xl font-display">{fechasConfirmadas}</div>
          </div>
          <div className="glass rounded-xl p-4 hover-lift">
            <div className="text-green-400 text-sm font-subheading uppercase tracking-wider mb-1">Pendientes</div>
            <div className="text-white text-xl font-display">{fechasPendientes}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm font-subheading text-green-300/80 mb-2">
            <span>Progreso de Confirmación</span>
            <span>{Math.round((fechasConfirmadas / rows.length) * 100)}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(fechasConfirmadas / rows.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="glass rounded-xl p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="font-body text-green-200/80">Cargando fechas...</div>
        </div>
      }>
        <FechasTable initialData={rows} />
      </Suspense>
    </div>
  )
}