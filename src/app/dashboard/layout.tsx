import Link from 'next/link'
import { Suspense } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-white/70 dark:bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold">Fechas</Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/dashboard/financial-analysis" className="hover:underline">Análisis Financiero</Link>
            <Link href="/fechas" className="hover:underline">Próximas</Link>
            <Link href="/historial" className="hover:underline">Historial</Link>
            <Link href="/artistas" className="hover:underline">Artistas</Link>
            <Link href="/empresarios" className="hover:underline">Empresarios</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto w-full px-4 py-6">
        <Suspense>{children}</Suspense>
      </main>
    </div>
  )
}