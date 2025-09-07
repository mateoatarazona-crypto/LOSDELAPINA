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
    <div className="space-y-6" style={{ background: 'var(--background)', minHeight: '100vh', padding: '2rem' }}>
      {/* Header Section */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl mb-2" style={{ color: 'var(--foreground)' }}>📅 Próximas Fechas</h1>
            <p className="font-caption text-lg" style={{ color: 'var(--foreground-secondary)' }}>Gestiona tu calendario de eventos y presentaciones</p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-bold" style={{ color: 'var(--accent)' }}>{rows.length}</div>
            <div className="font-caption text-sm uppercase tracking-wider" style={{ color: 'var(--foreground-secondary)' }}>Eventos Programados</div>
          </div>
        </div>
        
        {/* Botón Agregar Fecha Nueva */}
        <div className="mb-6">
          <a 
            href="/fechas/nueva" 
            className="btn-primary group relative block w-full p-6 transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200" style={{ background: 'var(--background-secondary)' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold mb-2">Agregar Fecha Nueva</h2>
                <p className="font-caption text-lg" style={{ color: 'var(--foreground-secondary)' }}>Programa un nuevo evento o presentación</p>
              </div>
            </div>
          </a>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">💰</span>
              Ingresos Totales
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>${Intl.NumberFormat('es-CO').format(totalIngresos)}</div>
          </div>
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">⏳</span>
              Anticipos
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>${Intl.NumberFormat('es-CO').format(totalAnticipos)}</div>
          </div>
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">✅</span>
              Confirmadas
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>{fechasConfirmadas}</div>
          </div>
          <div className="card p-4 hover:scale-[1.02] transition-all duration-200">
            <div className="font-caption text-sm uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="text-lg">⏰</span>
              Pendientes
            </div>
            <div className="font-display text-xl" style={{ color: 'var(--accent)' }}>{fechasPendientes}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between font-caption text-sm mb-2" style={{ color: 'var(--foreground-secondary)' }}>
            <span>Progreso de Confirmación</span>
            <span>{Math.round((fechasConfirmadas / rows.length) * 100)}%</span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'var(--background-secondary)' }}>
            <div 
              className="h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${(fechasConfirmadas / rows.length) * 100}%`,
                background: 'var(--gradient-primary)'
              }}
            />
          </div>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="card p-8 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: 'var(--background-secondary)' }} />
            <div className="space-y-2">
              <div className="h-6 rounded w-48 animate-pulse" style={{ background: 'var(--background-secondary)' }} />
              <div className="h-4 rounded w-32 animate-pulse" style={{ background: 'var(--background-tertiary)' }} />
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'var(--background-secondary)' }} />
            ))}
          </div>
        </div>
      }>
        <FechasTable initialData={rows} />
      </Suspense>
    </div>
  )
}