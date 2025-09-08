'use client'

import { useState, useRef, useEffect } from 'react'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  required?: boolean
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function DatePicker({ value, onChange, className = '', placeholder = 'Seleccionar fecha', required = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [timeValue, setTimeValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Inicializar fecha seleccionada y hora desde el valor
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setSelectedDate(date)
        setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1))
        // Extraer la hora en formato HH:MM
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        setTimeValue(`${hours}:${minutes}`)
      }
    }
  }, [value])

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(newDate)
    
    // Si hay una hora seleccionada, combinarla con la fecha
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number)
      newDate.setHours(hours, minutes)
    }
    
    // Convertir a formato datetime-local
    const year = newDate.getFullYear()
    const month = String(newDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(newDate.getDate()).padStart(2, '0')
    const hoursStr = String(newDate.getHours()).padStart(2, '0')
    const minutesStr = String(newDate.getMinutes()).padStart(2, '0')
    
    const datetimeLocal = `${year}-${month}-${dayStr}T${hoursStr}:${minutesStr}`
    onChange(datetimeLocal)
    setIsOpen(false)
  }

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime)
    
    if (selectedDate && newTime) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(hours, minutes)
      
      // Convertir a formato datetime-local
      const year = newDateTime.getFullYear()
      const month = String(newDateTime.getMonth() + 1).padStart(2, '0')
      const day = String(newDateTime.getDate()).padStart(2, '0')
      const hoursStr = String(newDateTime.getHours()).padStart(2, '0')
      const minutesStr = String(newDateTime.getMinutes()).padStart(2, '0')
      
      const datetimeLocal = `${year}-${month}-${day}T${hoursStr}:${minutesStr}`
      onChange(datetimeLocal)
    }
  }

  const formatDisplayDate = () => {
    if (!selectedDate) return placeholder
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    
    return selectedDate.toLocaleDateString('es-ES', options)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Días vacíos del mes anterior
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 border border-purple-700/10"></div>
      )
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isToday = dayDate.getTime() === today.getTime()
      const isSelected = selectedDate && 
        dayDate.getFullYear() === selectedDate.getFullYear() &&
        dayDate.getMonth() === selectedDate.getMonth() &&
        dayDate.getDate() === selectedDate.getDate()

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={`h-10 border border-purple-700/10 hover:bg-purple-500/20 transition-colors duration-200 text-sm ${
            isToday ? 'bg-purple-500/30 border-purple-500/50 text-purple-200 font-semibold' : 'text-white'
          } ${
            isSelected ? 'bg-purple-500/50 border-purple-500/70 text-white font-semibold' : ''
          }`}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-black/50 border border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none transition-colors text-left flex items-center justify-between ${className}`}
      >
        <span className={selectedDate ? 'text-white' : 'text-gray-400'}>
          {formatDisplayDate()}
        </span>
        <svg 
          className={`w-5 h-5 text-purple-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-sm border border-purple-400/30 rounded-lg shadow-2xl z-50 p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 p-2 rounded-lg transition-all duration-200 border border-purple-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h4 className="font-subheading text-white text-lg font-semibold">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            
            <button
              type="button"
              onClick={handleNextMonth}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 p-2 rounded-lg transition-all duration-200 border border-purple-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-0 mb-2">
            {DAYS.map(day => (
              <div key={day} className="h-8 flex items-center justify-center">
                <span className="text-purple-300 text-xs font-mono font-semibold">{day}</span>
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-0 border border-purple-700/30 rounded-lg overflow-hidden mb-4">
            {renderCalendarDays()}
          </div>

          {/* Time Picker */}
          <div className="border-t border-purple-700/30 pt-4">
            <label className="block text-purple-300 text-sm font-medium mb-2">Hora del evento</label>
            <input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full bg-black/50 border border-purple-400/30 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  )
}