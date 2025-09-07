'use client'
import { useMemo, useState } from 'react'
import type { EmpresarioRow } from './page'

export default function EmpresariosTable({ initialData }: { initialData: EmpresarioRow[] }) {
  const [data, setData] = useState<EmpresarioRow[]>(initialData)
  const [q, setQ] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ nombre: '', empresa: '', ciudad: '', pais: '', email: '', telefono: '', nit: '', notas: '' })
  const [editForm, setEditForm] = useState({ nombre: '', empresa: '', ciudad: '', pais: '', email: '', telefono: '', nit: '', notas: '' })

  const filtered = useMemo(() => data.filter(d => d.nombre.toLowerCase().includes(q.toLowerCase())), [data, q])

  async function refresh() {
    const res = await fetch('/api/empresarios')
    const json = await res.json()
    setData(json.map((e: any) => ({
      id: e.id,
      nombre: e.nombre,
      empresa: e.empresa ?? null,
      ciudad: e.ciudad ?? null,
      pais: e.pais ?? null,
      email: e.email ?? null,
      telefono: e.telefono ?? null,
      nit: e.nit ?? null,
      notas: e.notas ?? null,
      fechasCount: e._count?.fechas ?? 0,
    })))
  }

  async function create() {
    if (!form.nombre.trim()) return alert('Nombre es requerido')
    setSaving(true)
    try {
      const res = await fetch('/api/empresarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('create failed')
      setForm({ nombre: '', empresa: '', ciudad: '', pais: '', email: '', telefono: '', nit: '', notas: '' })
      setShowAdd(false)
      await refresh()
    } catch (e) {
      alert('No se pudo crear')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(e: EmpresarioRow) {
    setEditingId(e.id)
    setEditForm({
      nombre: e.nombre || '',
      empresa: e.empresa || '',
      ciudad: e.ciudad || '',
      pais: e.pais || '',
      email: e.email || '',
      telefono: e.telefono || '',
      nit: e.nit || '',
      notas: e.notas || '',
    })
  }

  async function saveEdit(id: number) {
    setSaving(true)
    try {
      const res = await fetch(`/api/empresarios/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
      if (!res.ok) throw new Error('update failed')
      setEditingId(null)
      await refresh()
    } catch (e) {
      alert('No se pudo actualizar')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    if (!confirm('¿Eliminar empresario?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/empresarios/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || 'delete failed')
      }
      await refresh()
    } catch (e: any) {
      alert(e.message || 'No se pudo eliminar (puede tener fechas asociadas)')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border bg-white shadow-sm flex gap-3 items-end">
        <div>
          <label className="block text-xs text-zinc-500">Buscar</label>
          <input value={q} onChange={e => setQ(e.target.value)} className="border rounded px-2 py-1.5 text-sm" placeholder="Nombre…" />
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="ml-auto px-3 py-2 text-sm rounded bg-black text-white">{showAdd ? 'Cerrar' : 'Agregar empresario'}</button>
      </div>

      {showAdd && (
        <div className="p-4 rounded-xl border bg-zinc-50 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Nombre" className="border rounded px-2 py-1.5 text-sm" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            <input placeholder="Empresa" className="border rounded px-2 py-1.5 text-sm" value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} />
            <input placeholder="Ciudad" className="border rounded px-2 py-1.5 text-sm" value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} />
            <input placeholder="País" className="border rounded px-2 py-1.5 text-sm" value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })} />
            <input placeholder="Email" className="border rounded px-2 py-1.5 text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Teléfono" className="border rounded px-2 py-1.5 text-sm" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
            <input placeholder="NIT" className="border rounded px-2 py-1.5 text-sm" value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} />
            <input placeholder="Notas" className="border rounded px-2 py-1.5 text-sm" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} />
          </div>
          <div className="mt-3">
            <button disabled={saving} onClick={create} className="px-3 py-2 text-sm rounded bg-emerald-600 text-white disabled:opacity-50">Guardar</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b bg-zinc-50/60">
              <th className="py-3 pr-4 font-medium text-zinc-600">Nombre</th>
              <th className="py-3 pr-4 font-medium text-zinc-600">Empresa</th>
              <th className="py-3 pr-4 font-medium text-zinc-600">Ciudad</th>
              <th className="py-3 pr-4 font-medium text-zinc-600">País</th>
              <th className="py-3 pr-4 font-medium text-zinc-600">Email</th>
              <th className="py-3 pr-4 font-medium text-zinc-600">Teléfono</th>
              <th className="py-3 pr-4 font-medium text-zinc-600">NIT</th>
              <th className="py-3 pr-4 font-medium text-zinc-600">Notas</th>
              <th className="py-3 pr-4 font-medium text-zinc-600 text-right">Fechas</th>
              <th className="py-3 pr-4 font-medium text-zinc-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b">
                <td className="py-3 pr-4">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1 text-sm" value={editForm.nombre} onChange={ev => setEditForm({ ...editForm, nombre: ev.target.value })} />
                  ) : e.nombre}
                </td>
                <td className="py-3 pr-4">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1 text-sm" value={editForm.empresa} onChange={ev => setEditForm({ ...editForm, empresa: ev.target.value })} />
                  ) : (e.empresa || '')}
                </td>
                <td className="py-3 pr-4">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1 text-sm" value={editForm.ciudad} onChange={ev => setEditForm({ ...editForm, ciudad: ev.target.value })} />
                  ) : (e.ciudad || '')}
                </td>
                <td className="py-3 pr-4">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1 text-sm" value={editForm.pais} onChange={ev => setEditForm({ ...editForm, pais: ev.target.value })} />
                  ) : (e.pais || '')}
                </td>
                <td className="py-3 pr-4">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1 text-sm" value={editForm.email} onChange={ev => setEditForm({ ...editForm, email: ev.target.value })} />
                  ) : (e.email || '')}
                </td>
                <td className="py-3 pr-4">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1 text-sm" value={editForm.telefono} onChange={ev => setEditForm({ ...editForm, telefono: ev.target.value })} />
                  ) : (e.telefono || '')}
                </td>
                <td className="py-3 pr-4">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1 text-sm" value={editForm.nit} onChange={ev => setEditForm({ ...editForm, nit: ev.target.value })} />
                  ) : (e.nit || '')}
                </td>
                <td className="py-3 pr-4">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1 text-sm" value={editForm.notas} onChange={ev => setEditForm({ ...editForm, notas: ev.target.value })} />
                  ) : (e.notas || '')}
                </td>
                <td className="py-3 pr-4 text-right">{e.fechasCount}</td>
                <td className="py-3 pr-4">
                  {editingId === e.id ? (
                    <div className="flex gap-2">
                      <button disabled={saving} onClick={() => saveEdit(e.id)} className="underline">Guardar</button>
                      <button onClick={() => setEditingId(null)} className="underline">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(e)} className="underline">Editar</button>
                      <button onClick={() => remove(e.id)} className="underline text-red-600">Eliminar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}