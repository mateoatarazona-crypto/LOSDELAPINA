'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, TrendingUp, AlertTriangle, Calculator } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { calculateEventBalance, type EventFinancials, type FinancialBalance } from '@/lib/financial-calculator';

interface Expense {
  id: number;
  fechaId: number;
  categoria: string;
  descripcion: string;
  monto: number;
  createdAt: string;
  updatedAt: string;
}

interface EventBalance {
  totalNegociado: number;
  anticipo: number;
  segundoPago: number;
  totalIngresos: number;
  totalGastos: number;
  saldoRestante: number;
  porcentajeGastado: number;
  gastosPorCategoria: Record<string, number>;
  estado: 'positivo' | 'negativo' | 'equilibrado';
}

interface ExpenseCalculatorProps {
  eventId: number;
  className?: string;
}

const EXPENSE_CATEGORIES = {
  Viajes: { label: 'Viajes', icon: '✈️', color: 'text-blue-500' },
  Alojamiento: { label: 'Alojamiento', icon: '🏨', color: 'text-purple-500' },
  TransporteLocal: { label: 'Transporte Local', icon: '🚗', color: 'text-green-500' },
  TecnicaBackline: { label: 'Técnica/Backline', icon: '🎵', color: 'text-orange-500' },
  VisasPermisos: { label: 'Visas/Permisos', icon: '📋', color: 'text-red-500' },
  Staff: { label: 'Staff', icon: '👥', color: 'text-yellow-500' },
  Marketing: { label: 'Marketing', icon: '📢', color: 'text-pink-500' },
  Otros: { label: 'Otros', icon: '📦', color: 'text-gray-500' }
};

export default function ExpenseCalculator({ eventId, className = '' }: ExpenseCalculatorProps) {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState<EventBalance | null>(null);
  const [financialBalance, setFinancialBalance] = useState<FinancialBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    categoria: 'Otros',
    descripcion: '',
    monto: ''
  });

  // Función para calcular balance financiero usando el algoritmo
  const calculateFinancialBalance = async () => {
    if (!balance) return;

    try {
      // Obtener datos del evento desde la API
      const eventResponse = await fetch(`/api/events/${eventId}`);
      if (!eventResponse.ok) throw new Error('Error al cargar evento');
      const eventData = await eventResponse.json();

      // Preparar datos para el algoritmo
      const eventFinancials: EventFinancials = {
        id: parseInt(eventId.toString()),
        totalNegociado: eventData.totalNegociado || 0,
        anticipo: eventData.anticipo || 0,
        segundoPago: eventData.segundoPago || 0,
        gastos: expenses.map(expense => ({
          id: expense.id,
          categoria: expense.categoria,
          descripcion: expense.descripcion,
          monto: expense.monto,
          createdAt: new Date(expense.createdAt)
        })),
        pagos: eventData.pagos || []
      };

      // Calcular balance usando el algoritmo
      const calculatedBalance = calculateEventBalance(eventFinancials);
      setFinancialBalance(calculatedBalance);
    } catch (error) {
      console.error('Error calculando balance financiero:', error);
    }
  };

  // Cargar gastos y balance
  useEffect(() => {
    if (session && eventId) {
      loadExpenses();
      loadBalance();
    }
  }, [session, eventId]);

  // Recalcular balance financiero cuando cambien los gastos
  useEffect(() => {
    if (expenses.length > 0 && balance) {
      calculateFinancialBalance();
    }
  }, [expenses, balance]);

  const loadExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses?fechaId=${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error('Error cargando gastos:', error);
    }
  };

  const loadBalance = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/balance`);
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error cargando balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.descripcion.trim() || !newExpense.monto) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fechaId: eventId,
          categoria: newExpense.categoria,
          descripcion: newExpense.descripcion,
          monto: parseFloat(newExpense.monto)
        })
      });

      if (response.ok) {
        setNewExpense({ categoria: 'Otros', descripcion: '', monto: '' });
        setIsAddingExpense(false);
        await loadExpenses();
        await loadBalance();
      } else {
        alert('Error agregando gasto');
      }
    } catch (error) {
      console.error('Error agregando gasto:', error);
      alert('Error agregando gasto');
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;

    try {
      const response = await fetch(`/api/expenses?id=${expenseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadExpenses();
        await loadBalance();
      } else {
        alert('Error eliminando gasto');
      }
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      alert('Error eliminando gasto');
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-xl">💰</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Gestión de Gastos</h3>
            <p className="text-sm text-gray-600">Control financiero del evento</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsAddingExpense(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          + Agregar Gasto
        </button>
      </div>

      {/* Balance Overview */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">Ingresos Totales</div>
            <div className="text-2xl font-bold text-green-700">
              ${balance.totalIngresos.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium mb-1">Gastos Totales</div>
            <div className="text-2xl font-bold text-red-700">
              ${balance.totalGastos.toLocaleString()}
            </div>
          </div>
          
          <div className={`rounded-lg p-4 border ${
            balance.estado === 'positivo' 
              ? 'bg-blue-50 border-blue-200' 
              : balance.estado === 'negativo' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`text-sm font-medium mb-1 ${
              balance.estado === 'positivo' 
                ? 'text-blue-600' 
                : balance.estado === 'negativo' 
                ? 'text-red-600' 
                : 'text-gray-600'
            }`}>
              Saldo Restante
            </div>
            <div className={`text-2xl font-bold ${
              balance.estado === 'positivo' 
                ? 'text-blue-700' 
                : balance.estado === 'negativo' 
                ? 'text-red-700' 
                : 'text-gray-700'
            }`}>
              ${balance.saldoRestante.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 font-medium mb-1">% Gastado</div>
            <div className="text-2xl font-bold text-gray-700">
              {balance.porcentajeGastado.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Análisis Financiero Avanzado */}
      {financialBalance && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Análisis Financiero Avanzado</h2>
          </div>
          
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Rentabilidad Bruta</p>
              <p className={`text-xl font-bold ${
                financialBalance.rentabilidadBruta >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {financialBalance.rentabilidadBruta.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">% Gastado</p>
              <p className={`text-xl font-bold ${
                financialBalance.porcentajeGastado > 80 ? 'text-red-600' : 
                financialBalance.porcentajeGastado > 60 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {financialBalance.porcentajeGastado.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">Estado</p>
              <p className={`text-lg font-bold capitalize ${
                financialBalance.estado === 'rentable' ? 'text-green-600' :
                financialBalance.estado === 'perdida' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {financialBalance.estado}
              </p>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <p className="text-sm text-gray-600">Riesgo</p>
              <p className={`text-lg font-bold capitalize ${
                financialBalance.riesgoPresupuesto === 'bajo' ? 'text-green-600' :
                financialBalance.riesgoPresupuesto === 'medio' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {financialBalance.riesgoPresupuesto}
              </p>
            </div>
          </div>

          {/* Alertas */}
          {financialBalance.alertas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Alertas Financieras
              </h3>
              <div className="space-y-2">
                {financialBalance.alertas.map((alerta, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm text-yellow-800">{alerta}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gastos por categoría */}
          {Object.keys(financialBalance.gastosPorCategoria).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Distribución de Gastos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(financialBalance.gastosPorCategoria).map(([categoria, monto]) => {
                  const porcentaje = financialBalance.totalGastos > 0 
                    ? (monto / financialBalance.totalGastos) * 100 
                    : 0;
                  return (
                    <div key={categoria} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{categoria}</span>
                        <span className="text-sm text-gray-600">{porcentaje.toFixed(1)}%</span>
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        ${monto.toLocaleString()}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {balance && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Progreso del Presupuesto</span>
            <span className={`font-medium ${
              balance.porcentajeGastado > 100 ? 'text-red-600' : 'text-blue-600'
            }`}>
              {balance.porcentajeGastado.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                balance.porcentajeGastado > 100 
                  ? 'bg-red-500' 
                  : balance.porcentajeGastado > 80 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(balance.porcentajeGastado, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Expense Form */}
      {isAddingExpense && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Nuevo Gasto</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <input
                type="text"
                value={newExpense.descripcion}
                onChange={(e) => setNewExpense(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Ej: Transporte al aeropuerto"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
              <input
                type="number"
                value={newExpense.monto}
                onChange={(e) => setNewExpense(prev => ({ ...prev, monto: e.target.value }))}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={newExpense.categoria}
              onChange={(e) => setNewExpense(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAddExpense}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Agregar
            </button>
            <button
              onClick={() => setIsAddingExpense(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          Gastos Registrados
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {expenses.length}
          </span>
        </h4>
        
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm">No hay gastos registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => {
              const category = EXPENSE_CATEGORIES[expense.categoria as keyof typeof EXPENSE_CATEGORIES] || EXPENSE_CATEGORIES.Otros;
              return (
                <div key={expense.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{expense.descripcion}</p>
                        <p className={`text-xs ${category.color}`}>{category.label}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">
                        ${expense.monto.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}