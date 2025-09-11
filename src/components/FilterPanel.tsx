'use client'

import { useState } from 'react'

interface FilterOption {
  label: string
  value: string
  count?: number
}

interface FilterGroup {
  title: string
  key: string
  options: FilterOption[]
  type: 'checkbox' | 'radio' | 'range'
  min?: number
  max?: number
}

interface FilterPanelProps {
  filterGroups: FilterGroup[]
  onFiltersChange: (filters: Record<string, string | string[] | number>) => void
  className?: string
}

export default function FilterPanel({ 
  filterGroups, 
  onFiltersChange, 
  className = "" 
}: FilterPanelProps) {
  const [filters, setFilters] = useState<Record<string, string | string[] | number>>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (groupKey: string, value: string | number, type: string) => {
    const newFilters = { ...filters }
    
    if (type === 'checkbox') {
      if (!newFilters[groupKey]) newFilters[groupKey] = []
      const currentValues = newFilters[groupKey] as string[]
      const stringValue = String(value)
      
      if (currentValues.includes(stringValue)) {
        newFilters[groupKey] = currentValues.filter(v => v !== stringValue)
      } else {
        newFilters[groupKey] = [...currentValues, stringValue]
      }
      
      if (newFilters[groupKey].length === 0) {
        delete newFilters[groupKey]
      }
    } else if (type === 'radio') {
      if (newFilters[groupKey] === value) {
        delete newFilters[groupKey]
      } else {
        newFilters[groupKey] = value
      }
    } else if (type === 'range') {
      newFilters[groupKey] = value
    }
    
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const activeFilterCount = Object.keys(filters).length

  return (
    <div className={`bg-black/20 backdrop-blur-sm border border-cyan-700/30 rounded-xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          <h3 className="font-subheading text-white text-sm font-semibold">
            Filtros
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors duration-200 font-mono"
            >
              Limpiar
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-all duration-200 transform hover:scale-110"
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Groups */}
      <div className={`space-y-4 transition-all duration-300 overflow-hidden ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {filterGroups.map((group) => (
          <div key={group.key} className="space-y-2">
            <h4 className="font-body text-cyan-300 text-xs font-medium uppercase tracking-wider">
              {group.title}
            </h4>
            
            {group.type === 'range' ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min={group.min || 0}
                  max={group.max || 100}
                  value={filters[group.key] || group.min || 0}
                  onChange={(e) => handleFilterChange(group.key, parseInt(e.target.value), 'range')}
                  className="w-full h-2 bg-cyan-900/30 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-cyan-400 font-mono">
                  <span>{group.min || 0}</span>
                  <span className="text-white font-semibold">
                    {filters[group.key] || group.min || 0}
                  </span>
                  <span>{group.max || 100}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                {group.options.map((option) => {
                  const isSelected = group.type === 'checkbox' 
                    ? Array.isArray(filters[group.key]) && (filters[group.key] as string[]).includes(option.value)
                    : filters[group.key] === option.value
                  
                  return (
                    <label 
                      key={option.value} 
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-cyan-900/20 cursor-pointer transition-colors duration-200 group"
                    >
                      <input
                        type={group.type}
                        name={group.key}
                        value={option.value}
                        checked={isSelected}
                        onChange={() => handleFilterChange(group.key, option.value, group.type)}
                        className="sr-only"
                      />
                      
                      <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                        group.type === 'checkbox' ? 'rounded-sm' : 'rounded-full'
                      } ${
                        isSelected 
                          ? 'bg-cyan-500 border-cyan-500'
                : 'border-cyan-600/50 group-hover:border-cyan-500/70'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      <span className={`text-sm font-body transition-colors duration-200 ${
                        isSelected ? 'text-white' : 'text-cyan-200 group-hover:text-white'
                      }`}>
                        {option.label}
                        {option.count !== undefined && (
                          <span className="ml-1 text-xs text-cyan-400 font-mono">
                            ({option.count})
                          </span>
                        )}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Hook para manejar filtros
export function useFilters<T>(data: T[], filterConfig: Record<string, (item: T, value: string | string[] | number) => boolean>) {
  const [filteredData, setFilteredData] = useState(data)
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[] | number>>({})

  const applyFilters = (filters: Record<string, string | string[] | number>) => {
    setActiveFilters(filters)
    
    if (Object.keys(filters).length === 0) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        const filterFn = filterConfig[key]
        return filterFn ? filterFn(item, value) : true
      })
    })
    
    setFilteredData(filtered)
  }

  return {
    filteredData,
    activeFilters,
    applyFilters
  }
}