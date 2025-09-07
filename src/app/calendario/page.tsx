import { Suspense } from 'react'
import Calendar from '@/components/Calendar'

export const dynamic = 'force-dynamic'

export default function CalendarioPage() {
  return (
    <div className="min-h-screen space-y-6 p-4 md:p-8" style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <div className="card p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--background-secondary)' }}>
          <svg className="w-8 h-8" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Calendario de Presentaciones
        </h1>
        <p className="font-caption text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--foreground-secondary)' }}>
          Organiza y gestiona todas tus fechas de presentación en un calendario interactivo
        </p>
      </div>

      {/* Calendar Component */}
      <Suspense fallback={
        <div className="card p-8 animate-pulse">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: 'var(--background-secondary)' }} />
            <div className="space-y-2">
              <div className="h-6 rounded w-48 animate-pulse" style={{ background: 'var(--background-secondary)' }} />
              <div className="h-4 rounded w-32 animate-pulse" style={{ background: 'var(--background-tertiary)' }} />
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'var(--background-tertiary)' }} />
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 rounded animate-pulse" style={{ background: 'var(--background-tertiary)' }} />
            ))}
          </div>
        </div>
      }>
        <Calendar />
      </Suspense>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 hover:scale-[1.02] transition-all duration-200 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300" style={{ background: 'var(--background-secondary)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-caption text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Agregar Evento</h3>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Programa una nueva presentación</p>
            </div>
          </div>
          <p className="text-sm font-mono" style={{ color: 'var(--foreground-secondary)' }}>
            Haz clic en cualquier día del calendario para agregar un nuevo evento
          </p>
        </div>

        <div className="card p-6 hover:scale-[1.02] transition-all duration-200 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300" style={{ background: 'var(--background-secondary)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-caption text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Estados</h3>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Gestiona el estado de tus eventos</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: 'var(--background-secondary)', color: 'var(--accent)' }}>
              Confirmada
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: 'var(--background-secondary)', color: 'var(--accent)' }}>
              Pendiente
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: 'var(--background-secondary)', color: 'var(--accent)' }}>
              Cancelada
            </span>
          </div>
        </div>

        <div className="card p-6 hover:scale-[1.02] transition-all duration-200 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300" style={{ background: 'var(--background-secondary)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-caption text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Información</h3>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Detalles de cada evento</p>
            </div>
          </div>
          <p className="text-sm font-mono" style={{ color: 'var(--foreground-secondary)' }}>
            Cada evento puede incluir artista, ubicación, hora y notas adicionales
          </p>
        </div>
      </div>
    </div>
  )
}