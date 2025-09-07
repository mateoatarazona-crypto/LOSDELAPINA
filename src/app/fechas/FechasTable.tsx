"use client"
import React, { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { FechaRow } from './page'

function fmtMoney(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

// Iconos SVG
const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

// Función para obtener el color del estado
function getEstadoColor(estado: string) {
  const colors = {
    'Propuesta': 'bg-blue-100 text-blue-800 border-blue-200',
    'Negociacion': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Contratada': 'bg-green-100 text-green-800 border-green-200',
    'PendienteAnticipo': 'bg-orange-100 text-orange-800 border-orange-200',
    'Confirmada': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Ejecutada': 'bg-purple-100 text-purple-800 border-purple-200',
    'Cerrada': 'bg-gray-100 text-gray-800 border-gray-200',
    'Cancelada': 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function FechasTable({ initialData, basePath = '/fechas' }: { initialData: FechaRow[]; basePath?: string }) {
  const data = initialData
  const router = useRouter()
  const searchParams = useSearchParams()

  const [estado, setEstado] = useState<string>(searchParams.get('estado') ?? '')
  const [desde, setDesde] = useState<string>(searchParams.get('desde') ?? '')
  const [hasta, setHasta] = useState<string>(searchParams.get('hasta') ?? '')
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nuevoEstado, setNuevoEstado] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)

  const estados = useMemo(
    () => ['Propuesta','Negociacion','Contratada','PendienteAnticipo','Confirmada','Ejecutada','Cerrada','Cancelada'],
    []
  )

  const totalNegocio = useMemo(() => data.reduce((acc, it) => acc + (it.total || 0), 0), [data])

  function applyFilters() {
    const params = new URLSearchParams(searchParams?.toString())
    if (estado) params.set('estado', estado)
    else params.delete('estado')

    if (desde) params.set('desde', desde)
    else params.delete('desde')

    if (hasta) params.set('hasta', hasta)
    else params.delete('hasta')

    router.push(`${basePath}?${params.toString()}`)
  }

  async function duplicate(id: number) {
    try {
      setLoadingId(id)
      const res = await fetch(`/api/fechas/${id}/duplicate`, { method: 'POST' })
      if (!res.ok) throw new Error('Error al duplicar')
      const json = await res.json() as { id: number }
      router.push(`/fechas/${json.id}`)
    } catch (e) {
      alert('No se pudo duplicar esta fecha')
    } finally {
      setLoadingId(null)
    }
  }

  function startChangeEstado(id: number, actual: string) {
    setEditingId(id)
    setNuevoEstado(actual)
  }

  function cancelChangeEstado() {
    setEditingId(null)
    setNuevoEstado('')
  }

  async function saveChangeEstado(id: number) {
    if (!nuevoEstado) return
    try {
      setSaving(true)
      const res = await fetch(`/api/fechas/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!res.ok) throw new Error('Error al cambiar estado')
      cancelChangeEstado()
      router.refresh()
    } catch (e) {
      alert('No se pudo cambiar el estado')
    } finally {
      setSaving(false)
    }
  }

  function exportCSV() {
    const headers = [
      'ID','Fecha','Estado','Artistas','Empresario','Ciudad','Venue','Negocio','Anticipo','SegundoPago'
    ]
    const rows = data.map(r => [
      r.id,
      r.fecha,
      r.estado,
      r.artistas,
      r.empresario,
      r.ciudad ?? '',
      r.venue ?? '',
      r.total,
      r.anticipo,
      r.segundoPago,
    ])

    const csv = [headers, ...rows]
      .map(cols => cols.map(v => {
        const s = String(v)
        const needsQuotes = s.includes(',') || s.includes('"') || s.includes('\n')
        const escaped = s.replace(/"/g, '""')
        return needsQuotes ? `"${escaped}"` : escaped
      }).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fechas_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border bg-gradient-to-br from-white to-zinc-50 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-zinc-500">Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)} className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value="">Todos</option>
              {estados.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Desde</label>
            <div className="flex items-center gap-2 border rounded px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-blue-500/30">
              <CalendarIcon />
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="outline-none bg-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Hasta</label>
            <div className="flex items-center gap-2 border rounded px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-blue-500/30">
              <CalendarIcon />
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="outline-none bg-transparent" />
            </div>
          </div>
          <button onClick={applyFilters} className="px-3 py-2 text-sm rounded bg-black text-white inline-flex items-center gap-2 hover:opacity-90 transition">
            <FilterIcon />
            Aplicar
          </button>
          <div className="ml-auto">
            <button onClick={exportCSV} className="px-3 py-2 text-sm rounded border inline-flex items-center gap-2 hover:bg-zinc-50 transition">
              <DownloadIcon />
              Exportar CSV
            </button>
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-600 flex items-center gap-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 border text-zinc-700">Resultados: {data.length}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">Total negocio: {fmtMoney(totalNegocio)}</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="p-6 rounded-xl border bg-white shadow-sm text-center text-sm text-zinc-600">
          No hay fechas para los filtros aplicados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-zinc-50/60">
                <th className="py-3 pr-4 font-medium text-zinc-600 sticky top-0 bg-zinc-50/80 backdrop-blur z-10">Fecha</th>
                <th className="py-3 pr-4 font-medium text-zinc-600 sticky top-0 bg-zinc-50/80 backdrop-blur z-10">Estado</th>
                <th className="py-3 pr-4 font-medium text-zinc-600 sticky top-0 bg-zinc-50/80 backdrop-blur z-10">Artistas</th>
                <th className="py-3 pr-4 font-medium text-zinc-600 sticky top-0 bg-zinc-50/80 backdrop-blur z-10">Empresario</th>
                <th className="py-3 pr-4 font-medium text-zinc-600 sticky top-0 bg-zinc-50/80 backdrop-blur z-10">Ciudad / Venue</th>
                <th className="py-3 pr-4 font-medium text-zinc-600 text-right sticky top-0 bg-zinc-50/80 backdrop-blur z-10">Negocio</th>
                <th className="py-3 pr-4 font-medium text-zinc-600 text-right sticky top-0 bg-zinc-50/80 backdrop-blur z-10">Anticipo</th>
                <th className="py-3 pr-4 font-medium text-zinc-600 text-right sticky top-0 bg-zinc-50/80 backdrop-blur z-10">Segundo</th>
                <th className="py-3 pr-4 font-medium text-zinc-600 sticky top-0 bg-zinc-50/80 backdrop-blur z-10">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r: FechaRow) => (
                <tr key={r.id} className="border-b hover:bg-zinc-50/80 transition">
                  <td className="py-3 pr-4">{r.fecha}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${getEstadoColor(r.estado)}`}>{r.estado}</span>
                  </td>
                  <td className="py-3 pr-4">{r.artistas}</td>
                  <td className="py-3 pr-4">{r.empresario}</td>
                  <td className="py-3 pr-4">{r.ciudad} {r.venue ? `— ${r.venue}` : ''}</td>
                  <td className="py-3 pr-4 text-right">{fmtMoney(r.total)}</td>
                  <td className="py-3 pr-4 text-right">{fmtMoney(r.anticipo)}</td>
                  <td className="py-3 pr-4 text-right">{fmtMoney(r.segundoPago)}</td>
                  <td className="py-3 pr-4">
                    {editingId === r.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={nuevoEstado}
                          onChange={(e) => setNuevoEstado(e.target.value)}
                          className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        >
                          {estados.map((e) => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                        <button
                          className="inline-flex items-center gap-1 underline disabled:opacity-50"
                          onClick={() => saveChangeEstado(r.id)}
                          disabled={saving}
                        >
                          {saving ? <SpinnerIcon /> : null}
                          Guardar
                        </button>
                        <button className="underline" onClick={cancelChangeEstado}>Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <a className="inline-flex items-center gap-1 underline" href={`/fechas/${r.id}`}>
                          <EyeIcon /> Ver
                        </a>
                        <button className="inline-flex items-center gap-1 underline" onClick={() => duplicate(r.id)} disabled={loadingId === r.id}>
                          {loadingId === r.id ? <SpinnerIcon /> : <CopyIcon />}
                          {loadingId === r.id ? 'Duplicando…' : 'Duplicar'}
                        </button>
                        <button className="inline-flex items-center gap-1 underline" onClick={() => startChangeEstado(r.id, r.estado)}>
                          <EditIcon /> Estado
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}