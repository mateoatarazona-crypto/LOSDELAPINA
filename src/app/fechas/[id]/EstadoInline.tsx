"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  id: number
  estado: string
}

const ESTADOS = [
  "Propuesta",
  "Negociacion",
  "Contratada",
  "PendienteAnticipo",
  "Confirmada",
  "Ejecutada",
  "Cerrada",
  "Cancelada",
]

function getEstadoColor(estado: string) {
  const colors: Record<string, string> = {
    Propuesta: "bg-blue-100 text-blue-800 border-blue-200",
    Negociacion: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Contratada: "bg-green-100 text-green-800 border-green-200",
    PendienteAnticipo: "bg-orange-100 text-orange-800 border-orange-200",
    Confirmada: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Ejecutada: "bg-purple-100 text-purple-800 border-purple-200",
    Cerrada: "bg-gray-100 text-gray-800 border-gray-200",
    Cancelada: "bg-red-100 text-red-800 border-red-200",
  }
  return colors[estado] || "bg-gray-100 text-gray-800 border-gray-200"
}

// Mapa de transiciones válidas, igual que en API, para UX
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Propuesta: ["Negociacion", "Cancelada"],
  Negociacion: ["Contratada", "Cancelada"],
  Contratada: ["PendienteAnticipo", "Cancelada"],
  PendienteAnticipo: ["Confirmada", "Cancelada"],
  Confirmada: ["Ejecutada", "Cancelada"],
  Ejecutada: ["Cerrada"],
  Cerrada: [],
  Cancelada: [],
}

export default function EstadoInline({ id, estado }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState<string>(estado)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    try {
      setError(null)
      if (!selected) return

      // Confirmaciones UX según transición de riesgo
      if (selected === 'Cancelada') {
        const ok = confirm('¿Seguro que deseas cancelar este evento? Esta acción es sensible y puede afectar reportes.')
        if (!ok) return
      }
      if (selected === 'Cerrada') {
        const ok = confirm('Vas a cerrar el evento. Verifica que los pagos cubran el total negociado. ¿Continuar?')
        if (!ok) return
      }

      // Validar transición en cliente para mejor UX (servidor también valida)
      const allowed = (ALLOWED_TRANSITIONS as any)[estado] || []
      if (!allowed.includes(selected)) {
        alert(`Transición inválida: ${estado} → ${selected}`)
        return
      }

      setSaving(true)
      const res = await fetch(`/api/fechas/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: selected }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'No se pudo actualizar el estado' }))
        throw new Error(err.error || 'No se pudo actualizar el estado')
      }
      setEditing(false)
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Error guardando el estado')
      alert(e?.message || 'Error guardando el estado')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${getEstadoColor(estado)}`}>
          {estado}
        </span>
        <button className="text-xs underline" onClick={() => setEditing(true)}>Editar</button>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={saving}
        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      >
        {/* Mostrar sólo transiciones válidas desde el estado actual */}
        {((ALLOWED_TRANSITIONS as any)[estado] || []).concat([]).map((e: string) => (
          <option key={e} value={e}>{e}</option>
        ))}
      </select>
      <button onClick={save} disabled={saving} className="text-xs underline disabled:opacity-50">
        {saving ? "Guardando…" : "Guardar"}
      </button>
      <button onClick={() => setEditing(false)} disabled={saving} className="text-xs underline">Cancelar</button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}