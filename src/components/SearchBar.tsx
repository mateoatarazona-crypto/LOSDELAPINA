'use client'

import { useState } from 'react'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
}

export default function SearchBar({ 
  placeholder = "Buscar...", 
  onSearch, 
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    // Búsqueda en tiempo real con debounce
    setTimeout(() => onSearch?.(value), 300)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'scale-105' : ''
      }`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className={`w-5 h-5 transition-colors duration-300 ${
              isFocused ? 'text-cyan-400' : 'text-cyan-500/60'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-4 py-3 
            bg-black/20 backdrop-blur-sm 
            border border-cyan-700/30 
            rounded-xl 
            text-white placeholder-cyan-300/60 
            font-body text-sm
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
            hover:border-cyan-600/50
            transition-all duration-300
            ${isFocused ? 'bg-black/30 shadow-lg shadow-cyan-500/10' : ''}
          `}
        />
        
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              onSearch?.('')
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Indicador de búsqueda activa */}
      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-cyan-900/20 backdrop-blur-sm border border-cyan-700/20 rounded-lg">
          <div className="text-xs text-cyan-300/80 font-mono">
            Buscando: <span className="text-white font-semibold">&quot;{query}&quot;</span>
          </div>
        </div>
      )}
    </form>
  )
}

// Hook personalizado para búsqueda
export function useSearch<T>(data: T[], searchFields: (keyof T)[]) {
  const [filteredData, setFilteredData] = useState(data)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter(item => 
      searchFields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query.toLowerCase())
        }
        if (typeof value === 'number') {
          return value.toString().includes(query)
        }
        return false
      })
    )
    
    setFilteredData(filtered)
  }

  return {
    filteredData,
    searchQuery,
    handleSearch
  }
}