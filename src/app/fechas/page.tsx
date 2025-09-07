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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl text-gradient-green text-shadow-glow mb-2">📅 Próximas Fechas</h1>
            <p className="font-body text-lg text-green-200/80">Gestiona tu calendario de eventos y presentaciones</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl text-white font-bold">{rows.length}</div>
            <div className="font-subheading text-sm text-green-300/80 uppercase tracking-wider">Eventos Programados</div>
          </div>
        </div>
        
        {/* Botón Gigante Agregar Fecha Nueva */}
        <div className="mb-6">
          <a 
            href="/fechas/nueva" 
            className="group relative block w-full bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 hover:from-green-500 hover:via-green-400 hover:to-emerald-400 text-white rounded-2xl p-8 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/25 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="font-display text-3xl font-bold mb-2 group-hover:text-green-100 transition-colors">Agregar Fecha Nueva</h2>
                <p className="font-body text-green-100/80 text-lg group-hover:text-white/90 transition-colors">Programa un nuevo evento o presentación</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-700" />
          </a>
        </div>
        
        {/* Advanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-sm border border-emerald-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
            <div className="text-emerald-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">💰</span>
              Ingresos Totales
            </div>
            <div className="text-white text-xl font-display">${Intl.NumberFormat('es-CO').format(totalIngresos)}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 backdrop-blur-sm border border-amber-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
            <div className="text-amber-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">⏳</span>
              Anticipos
            </div>
            <div className="text-white text-xl font-display">${Intl.NumberFormat('es-CO').format(totalAnticipos)}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-sm border border-green-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
            <div className="text-green-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">✅</span>
              Confirmadas
            </div>
            <div className="text-white text-xl font-display">{fechasConfirmadas}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="text-blue-300 text-sm font-subheading uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-lg">⏰</span>
              Pendientes
            </div>
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