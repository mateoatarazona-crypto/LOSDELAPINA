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
    setData(json.map((e: { id: number; nombre: string; empresa: string | null; ciudad: string | null; pais: string | null; email: string | null; telefono: string | null; nit: string | null; notas: string | null; _count: { fechas: number } }) => ({
      id: e.id,
      nombre: e.nombre,
      empresa: e.empresa ?? null,
      ciudad: e.ciudad ?? null,
      pais: e.pais ?? null,
      email: e.email ?? null,
      telefono: e.telefono ?? null,
      nit: e.nit ?? null,
      notas: e.notas ?? null,
      fechasCount: e._count.fechas,
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
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo eliminar (puede tener fechas asociadas)'
      alert(message)
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
            <button disabled={saving} onClick={create} className="px-3 py-2 text-sm rounded bg-cyan-600 text-white disabled:opacity-50">Guardar</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left border-b bg-zinc-50/60">
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600">Nombre</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden sm:table-cell">Empresa</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden md:table-cell">Ciudad</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden lg:table-cell">País</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden xl:table-cell">Email</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden xl:table-cell">Teléfono</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden 2xl:table-cell">NIT</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden 2xl:table-cell">Notas</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 text-right">Fechas</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b hover:bg-zinc-50/50">
                <td className="py-2 sm:py-3 pr-2 sm:pr-4">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1.5 text-sm w-full" value={editForm.nombre} onChange={ev => setEditForm({ ...editForm, nombre: ev.target.value })} />
                  ) : (
                    <div className="min-w-0">
                      <span className="font-medium text-xs sm:text-sm truncate block">{e.nombre}</span>
                      <div className="sm:hidden text-xs text-zinc-500 space-y-1">
                        {e.empresa && <div>Empresa: {e.empresa}</div>}
                        {e.ciudad && <div>Ciudad: {e.ciudad}</div>}
                        {e.email && <div className="truncate">Email: {e.email}</div>}
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden sm:table-cell">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1.5 text-sm w-full" value={editForm.empresa} onChange={ev => setEditForm({ ...editForm, empresa: ev.target.value })} />
                  ) : (
                    <span className="text-zinc-600 truncate block max-w-32">{e.empresa || '-'}</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden md:table-cell">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1.5 text-sm w-full" value={editForm.ciudad} onChange={ev => setEditForm({ ...editForm, ciudad: ev.target.value })} />
                  ) : (
                    <span className="text-zinc-600 truncate block max-w-24">{e.ciudad || '-'}</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden lg:table-cell">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1.5 text-sm w-full" value={editForm.pais} onChange={ev => setEditForm({ ...editForm, pais: ev.target.value })} />
                  ) : (
                    <span className="text-zinc-600 truncate block max-w-24">{e.pais || '-'}</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden xl:table-cell">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1.5 text-sm w-full" value={editForm.email} onChange={ev => setEditForm({ ...editForm, email: ev.target.value })} />
                  ) : (
                    <span className="text-zinc-600 truncate block max-w-32">{e.email || '-'}</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden xl:table-cell">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1.5 text-sm w-full" value={editForm.telefono} onChange={ev => setEditForm({ ...editForm, telefono: ev.target.value })} />
                  ) : (
                    <span className="text-zinc-600 truncate block max-w-28">{e.telefono || '-'}</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden 2xl:table-cell">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1.5 text-sm w-full" value={editForm.nit} onChange={ev => setEditForm({ ...editForm, nit: ev.target.value })} />
                  ) : (
                    <span className="text-zinc-600 truncate block max-w-24">{e.nit || '-'}</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden 2xl:table-cell">
                  {editingId === e.id ? (
                    <input className="border rounded px-2 py-1.5 text-sm w-full" value={editForm.notas} onChange={ev => setEditForm({ ...editForm, notas: ev.target.value })} />
                  ) : (
                    <span className="text-zinc-600 truncate block max-w-32">{e.notas || '-'}</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 text-right">
                  <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {e.fechasCount}
                  </span>
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4">
                  {editingId === e.id ? (
                    <div className="flex gap-1 sm:gap-2">
                      <button disabled={saving} onClick={() => saveEdit(e.id)} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm px-1 sm:px-2 py-1 rounded">Guardar</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm px-1 sm:px-2 py-1 rounded">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex gap-1 sm:gap-2">
                      <button onClick={() => startEdit(e)} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm px-1 sm:px-2 py-1 rounded">Editar</button>
                      <button onClick={() => remove(e.id)} className="text-red-600 hover:text-red-800 text-xs sm:text-sm px-1 sm:px-2 py-1 rounded">Eliminar</button>
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