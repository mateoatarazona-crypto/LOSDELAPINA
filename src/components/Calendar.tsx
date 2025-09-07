'use client'

import { useState, useEffect } from 'react'
import { useNotificationHelpers } from './NotificationSystem'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  artist: string
  status: 'confirmada' | 'pendiente' | 'cancelada'
  notes?: string
  createdAt: Date
}

interface CalendarProps {
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  className?: string
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const STATUS_CONFIG = {
  confirmada: { label: 'Confirmada', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  pendiente: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  cancelada: { label: 'Cancelada', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
}

export default function Calendar({ onEventAdd, onEventUpdate, onEventDelete, className = "" }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    location: '',
    artist: '',
    status: 'pendiente' as CalendarEvent['status'],
    notes: ''
  })
  const { success, error } = useNotificationHelpers()

  // Cargar eventos del localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar_events')
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        createdAt: new Date(event.createdAt)
      }))
      setEvents(parsedEvents)
    }
  }, [])

  // Guardar eventos en localStorage
  useEffect(() => {
    localStorage.setItem('calendar_events', JSON.stringify(events))
  }, [events])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getEventsForDate = (dateString: string) => {
    return events.filter(event => event.date === dateString)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(dateString)
    setIsAddingEvent(true)
  }

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title.trim() || !newEvent.time || !newEvent.artist.trim()) {
      error('Error', 'Por favor completa todos los campos obligatorios')
      return
    }

    const event: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title.trim(),
      date: selectedDate,
      time: newEvent.time,
      location: newEvent.location.trim(),
      artist: newEvent.artist.trim(),
      status: newEvent.status,
      notes: newEvent.notes.trim(),
      createdAt: new Date()
    }

    setEvents(prev => [...prev, event])
    onEventAdd?.(event)
    resetForm()
    success('Evento agregado', `${event.title} programado para ${new Date(event.date).toLocaleDateString()}`)
  }

  const handleUpdateEvent = () => {
    if (!editingEvent || !newEvent.title.trim() || !newEvent.time || !newEvent.artist.trim()) {
      error('Error', 'Por favor completa todos los campos obligatorios')
      return
    }

    const updatedEvent: CalendarEvent = {
      ...editingEvent,
      title: newEvent.title.trim(),
      time: newEvent.time,
      location: newEvent.location.trim(),
      artist: newEvent.artist.trim(),
      status: newEvent.status,
      notes: newEvent.notes.trim()
    }

    setEvents(prev => prev.map(event => event.id === editingEvent.id ? updatedEvent : event))
    onEventUpdate?.(updatedEvent)
    resetForm()
    success('Evento actualizado', `${updatedEvent.title} ha sido modificado`)
  }

  const handleDeleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    setEvents(prev => prev.filter(e => e.id !== eventId))
    onEventDelete?.(eventId)
    if (event) {
      success('Evento eliminado', `${event.title} ha sido eliminado del calendario`)
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setNewEvent({
      title: event.title,
      time: event.time,
      location: event.location,
      artist: event.artist,
      status: event.status,
      notes: event.notes || ''
    })
    setSelectedDate(event.date)
    setIsAddingEvent(true)
  }

  const resetForm = () => {
    setNewEvent({
      title: '',
      time: '',
      location: '',
      artist: '',
      status: 'pendiente',
      notes: ''
    })
    setIsAddingEvent(false)
    setEditingEvent(null)
    setSelectedDate(null)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Días vacíos del mes anterior
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 border border-green-700/10"></div>
      )
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(dateString)
      const isToday = dateString === new Date().toISOString().split('T')[0]
      const isSelected = dateString === selectedDate

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-12 border border-green-700/10 cursor-pointer hover:bg-green-500/10 transition-colors duration-200 relative p-1 ${
            isToday ? 'bg-green-500/20 border-green-500/50' : ''
          } ${
            isSelected ? 'bg-green-500/30 border-green-500/70' : ''
          }`}
        >
          <span className={`text-xs font-mono ${
            isToday ? 'text-green-400 font-bold' : 'text-white'
          }`}>
            {day}
          </span>
          
          {dayEvents.length > 0 && (
            <div className="absolute bottom-1 left-1 right-1">
              <div className="flex gap-1 flex-wrap">
                {dayEvents.slice(0, 2).map((event, index) => (
                  <div
                    key={event.id}
                    className={`w-2 h-2 rounded-full ${
                      event.status === 'confirmada' ? 'bg-green-400' :
                      event.status === 'pendiente' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                  />
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-xs text-green-300">+{dayEvents.length - 2}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className={`bg-black/20 backdrop-blur-sm border border-green-700/30 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-subheading text-white text-lg font-semibold">Calendario de Presentaciones</h3>
            <p className="text-green-300/80 text-sm font-mono">Gestiona tus fechas</p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 p-2 rounded-lg transition-all duration-200 border border-green-500/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h4 className="font-subheading text-white text-xl font-semibold">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        
        <button
          onClick={handleNextMonth}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 p-2 rounded-lg transition-all duration-200 border border-green-500/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {DAYS.map(day => (
            <div key={day} className="h-8 flex items-center justify-center">
              <span className="text-green-300 text-xs font-mono font-semibold">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0 border border-green-700/30 rounded-lg overflow-hidden">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Event Form */}
      {isAddingEvent && (
        <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-4 mb-6">
          <h4 className="font-subheading text-white text-sm font-semibold mb-4">
            {editingEvent ? 'Editar Evento' : 'Nuevo Evento'} - {selectedDate && new Date(selectedDate).toLocaleDateString()}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-green-300 text-xs font-mono mb-2">Título *</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Concierto en vivo"
                className="w-full bg-black/30 border border-green-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
            
            <div>
              <label className="block text-green-300 text-xs font-mono mb-2">Hora *</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                className="w-full bg-black/30 border border-green-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-green-300 text-xs font-mono mb-2">Artista *</label>
              <input
                type="text"
                value={newEvent.artist}
                onChange={(e) => setNewEvent(prev => ({ ...prev, artist: e.target.value }))}
                placeholder="Nombre del artista"
                className="w-full bg-black/30 border border-green-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
            
            <div>
              <label className="block text-green-300 text-xs font-mono mb-2">Ubicación</label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Lugar del evento"
                className="w-full bg-black/30 border border-green-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-green-300 text-xs font-mono mb-2">Estado</label>
              <select
                value={newEvent.status}
                onChange={(e) => setNewEvent(prev => ({ ...prev, status: e.target.value as CalendarEvent['status'] }))}
                className="w-full bg-black/30 border border-green-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-green-300 text-xs font-mono mb-2">Notas</label>
            <textarea
              value={newEvent.notes}
              onChange={(e) => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full bg-black/30 border border-green-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-all duration-200 font-subheading text-sm border border-green-500/30"
            >
              {editingEvent ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 px-4 py-2 rounded-lg transition-all duration-200 font-subheading text-sm border border-gray-500/30"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        <h4 className="font-subheading text-white text-sm font-semibold flex items-center gap-2">
          Próximos Eventos
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-mono">
            {events.filter(e => new Date(e.date) >= new Date()).length}
          </span>
        </h4>
        
        {events.length === 0 ? (
          <div className="text-center py-8 text-green-300/60">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-mono text-sm">No hay eventos programados</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => {
                const statusConfig = STATUS_CONFIG[event.status]
                return (
                  <div key={event.id} className="bg-black/20 border border-green-700/20 rounded-lg p-3 hover:bg-black/30 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <h5 className="text-white font-medium text-sm">{event.title}</h5>
                          <p className="text-green-300 text-xs font-mono">{event.artist}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-mono border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-green-400 hover:text-green-300 transition-colors duration-200 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-green-300/80 font-mono">
                      <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                      <span>🕒 {event.time}</span>
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                    
                    {event.notes && (
                      <p className="text-green-300/60 text-xs mt-2 italic">{event.notes}</p>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}