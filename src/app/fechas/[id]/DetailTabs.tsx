'use client'

import { useState, useEffect } from 'react'
import { CategoriaGasto, TipoPago } from '@prisma/client'

// Definir listas de enums para selects
const categorias = Object.values(CategoriaGasto) as CategoriaGasto[]
const tiposPago = Object.values(TipoPago) as TipoPago[]

type Expense = {
  id: number
  categoria: CategoriaGasto
  descripcion: string | null
  monto: number
  comprobanteUrl: string | null
  createdAt: string
}

type Payment = {
  id: number
  tipo: TipoPago
  fechaPago: string | null
  metodo: string | null
  observacion: string | null
  monto: number
}

type Artist = {
  nombre: string
  porcentaje: number
}

type Props = {
  eventId: number
  totalNegociado: number
  artistas: Artist[]
}

export default function DetailTabs({ eventId, totalNegociado, artistas }: Props) {
  const [activeTab, setActiveTab] = useState('gastos')
  const [gastos, setGastos] = useState<Expense[]>([])
  const [pagos, setPagos] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddGasto, setShowAddGasto] = useState(false)
  const [newGasto, setNewGasto] = useState<{ categoria: CategoriaGasto | ''; descripcion: string; monto: number | ''; comprobanteUrl: string }>({ categoria: '', descripcion: '', monto: '', comprobanteUrl: '' })
  const [gastoEditId, setGastoEditId] = useState<number | null>(null)
  const [editGasto, setEditGasto] = useState<{ categoria: CategoriaGasto | ''; descripcion: string; monto: number | ''; comprobanteUrl: string }>({ categoria: '', descripcion: '', monto: '', comprobanteUrl: '' })
  const [gastoSaving, setGastoSaving] = useState(false)

  const [showAddPago, setShowAddPago] = useState(false)
  const [newPago, setNewPago] = useState<{ tipo: TipoPago | ''; monto: number | ''; fechaPago: string; metodo: string; observacion: string }>({ tipo: '', monto: '', fechaPago: '', metodo: '', observacion: '' })
  const [pagoEditId, setPagoEditId] = useState<number | null>(null)
  const [editPago, setEditPago] = useState<{ tipo: TipoPago | ''; monto: number | ''; fechaPago: string; metodo: string; observacion: string }>({ tipo: '', monto: '', fechaPago: '', metodo: '', observacion: '' })
  const [pagoSaving, setPagoSaving] = useState(false)
  const [pagoError, setPagoError] = useState<string | null>(null)

  const tabs = [
    { id: 'gastos', label: 'Gastos' },
    { id: 'reparto', label: 'Reparto' },
    { id: 'pagos', label: 'Pagos' },
    { id: 'historial', label: 'Historial' },
  ]

  const fetchData = async () => {
    setLoading(true)
    try {
      const [gastosRes, pagosRes] = await Promise.all([
        fetch(`/api/fechas/${eventId}/gastos`),
        fetch(`/api/fechas/${eventId}/pagos`)
      ])
      
      if (gastosRes.ok) {
        const gastosData = await gastosRes.json()
        setGastos(gastosData)
      }
      
      if (pagosRes.ok) {
        const pagosData = await pagosRes.json()
        setPagos(pagosData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [eventId])

  const fmtMoney = (v: number) => 
    new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(v)

  // Actions Gastos
  const addGasto = async () => {
    if (!newGasto.categoria || !newGasto.monto || Number(newGasto.monto) <= 0) {
      alert('Selecciona categoría y un monto > 0')
      return
    }
    try {
      setGastoSaving(true)
      const res = await fetch(`/api/fechas/${eventId}/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria: newGasto.categoria,
          descripcion: newGasto.descripcion || null,
          monto: Number(newGasto.monto),
          comprobanteUrl: newGasto.comprobanteUrl || null,
        }),
      })
      if (!res.ok) throw new Error('Error creando gasto')
      const created: Expense = await res.json()
      setGastos((prev) => [created, ...prev])
      setShowAddGasto(false)
      setNewGasto({ categoria: '', descripcion: '', monto: '', comprobanteUrl: '' })
    } catch (e) {
      console.error(e)
      alert('No se pudo crear el gasto')
    } finally {
      setGastoSaving(false)
    }
  }

  const startEditGasto = (gasto: Expense) => {
    setGastoEditId(gasto.id)
    setEditGasto({
      categoria: gasto.categoria,
      descripcion: gasto.descripcion || '',
      monto: Number(gasto.monto),
      comprobanteUrl: gasto.comprobanteUrl || '',
    })
  }

  const cancelEditGasto = () => {
    setGastoEditId(null)
    setEditGasto({ categoria: '', descripcion: '', monto: '', comprobanteUrl: '' })
  }

  const saveEditGasto = async (id: number) => {
    if (!editGasto.categoria || !editGasto.monto || Number(editGasto.monto) <= 0) {
      alert('Selecciona categoría y un monto > 0')
      return
    }
    try {
      setGastoSaving(true)
      const res = await fetch(`/api/fechas/${eventId}/gastos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria: editGasto.categoria,
          descripcion: editGasto.descripcion || null,
          monto: Number(editGasto.monto),
          comprobanteUrl: editGasto.comprobanteUrl || null,
        }),
      })
      if (!res.ok) throw new Error('Error actualizando gasto')
      const updated: Expense = await res.json()
      setGastos((prev) => prev.map((g) => (g.id === id ? updated : g)))
      cancelEditGasto()
    } catch (e) {
      console.error(e)
      alert('No se pudo actualizar el gasto')
    } finally {
      setGastoSaving(false)
    }
  }

  const deleteGasto = async (id: number) => {
    if (!confirm('¿Eliminar este gasto?')) return
    try {
      const res = await fetch(`/api/fechas/${eventId}/gastos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error eliminando gasto')
      setGastos((prev) => prev.filter((g) => g.id !== id))
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar el gasto')
    }
  }

  // Actions Pagos
  const addPago = async () => {
    if (!newPago.tipo || !newPago.monto || Number(newPago.monto) <= 0) {
      alert('Selecciona tipo y un monto > 0')
      return
    }
    // Validación cliente: no exceder saldo pendiente
    const totalPagosActual = pagos.reduce((sum, p) => sum + Number(p.monto), 0)
    const saldoDisponible = totalNegociado - totalPagosActual
    if (Number(newPago.monto) > saldoDisponible) {
      const msg = `El monto excede el saldo disponible (${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(saldoDisponible)}).`
      setPagoError(msg)
      alert(msg)
      return
    }
    try {
      setPagoSaving(true)
      const res = await fetch(`/api/fechas/${eventId}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: newPago.tipo,
          monto: Number(newPago.monto),
          fechaPago: newPago.fechaPago ? new Date(newPago.fechaPago) : null,
          metodo: newPago.metodo || null,
          observacion: newPago.observacion || null,
        }),
      })
      if (!res.ok) {
        let errMsg = 'Error creando pago'
        try {
          const data = await res.json()
          errMsg = (data?.error || data?.message || errMsg)
        } catch {
          try {
            const txt = await res.text()
            if (txt) errMsg = txt
          } catch {}
        }
        throw new Error(errMsg)
      }
      const created: Payment = await res.json()
      setPagos((prev) => [created, ...prev])
      setShowAddPago(false)
      setNewPago({ tipo: '', monto: '', fechaPago: '', metodo: '', observacion: '' })
      setPagoError(null)
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'No se pudo crear el pago')
    } finally {
      setPagoSaving(false)
    }
  }

  const startEditPago = (pago: Payment) => {
    setPagoEditId(pago.id)
    setEditPago({
      tipo: pago.tipo,
      monto: Number(pago.monto),
      fechaPago: pago.fechaPago ? new Date(pago.fechaPago).toISOString().split('T')[0] : '',
      metodo: pago.metodo || '',
      observacion: pago.observacion || '',
    })
  }

  const cancelEditPago = () => {
    setPagoEditId(null)
    setEditPago({ tipo: '', monto: '', fechaPago: '', metodo: '', observacion: '' })
  }

  const saveEditPago = async (id: number) => {
    if (!editPago.tipo || !editPago.monto || Number(editPago.monto) <= 0) {
      alert('Selecciona tipo y un monto > 0')
      return
    }
    // Validación cliente: no exceder saldo disponible considerando el pago actual
    const current = pagos.find(p => p.id === id)
    const totalPagosActual = pagos.reduce((sum, p) => sum + Number(p.monto), 0)
    const saldoDisponible = totalNegociado - (totalPagosActual - (current ? Number(current.monto) : 0))
    if (Number(editPago.monto) > saldoDisponible) {
      const msg = `El monto excede el saldo disponible (${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(saldoDisponible)}).`
      setPagoError(msg)
      alert(msg)
      return
    }
    try {
      setPagoSaving(true)
      const res = await fetch(`/api/fechas/${eventId}/pagos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: editPago.tipo,
          monto: Number(editPago.monto),
          fechaPago: editPago.fechaPago ? new Date(editPago.fechaPago) : null,
          metodo: editPago.metodo || null,
          observacion: editPago.observacion || null,
        }),
      })
      if (!res.ok) {
        let errMsg = 'Error actualizando pago'
        try {
          const data = await res.json()
          errMsg = (data?.error || data?.message || errMsg)
        } catch {
          try {
            const txt = await res.text()
            if (txt) errMsg = txt
          } catch {}
        }
        throw new Error(errMsg)
      }
      const updated: Payment = await res.json()
      setPagos((prev) => prev.map((p) => (p.id === id ? updated : p)))
      cancelEditPago()
      setPagoError(null)
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'No se pudo actualizar el pago')
    } finally {
      setPagoSaving(false)
    }
  }

  const deletePago = async (id: number) => {
    if (!confirm('¿Eliminar este pago?')) return
    try {
      const res = await fetch(`/api/fechas/${eventId}/pagos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error eliminando pago')
      setPagos((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar el pago')
    }
  }

  // Calculo reparto con porcentajes
  const calcularReparto = () => {
    const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0)
    const gananciaBruta = totalNegociado - totalGastos
    
    return artistas.map(artist => ({
      ...artist,
      gastosPorcentaje: (totalGastos * artist.porcentaje) / 100,
      gananciaNeta: (gananciaBruta * artist.porcentaje) / 100,
    }))
  }

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div></div>
    }

    switch (activeTab) {
      case 'gastos':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Gastos del evento</h3>
              <button onClick={() => setShowAddGasto((v) => !v)} className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">{showAddGasto ? 'Cerrar' : '+ Agregar gasto'}</button>
            </div>

            {showAddGasto && (
              <div className="border rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <select value={newGasto.categoria} onChange={(e) => setNewGasto((s) => ({ ...s, categoria: e.target.value as CategoriaGasto }))} className="border rounded px-2 py-1 text-sm">
                    <option value="">Categoría</option>
                    {categorias.map((c: CategoriaGasto) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input value={newGasto.descripcion} onChange={(e) => setNewGasto((s) => ({ ...s, descripcion: e.target.value }))} placeholder="Descripción" className="border rounded px-2 py-1 text-sm" />
                  <input value={newGasto.monto} onChange={(e) => setNewGasto((s) => ({ ...s, monto: e.target.value === '' ? '' : Number(e.target.value) }))} placeholder="Monto" type="number" className="border rounded px-2 py-1 text-sm" />
                  <input value={newGasto.comprobanteUrl} onChange={(e) => setNewGasto((s) => ({ ...s, comprobanteUrl: e.target.value }))} placeholder="URL comprobante (opcional)" className="border rounded px-2 py-1 text-sm" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddGasto(false)} className="px-3 py-1.5 text-sm border rounded">Cancelar</button>
                  <button disabled={gastoSaving} onClick={addGasto} className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{gastoSaving ? 'Guardando…' : 'Guardar gasto'}</button>
                </div>
              </div>
            )}
            
            {gastos.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">No hay gastos registrados</div>
            ) : (
              <div className="space-y-2">
                {gastos.map((gasto) => (
                  <div key={gasto.id} className="p-3 border rounded-lg hover:bg-zinc-50">
                    {gastoEditId === gasto.id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <select value={editGasto.categoria} onChange={(e) => setEditGasto((s) => ({ ...s, categoria: e.target.value as CategoriaGasto }))} className="border rounded px-2 py-1 text-sm">
                            <option value="">Categoría</option>
                            {categorias.map((c: CategoriaGasto) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <input value={editGasto.descripcion} onChange={(e) => setEditGasto((s) => ({ ...s, descripcion: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                          <input value={editGasto.monto} onChange={(e) => setEditGasto((s) => ({ ...s, monto: e.target.value === '' ? '' : Number(e.target.value) }))} type="number" className="border rounded px-2 py-1 text-sm" />
                          <input value={editGasto.comprobanteUrl} onChange={(e) => setEditGasto((s) => ({ ...s, comprobanteUrl: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelEditGasto} className="px-3 py-1.5 text-sm border rounded">Cancelar</button>
                          <button disabled={gastoSaving} onClick={() => saveEditGasto(gasto.id)} className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{gastoSaving ? 'Guardando…' : 'Guardar'}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{gasto.categoria}</div>
                          <div className="text-sm text-zinc-600">{gasto.descripcion || 'Sin descripción'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{fmtMoney(Number(gasto.monto))}</div>
                          <div className="text-xs text-zinc-500">{new Date(gasto.createdAt).toLocaleDateString('es-CO')}</div>
                          <div className="flex gap-3 justify-end mt-2 text-sm">
                            <button className="underline" onClick={() => startEditGasto(gasto)}>Editar</button>
                            <button className="underline text-red-600" onClick={() => deleteGasto(gasto.id)}>Eliminar</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total gastos:</span>
                    <span>{fmtMoney(gastos.reduce((sum, g) => sum + Number(g.monto), 0))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'reparto':
        const reparto = calcularReparto()
        const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0)
        const gananciaBruta = totalNegociado - totalGastos

        return (
          <div className="space-y-4">
            <h3 className="font-medium">Reparto equitativo</h3>
            
            <div className="bg-zinc-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between"><span>Total negociado:</span><span className="font-semibold">{fmtMoney(totalNegociado)}</span></div>
              <div className="flex justify-between"><span>Total gastos:</span><span className="font-semibold text-red-600">-{fmtMoney(totalGastos)}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold"><span>Ganancia bruta:</span><span>{fmtMoney(gananciaBruta)}</span></div>
            </div>

            <div className="space-y-3">
              {reparto.map((artist, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{artist.nombre}</span>
                    <span className="text-sm bg-blue-100 px-2 py-1 rounded">{artist.porcentaje}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-zinc-600">Gastos asignados:</div>
                      <div className="font-semibold text-red-600">-{fmtMoney(artist.gastosPorcentaje)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-600">Ganancia neta:</div>
                      <div className="font-semibold text-cyan-400">{fmtMoney(artist.gananciaNeta)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'pagos':
        const totalPagos = pagos.reduce((sum, p) => sum + Number(p.monto), 0)
        const saldoPendiente = totalNegociado - totalPagos
        const excedeSaldo = totalPagos > totalNegociado

        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Registro de pagos</h3>
              <button
                onClick={() => setShowAddPago((v) => !v)}
                disabled={saldoPendiente <= 0 || excedeSaldo}
                data-testid="btn-toggle-pago"
                className={`px-3 py-2 text-sm rounded text-white ${saldoPendiente <= 0 || excedeSaldo ? 'bg-gray-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}
              >
                {showAddPago ? 'Cerrar' : saldoPendiente <= 0 ? 'Saldo completo' : '+ Agregar pago'}
              </button>
            </div>

            {/* Resumen de saldo */}
            <div className={`bg-zinc-50 p-4 rounded-lg space-y-2 ${excedeSaldo ? 'border-red-300 border-2' : ''}`}>
              <div className="flex justify-between"><span>Total negociado:</span><span data-testid="summary-total-negociado" className="font-semibold">{fmtMoney(totalNegociado)}</span></div>
              <div className="flex justify-between"><span>Total pagos:</span><span data-testid="summary-total-pagos" className="font-semibold text-cyan-400">{fmtMoney(totalPagos)}</span></div>
              <div className={`border-t pt-2 flex justify-between font-bold ${excedeSaldo ? 'text-magenta-400' : saldoPendiente === 0 ? 'text-cyan-400' : 'text-blue-400'}`}>
                 <span>Saldo pendiente:</span>
                 <span data-testid="summary-saldo-pendiente">{fmtMoney(saldoPendiente)}</span>
              </div>
              {excedeSaldo && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  ⚠️ Los pagos exceden el total negociado por {fmtMoney(Math.abs(saldoPendiente))}
                </div>
              )}
            </div>

            {showAddPago && (
              <div className="border rounded-lg p-3 space-y-2" data-testid="panel-add-pago">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <select value={newPago.tipo} onChange={(e) => setNewPago((s) => ({ ...s, tipo: e.target.value as TipoPago }))} className="border rounded px-2 py-1 text-sm" data-testid="select-tipo-pago">
                    <option value="">Tipo</option>
                    {tiposPago.map((t: TipoPago) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input value={newPago.monto} onChange={(e) => setNewPago((s) => ({ ...s, monto: e.target.value === '' ? '' : Number(e.target.value) }))} placeholder="Monto" type="number" className="border rounded px-2 py-1 text-sm" data-testid="input-monto-pago" />
                  <input value={newPago.fechaPago} onChange={(e) => setNewPago((s) => ({ ...s, fechaPago: e.target.value }))} type="date" className="border rounded px-2 py-1 text-sm" data-testid="input-fecha-pago" />
                  <input value={newPago.metodo} onChange={(e) => setNewPago((s) => ({ ...s, metodo: e.target.value }))} placeholder="Método" className="border rounded px-2 py-1 text-sm" data-testid="input-metodo-pago" />
                  <input value={newPago.observacion} onChange={(e) => setNewPago((s) => ({ ...s, observacion: e.target.value }))} placeholder="Observación" className="border rounded px-2 py-1 text-sm" data-testid="input-observacion-pago" />
                </div>
                <div className="text-xs text-zinc-600">Saldo disponible: <span className="font-medium" data-testid="saldo-disponible">{fmtMoney(Math.max(0, saldoPendiente))}</span></div>
                {pagoError && <div className="text-xs text-red-600">{pagoError}</div>}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddPago(false)} className="px-3 py-1.5 text-sm border rounded">Cancelar</button>
                  <button disabled={pagoSaving || saldoPendiente <= 0} onClick={addPago} data-testid="btn-guardar-pago" className={`px-3 py-1.5 text-sm rounded text-white disabled:opacity-50 ${saldoPendiente <= 0 ? 'bg-gray-400' : 'bg-cyan-600'}`}>{pagoSaving ? 'Guardando…' : 'Guardar pago'}</button>
                </div>
              </div>
            )}
            
            {pagos.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">No hay pagos registrados</div>
            ) : (
              <div className="space-y-2">
                {pagos.map((pago) => (
                  <div key={pago.id} className="p-3 border rounded-lg hover:bg-zinc-50" data-testid="pago-item">
                    {pagoEditId === pago.id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                          <select value={editPago.tipo} onChange={(e) => setEditPago((s) => ({ ...s, tipo: e.target.value as TipoPago }))} className="border rounded px-2 py-1 text-sm">
                            <option value="">Tipo</option>
                            {tiposPago.map((t: TipoPago) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <input value={editPago.monto} onChange={(e) => setEditPago((s) => ({ ...s, monto: e.target.value === '' ? '' : Number(e.target.value) }))} type="number" className="border rounded px-2 py-1 text-sm" />
                          <input value={editPago.fechaPago} onChange={(e) => setEditPago((s) => ({ ...s, fechaPago: e.target.value }))} type="date" className="border rounded px-2 py-1 text-sm" />
                          <input value={editPago.metodo} onChange={(e) => setEditPago((s) => ({ ...s, metodo: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                          <input value={editPago.observacion} onChange={(e) => setEditPago((s) => ({ ...s, observacion: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                        </div>
                        <div className="text-xs text-zinc-600">Saldo disponible: <span className="font-medium">{fmtMoney(Math.max(0, totalNegociado - (pagos.reduce((sum, p) => sum + Number(p.monto), 0) - Number(pago.monto))) )}</span></div>
                        {pagoError && <div className="text-xs text-red-600">{pagoError}</div>}
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelEditPago} className="px-3 py-1.5 text-sm border rounded">Cancelar</button>
                          <button disabled={pagoSaving} onClick={() => saveEditPago(pago.id)} className="px-3 py-1.5 text-sm rounded bg-cyan-600 text-white disabled:opacity-50">{pagoSaving ? 'Guardando…' : 'Guardar'}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{pago.tipo}</div>
                          <div className="text-sm text-zinc-600">{pago.metodo || 'Método no especificado'}</div>
                          <div className="text-xs text-zinc-500">{pago.observacion}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{fmtMoney(Number(pago.monto))}</div>
                          <div className="text-xs text-zinc-500">{pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-CO') : 'Pendiente'}</div>
                          <div className="flex gap-3 justify-end mt-2 text-sm">
                            <button className="underline" onClick={() => startEditPago(pago)}>Editar</button>
                            <button className="underline text-red-600" onClick={() => deletePago(pago.id)}>Eliminar</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total pagos:</span>
                    <span data-testid="summary-total-pagos-footer">{fmtMoney(pagos.reduce((sum, p) => sum + Number(p.monto), 0))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'historial':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Historial de cambios</h3>
            <div className="text-center py-8 text-zinc-500">
              Funcionalidad de historial próximamente...
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="border-b">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.label}`}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  )
}