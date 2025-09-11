'use client'
import { useMemo, useState } from 'react'
import { FileUpload, useFileUpload } from '@/components/ui/file-upload'
import { Button } from '@/components/ui/button'
import { Image } from 'lucide-react'
import type { ArtistaRow } from './page'

export default function ArtistasTable({ initialData }: { initialData: ArtistaRow[] }) {
  const [data, setData] = useState<ArtistaRow[]>(initialData)
  const [q, setQ] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ nombre: '', genero: '', representante: '', contacto: '', notas: '' })
  const [editForm, setEditForm] = useState({ nombre: '', genero: '', representante: '', contacto: '', notas: '' })
  const { files: photoFiles, handleFilesChange: handlePhotoChange, clearFiles: clearPhotoFiles } = useFileUpload()
  const { files: contractFiles, handleFilesChange: handleContractChange, clearFiles: clearContractFiles } = useFileUpload()

  const filtered = useMemo(() => data.filter(d => d.nombre.toLowerCase().includes(q.toLowerCase())), [data, q])

  async function refresh() {
    const res = await fetch('/api/artistas')
    const json = await res.json()
    setData(json.map((a: any) => ({
      id: a.id,
      nombre: a.nombre,
      genero: a.genero ?? null,
      representante: a.representante ?? null,
      contacto: a.contacto ?? null,
      notas: a.notas ?? null,
      fotoUrl: a.fotoUrl ?? null,
      contratoUrl: a.contratoUrl ?? null,
      fechasCount: a._count?.fechas ?? 0,
    })))
  }

  async function create() {
    if (!form.nombre.trim()) return alert('Nombre es requerido')
    setSaving(true)
    try {
      const res = await fetch('/api/artistas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('create failed')
      setForm({ nombre: '', genero: '', representante: '', contacto: '', notas: '' })
      clearPhotoFiles()
      clearContractFiles()
      setShowAdd(false)
      await refresh()
    } catch (e) {
      alert('No se pudo crear')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(a: ArtistaRow) {
    setEditingId(a.id)
    setEditForm({ nombre: a.nombre, genero: a.genero || '', representante: a.representante || '', contacto: a.contacto || '', notas: a.notas || '' })
  }

  async function saveEdit(id: number) {
    setSaving(true)
    try {
      const res = await fetch(`/api/artistas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
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
    if (!confirm('¿Eliminar artista?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/artistas/${id}`, { method: 'DELETE' })
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
        <button onClick={() => setShowAdd(v => !v)} className="ml-auto px-3 py-2 text-sm rounded bg-black text-white">{showAdd ? 'Cerrar' : 'Agregar artista'}</button>
      </div>

      {showAdd && (
        <div className="p-4 rounded-xl border bg-zinc-50 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Nombre" className="border rounded px-2 py-1.5 text-sm" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            <input placeholder="Género" className="border rounded px-2 py-1.5 text-sm" value={form.genero} onChange={e => setForm({ ...form, genero: e.target.value })} />
            <input placeholder="Representante" className="border rounded px-2 py-1.5 text-sm" value={form.representante} onChange={e => setForm({ ...form, representante: e.target.value })} />
            <input placeholder="Contacto" className="border rounded px-2 py-1.5 text-sm" value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} />
            <input placeholder="Notas" className="border rounded px-2 py-1.5 text-sm" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} />
          </div>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-2">
                <Image className="w-4 h-4" />
                Foto del Artista
              </label>
              <FileUpload
                onFilesChange={handlePhotoChange}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                maxFiles={1}
                maxSize={5}
                className="border-2 border-dashed border-zinc-300 rounded-lg p-4"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-2">
                <Image className="w-4 h-4" />
                Contrato/Documentos
              </label>
              <FileUpload
                onFilesChange={handleContractChange}
                acceptedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                maxFiles={3}
                maxSize={10}
                className="border-2 border-dashed border-zinc-300 rounded-lg p-4"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button disabled={saving} onClick={create} className="bg-cyan-600 hover:bg-cyan-700">
              {saving ? 'Guardando...' : 'Guardar Artista'}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left border-b bg-zinc-50/60">
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600">Nombre</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden sm:table-cell">Género</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden md:table-cell">Representante</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden lg:table-cell">Contacto</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 hidden xl:table-cell">Notas</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600 text-right">Fechas</th>
              <th className="py-2 sm:py-3 pr-2 sm:pr-4 font-medium text-zinc-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b hover:bg-zinc-50/50">
                <td className="py-2 sm:py-3 pr-2 sm:pr-4">
                  {editingId === a.id ? (
                    <input className="border rounded px-2 py-1 text-sm w-full" value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} />
                  ) : (
                     <div className="flex items-center gap-2 sm:gap-3">
                       <div className="min-w-0">
                         <span className="font-medium text-xs sm:text-sm truncate block">{a.nombre}</span>
                         <div className="sm:hidden text-xs text-zinc-500 space-y-1">
                           {a.genero && <div>Género: {a.genero}</div>}
                           {a.representante && <div className="truncate">Rep: {a.representante}</div>}
                         </div>
                       </div>
                     </div>
                   )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden sm:table-cell">
                  {editingId === a.id ? (
                    <input className="border rounded px-2 py-1 text-sm w-full" value={editForm.genero} onChange={e => setEditForm({ ...editForm, genero: e.target.value })} />
                  ) : (a.genero || '-')}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden md:table-cell">
                  {editingId === a.id ? (
                    <input className="border rounded px-2 py-1 text-sm w-full" value={editForm.representante} onChange={e => setEditForm({ ...editForm, representante: e.target.value })} />
                  ) : (
                    <span className="truncate max-w-32 block text-zinc-600">{a.representante || '-'}</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden lg:table-cell">
                  {editingId === a.id ? (
                    <input className="border rounded px-2 py-1 text-sm w-full" value={editForm.contacto} onChange={e => setEditForm({ ...editForm, contacto: e.target.value })} />
                  ) : (
                    <span className="truncate max-w-32 block text-zinc-600">{a.contacto || '-'}</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 hidden xl:table-cell">
                  {editingId === a.id ? (
                    <input className="border rounded px-2 py-1 text-sm w-full" value={editForm.notas} onChange={e => setEditForm({ ...editForm, notas: e.target.value })} />
                  ) : (
                    <span className="truncate max-w-32 block text-zinc-600">{a.notas || '-'}</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4 text-right">
                  <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {a.fechasCount}
                  </span>
                </td>
                <td className="py-2 sm:py-3 pr-2 sm:pr-4">
                  {editingId === a.id ? (
                    <div className="flex gap-1 sm:gap-2">
                      <button disabled={saving} onClick={() => saveEdit(a.id)} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm px-1 sm:px-2 py-1 rounded">Guardar</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm px-1 sm:px-2 py-1 rounded">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex gap-1 sm:gap-2">
                      <button onClick={() => startEdit(a)} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm px-1 sm:px-2 py-1 rounded">Editar</button>
                      <button onClick={() => remove(a.id)} className="text-red-600 hover:text-red-800 text-xs sm:text-sm px-1 sm:px-2 py-1 rounded">Eliminar</button>
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