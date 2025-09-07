import { Suspense } from 'react'
import Calendar from '@/components/Calendar'

export const dynamic = 'force-dynamic'

export default function CalendarioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/20 to-black p-4 md:p-8">
      {/* Hero Section */}
      <div className="relative mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 blur-3xl" />
        <div className="relative bg-black/30 backdrop-blur-sm border border-green-700/30 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 text-glow-green">
            Calendario de Presentaciones
          </h1>
          <p className="font-subheading text-green-300/80 text-lg md:text-xl max-w-2xl mx-auto">
            Organiza y gestiona todas tus fechas de presentación en un calendario interactivo
          </p>
        </div>
      </div>

      {/* Calendar Component */}
      <Suspense fallback={
        <div className="bg-black/20 backdrop-blur-sm border border-green-700/30 rounded-xl p-8 animate-pulse">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-green-500/20 rounded w-48 animate-pulse" />
              <div className="h-4 bg-green-500/10 rounded w-32 animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 bg-green-500/10 rounded animate-pulse" />
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 bg-green-500/10 rounded animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <Calendar />
      </Suspense>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-sm border border-green-400/20 rounded-xl p-6 hover:scale-105 transition-all duration-300 group hover:shadow-lg hover:shadow-green-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-subheading text-white text-lg font-semibold">Agregar Evento</h3>
              <p className="text-green-300/80 text-sm">Programa una nueva presentación</p>
            </div>
          </div>
          <p className="text-green-300/60 text-sm font-mono">
            Haz clic en cualquier día del calendario para agregar un nuevo evento
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 backdrop-blur-sm border border-amber-400/20 rounded-xl p-6 hover:scale-105 transition-all duration-300 group hover:shadow-lg hover:shadow-amber-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-subheading text-white text-lg font-semibold">Estados</h3>
              <p className="text-amber-300/80 text-sm">Gestiona el estado de tus eventos</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-mono border border-emerald-400/30">
              Confirmada
            </span>
            <span className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-mono border border-amber-400/30">
              Pendiente
            </span>
            <span className="bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-mono border border-red-400/30">
              Cancelada
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-6 hover:scale-105 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-subheading text-white text-lg font-semibold">Información</h3>
              <p className="text-blue-300/80 text-sm">Detalles de cada evento</p>
            </div>
          </div>
          <p className="text-blue-300/60 text-sm font-mono">
            Cada evento puede incluir artista, ubicación, hora y notas adicionales
          </p>
        </div>
      </div>
    </div>
  )
}