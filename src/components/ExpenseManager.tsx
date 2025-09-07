'use client'

import { useState, useEffect } from 'react'
import { useNotificationHelpers } from './NotificationSystem'

interface Expense {
  id: string
  description: string
  amount: number
  category: 'transporte' | 'hospedaje' | 'comida' | 'equipos' | 'personal' | 'otros'
  date: string
  createdAt: Date
}

interface ExpenseManagerProps {
  fechaId: string
  initialBudget?: number
  onBudgetChange?: (remaining: number) => void
  className?: string
}

const EXPENSE_CATEGORIES = {
  transporte: { label: 'Transporte', icon: '🚗', color: 'text-blue-400' },
  hospedaje: { label: 'Hospedaje', icon: '🏨', color: 'text-purple-400' },
  comida: { label: 'Comida', icon: '🍽️', color: 'text-orange-400' },
  equipos: { label: 'Equipos', icon: '🎵', color: 'text-green-400' },
  personal: { label: 'Personal', icon: '👥', color: 'text-yellow-400' },
  otros: { label: 'Otros', icon: '📋', color: 'text-gray-400' }
}

export default function ExpenseManager({ 
  fechaId, 
  initialBudget = 0, 
  onBudgetChange,
  className = "" 
}: ExpenseManagerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budget, setBudget] = useState(initialBudget)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'otros' as keyof typeof EXPENSE_CATEGORIES
  })
  const { success, error } = useNotificationHelpers()

  // Cargar gastos del localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem(`expenses_${fechaId}`)
    const savedBudget = localStorage.getItem(`budget_${fechaId}`)
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
    if (savedBudget) {
      setBudget(parseFloat(savedBudget))
    }
  }, [fechaId])

  // Guardar en localStorage cuando cambien los gastos
  useEffect(() => {
    localStorage.setItem(`expenses_${fechaId}`, JSON.stringify(expenses))
    localStorage.setItem(`budget_${fechaId}`, budget.toString())
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const remaining = budget - totalExpenses
    onBudgetChange?.(remaining)
  }, [expenses, budget, fechaId, onBudgetChange])

  const handleAddExpense = () => {
    if (!newExpense.description.trim() || !newExpense.amount) {
      error('Error', 'Por favor completa todos los campos')
      return
    }

    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: newExpense.description.trim(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date()
    }

    setExpenses(prev => [...prev, expense])
    setNewExpense({ description: '', amount: '', category: 'otros' })
    setIsAddingExpense(false)
    success('Gasto agregado', `$${expense.amount.toLocaleString()} en ${EXPENSE_CATEGORIES[expense.category].label}`)
  }

  const handleDeleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id)
    setExpenses(prev => prev.filter(e => e.id !== id))
    if (expense) {
      success('Gasto eliminado', `$${expense.amount.toLocaleString()} devuelto al presupuesto`)
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remainingBudget = budget - totalExpenses
  const budgetPercentage = budget > 0 ? (totalExpenses / budget) * 100 : 0

  return (
    <div className={`bg-black/20 backdrop-blur-sm border border-green-700/30 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h3 className="font-subheading text-white text-lg font-semibold">Gestión de Gastos</h3>
            <p className="text-green-300/80 text-sm font-mono">Controla tu presupuesto</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsAddingExpense(true)}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-all duration-200 font-subheading text-sm border border-green-500/30 hover:border-green-500/50"
        >
          + Agregar Gasto
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-300 text-sm font-mono">Presupuesto</span>
            <button 
              onClick={() => {
                const newBudget = prompt('Nuevo presupuesto:', budget.toString())
                if (newBudget && !isNaN(parseFloat(newBudget))) {
                  setBudget(parseFloat(newBudget))
                }
              }}
              className="text-green-400 hover:text-green-300 text-xs"
            >
              ✏️
            </button>
          </div>
          <p className="text-white text-xl font-bold">${budget.toLocaleString()}</p>
        </div>
        
        <div className="bg-red-900/20 rounded-lg p-4">
          <span className="text-red-300 text-sm font-mono">Gastado</span>
          <p className="text-white text-xl font-bold">${totalExpenses.toLocaleString()}</p>
        </div>
        
        <div className={`rounded-lg p-4 ${remainingBudget >= 0 ? 'bg-green-900/20' : 'bg-red-900/30'}`}>
          <span className={`text-sm font-mono ${remainingBudget >= 0 ? 'text-green-300' : 'text-red-300'}`}>Restante</span>
          <p className={`text-xl font-bold ${remainingBudget >= 0 ? 'text-white' : 'text-red-400'}`}>
            ${remainingBudget.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-green-300 font-mono">Progreso del Presupuesto</span>
          <span className={`font-mono ${budgetPercentage > 100 ? 'text-red-400' : 'text-green-400'}`}>
            {budgetPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              budgetPercentage > 100 ? 'bg-red-500' : budgetPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Add Expense Form */}
      {isAddingExpense && (
        <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-4 mb-6">
          <h4 className="font-subheading text-white text-sm font-semibold mb-4">Nuevo Gasto</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-green-300 text-xs font-mono mb-2">Descripción</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ej: Gasolina para el viaje"
                className="w-full bg-black/30 border border-green-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
            
            <div>
              <label className="block text-green-300 text-xs font-mono mb-2">Monto</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-black/30 border border-green-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-green-300 text-xs font-mono mb-2">Categoría</label>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value as keyof typeof EXPENSE_CATEGORIES }))}
              className="w-full bg-black/30 border border-green-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAddExpense}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-all duration-200 font-subheading text-sm border border-green-500/30"
            >
              Agregar
            </button>
            <button
              onClick={() => setIsAddingExpense(false)}
              className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 px-4 py-2 rounded-lg transition-all duration-200 font-subheading text-sm border border-gray-500/30"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        <h4 className="font-subheading text-white text-sm font-semibold flex items-center gap-2">
          Gastos Registrados
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-mono">
            {expenses.length}
          </span>
        </h4>
        
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-green-300/60">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-mono text-sm">No hay gastos registrados</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
            {expenses.map((expense) => {
              const category = EXPENSE_CATEGORIES[expense.category]
              return (
                <div key={expense.id} className="bg-black/20 border border-green-700/20 rounded-lg p-3 hover:bg-black/30 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{expense.description}</p>
                        <p className={`text-xs font-mono ${category.color}`}>{category.label}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">${expense.amount.toLocaleString()}</span>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}