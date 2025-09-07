'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotificationHelpers } from '@/components/NotificationSystem'

interface Artista {
  id: number
  nombre: string
}

interface Empresario {
  id: number
  nombre: string
  empresa: string | null
  telefono: string | null
  email: string | null
}

interface FormData {
  fechaEvento: string
  venue: string
  ciudad: string
  estado: string
  totalNegociado: number
  anticipo: number
  segundoPago: number
  empresarioId: number | null
  artistas: Array<{ artistaId: number; porcentaje: number }>
  notas: string
}

export default function NuevaFechaPage() {
  const router = useRouter()
  const { success, error } = useNotificationHelpers()
  
  const [artistas, setArtistas] = useState<Artista[]>([])
  const [empresarios, setEmpresarios] = useState<Empresario[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fechaEvento: '',
    venue: '',
    ciudad: '',
    estado: 'Propuesta',
    totalNegociado: 0,
    anticipo: 0,
    segundoPago: 0,
    empresarioId: null,
    artistas: [],
    notas: ''
  })

  useEffect(() => {
    // Cargar artistas y empresarios
    const loadData = async () => {
      try {
        const [artistasRes, empresariosRes] = await Promise.all([
          fetch('/api/artistas'),
          fetch('/api/empresarios')
        ])
        
        if (artistasRes.ok) {
          const artistasData = await artistasRes.json()
          setArtistas(artistasData)
        }
        
        if (empresariosRes.ok) {
          const empresariosData = await empresariosRes.json()
          setEmpresarios(empresariosData)
        }
      } catch (err) {
        console.error('Error cargando datos:', err)
      }
    }
    
    loadData()
  }, [])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArtistaChange = (index: number, field: 'artistaId' | 'porcentaje', value: number) => {
    setFormData(prev => ({
      ...prev,
      artistas: prev.artistas.map((artista, i) => 
        i === index ? { ...artista, [field]: value } : artista
      )
    }))
  }

  const addArtista = () => {
    setFormData(prev => ({
      ...prev,
      artistas: [...prev.artistas, { artistaId: 0, porcentaje: 0 }]
    }))
  }

  const removeArtista = (index: number) => {
    setFormData(prev => ({
      ...prev,
      artistas: prev.artistas.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fechaEvento || !formData.venue || !formData.ciudad) {
      error('Error', 'Por favor completa todos los campos obligatorios')
      return
    }

    if (formData.artistas.length === 0) {
      error('Error', 'Debe agregar al menos un artista')
      return
    }

    const totalPorcentajes = formData.artistas.reduce((sum, a) => sum + a.porcentaje, 0)
    if (totalPorcentajes > 100) {
      error('Error', 'La suma de porcentajes de artistas no puede exceder 100%')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/fechas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        success('Éxito', 'Fecha creada exitosamente')
        router.push('/fechas')
      } else {
        const errorData = await response.json()
        error('Error', errorData.message || 'Error al crear la fecha')
      }
    } catch (err) {
      error('Error', 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="text-purple-400 hover:text-purple-300 mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="font-display text-4xl text-white mb-2">Nueva Fecha</h1>
          <p className="text-gray-400">Crea un nuevo evento musical</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="bg-gradient-to-br from-purple-500/10 to-black/40 backdrop-blur-sm border border-purple-400/20 rounded-xl p-6">
            <h2 className="font-subheading text-xl text-white mb-6">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">Fecha del Evento *</label>
                <input
                  type="datetime-local"
                  value={formData.fechaEvento}
                  onChange={(e) => handleInputChange('fechaEvento', e.target.value)}
                  className="w-full bg-black/50 border border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  className="w-full bg-black/50 border border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none transition-colors"
                >
                  <option value="Propuesta">Propuesta</option>
                  <option value="Negociacion">Negociación</option>
                  <option value="Contratada">Contratada</option>
                  <option value="PendienteAnticipo">Pendiente Anticipo</option>
                  <option value="Confirmada">Confirmada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">Venue *</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  className="w-full bg-black/50 border border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none transition-colors"
                  placeholder="Nombre del lugar"
                  required
                />
              </div>
              
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">Ciudad *</label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  className="w-full bg-black/50 border border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none transition-colors"
                  placeholder="Ciudad del evento"
                  required
                />
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-gradient-to-br from-blue-500/10 to-black/40 backdrop-blur-sm border border-blue-400/20 rounded-xl p-6">
            <h2 className="font-subheading text-xl text-white mb-6">Información Financiera</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">Total Negociado</label>
                <input
                  type="number"
                  value={formData.totalNegociado}
                  onChange={(e) => handleInputChange('totalNegociado', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-blue-400/30 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">Anticipo</label>
                <input
                  type="number"
                  value={formData.anticipo}
                  onChange={(e) => handleInputChange('anticipo', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-blue-400/30 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">Segundo Pago</label>
                <input
                  type="number"
                  value={formData.segundoPago}
                  onChange={(e) => handleInputChange('segundoPago', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-blue-400/30 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Empresario */}
          <div className="bg-gradient-to-br from-purple-500/10 to-black/40 backdrop-blur-sm border border-purple-400/20 rounded-xl p-6">
            <h2 className="font-subheading text-xl text-white mb-6">Empresario</h2>
            
            <div>
              <label className="block text-purple-300 text-sm font-medium mb-2">Seleccionar Empresario</label>
              <select
                value={formData.empresarioId || ''}
                onChange={(e) => handleInputChange('empresarioId', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-black/50 border border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none transition-colors"
              >
                <option value="">Seleccionar empresario...</option>
                {empresarios.map(empresario => (
                  <option key={empresario.id} value={empresario.id}>
                    {empresario.nombre} {empresario.empresa && `(${empresario.empresa})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Artistas */}
          <div className="bg-gradient-to-br from-orange-500/10 to-black/40 backdrop-blur-sm border border-orange-400/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-subheading text-xl text-white">Artistas</h2>
              <button
                type="button"
                onClick={addArtista}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Artista
              </button>
            </div>
            
            {formData.artistas.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay artistas agregados. Haz clic en "Agregar Artista" para comenzar.</p>
            ) : (
              <div className="space-y-4">
                {formData.artistas.map((artista, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-orange-300 text-sm font-medium mb-2">Artista</label>
                      <select
                        value={artista.artistaId}
                        onChange={(e) => handleArtistaChange(index, 'artistaId', parseInt(e.target.value))}
                        className="w-full bg-black/50 border border-orange-400/30 rounded-lg px-4 py-3 text-white focus:border-orange-400 focus:outline-none transition-colors"
                      >
                        <option value={0}>Seleccionar artista...</option>
                        {artistas.map(a => (
                          <option key={a.id} value={a.id}>{a.nombre}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-32">
                      <label className="block text-orange-300 text-sm font-medium mb-2">Porcentaje (%)</label>
                      <input
                        type="number"
                        value={artista.porcentaje}
                        onChange={(e) => handleArtistaChange(index, 'porcentaje', parseFloat(e.target.value) || 0)}
                        className="w-full bg-black/50 border border-orange-400/30 rounded-lg px-4 py-3 text-white focus:border-orange-400 focus:outline-none transition-colors"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeArtista(index)}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                <div className="text-right text-sm text-orange-300">
                  Total porcentajes: {formData.artistas.reduce((sum, a) => sum + a.porcentaje, 0)}%
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="bg-gradient-to-br from-gray-500/10 to-black/40 backdrop-blur-sm border border-gray-400/20 rounded-xl p-6">
            <h2 className="font-subheading text-xl text-white mb-6">Notas Adicionales</h2>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Observaciones</label>
              <textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                className="w-full bg-black/50 border border-gray-400/30 rounded-lg px-4 py-3 text-white focus:border-gray-400 focus:outline-none transition-colors h-24 resize-none"
                placeholder="Información adicional sobre el evento..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-400/30 text-gray-300 rounded-lg hover:bg-gray-500/10 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Crear Fecha
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}