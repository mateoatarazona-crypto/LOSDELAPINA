'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calculator, TrendingUp, AlertTriangle, DollarSign, BarChart3, PieChart } from 'lucide-react';
import { 
  calculateEventBalance, 
  calculatePortfolioMetrics, 
  projectFutureExpenses,
  type EventFinancials, 
  type FinancialBalance 
} from '@/lib/financial-calculator';

interface Event {
  id: number;
  fechaEvento: string;
  lugar: string;
  totalNegociado: number;
  anticipo: number;
  segundoPago: number;
  gastos: any[];
  pagos: any[];
}

export default function FinancialAnalysisPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [financialBalances, setFinancialBalances] = useState<FinancialBalance[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<any>(null);
  const [projections, setProjections] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user) {
      loadEventsAndCalculateBalances();
    }
  }, [session]);

  const loadEventsAndCalculateBalances = async () => {
    try {
      setLoading(true);
      
      // Cargar eventos
      const eventsResponse = await fetch('/api/events');
      if (!eventsResponse.ok) throw new Error('Error al cargar eventos');
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      // Calcular balances financieros para cada evento
      const balances: FinancialBalance[] = [];
      const eventFinancials: EventFinancials[] = [];

      for (const event of eventsData) {
        // Cargar gastos del evento
        const expensesResponse = await fetch(`/api/expenses?eventId=${event.id}`);
        const expensesData = expensesResponse.ok ? await expensesResponse.json() : [];

        const eventFinancial: EventFinancials = {
          id: event.id,
          totalNegociado: event.totalNegociado || 0,
          anticipo: event.anticipo || 0,
          segundoPago: event.segundoPago || 0,
          gastos: expensesData.map((expense: any) => ({
            id: expense.id,
            categoria: expense.categoria,
            descripcion: expense.descripcion,
            monto: expense.monto,
            createdAt: new Date(expense.createdAt)
          })),
          pagos: event.pagos || []
        };

        eventFinancials.push(eventFinancial);
        const balance = calculateEventBalance(eventFinancial);
        balances.push(balance);
      }

      setFinancialBalances(balances);

      // Calcular métricas del portafolio
      if (eventFinancials.length > 0) {
        const portfolio = calculatePortfolioMetrics(eventFinancials);
        setPortfolioMetrics(portfolio);

        // Calcular proyecciones para un nuevo evento
        const futureProjections = projectFutureExpenses(eventFinancials, 100000); // Ejemplo con $100k
        setProjections(futureProjections);
      }

    } catch (error) {
      console.error('Error cargando análisis financiero:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Calculando análisis financiero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero Avanzado</h1>
          </div>
          <p className="text-gray-600">
            Algoritmo de cálculo financiero para gestión de gastos y rentabilidad de eventos
          </p>
        </div>

        {/* Métricas del Portafolio */}
        {portfolioMetrics && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold text-gray-800">Resumen del Portafolio</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Eventos</p>
                <p className="text-3xl font-bold text-blue-600">{portfolioMetrics.totalEventos}</p>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-3xl font-bold text-cyan-400">
                  ${portfolioMetrics.totalIngresos.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Gastos Totales</p>
                <p className="text-3xl font-bold text-red-600">
                  ${portfolioMetrics.totalGastos.toLocaleString()}
                </p>
              </div>
              <div className={`text-center p-4 rounded-lg ${
                portfolioMetrics.totalRentabilidad >= 0 ? 'bg-cyan-50' : 'bg-red-50'
              }`}>
                <p className="text-sm text-gray-600">Rentabilidad Total</p>
                <p className={`text-3xl font-bold ${
                  portfolioMetrics.totalRentabilidad >= 0 ? 'text-cyan-400' : 'text-magenta-400'
                }`}>
                  ${portfolioMetrics.totalRentabilidad.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Eventos Rentables</p>
                <p className="text-2xl font-bold text-purple-600">
                  {portfolioMetrics.eventosRentables} / {portfolioMetrics.totalEventos}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-orange-600">
                  {portfolioMetrics.tasaExito.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Rentabilidad Promedio</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${portfolioMetrics.rentabilidadPromedio.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Proyecciones para Nuevos Eventos */}
        {projections && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Proyecciones para Nuevos Eventos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Proyección de Gastos</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Para un evento de $100,000</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${projections.proyeccionGastos.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ({((projections.proyeccionGastos / 100000) * 100).toFixed(1)}% del presupuesto)
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Recomendaciones</h3>
                <div className="space-y-2">
                  {projections.recomendaciones.map((rec: string, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <p className="text-sm text-blue-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Distribución proyectada por categoría */}
            {Object.keys(projections.distribuccionCategoria).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Distribución Proyectada por Categoría</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(projections.distribuccionCategoria).map(([categoria, monto]: [string, any]) => {
                    const porcentaje = projections.proyeccionGastos > 0 
                      ? (monto / projections.proyeccionGastos) * 100 
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
                            className="bg-purple-600 h-2 rounded-full" 
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

        {/* Lista de Eventos con Análisis Individual */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Análisis por Evento</h2>
          </div>
          
          <div className="space-y-4">
            {events.map((event, index) => {
              const balance = financialBalances[index];
              if (!balance) return null;
              
              return (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {event.lugar} - {new Date(event.fechaEvento).toLocaleDateString()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Total Negociado: ${event.totalNegociado.toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      balance.estado === 'rentable' ? 'bg-cyan-100 text-cyan-800' :
                      balance.estado === 'perdida' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {balance.estado.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600">Rentabilidad</p>
                      <p className={`text-lg font-bold ${
                        balance.rentabilidadBruta >= 0 ? 'text-cyan-400' : 'text-magenta-400'
                      }`}>
                        {balance.rentabilidadBruta.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <p className="text-xs text-gray-600">% Gastado</p>
                      <p className={`text-lg font-bold ${
                        balance.porcentajeGastado > 80 ? 'text-red-600' : 
                        balance.porcentajeGastado > 60 ? 'text-yellow-600' : 'text-cyan-400'
                      }`}>
                        {balance.porcentajeGastado.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 rounded">
                      <p className="text-xs text-gray-600">Saldo</p>
                      <p className={`text-lg font-bold ${
                        balance.saldoRestante >= 0 ? 'text-cyan-400' : 'text-magenta-400'
                      }`}>
                        ${balance.saldoRestante.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <p className="text-xs text-gray-600">Riesgo</p>
                      <p className={`text-lg font-bold ${
                        balance.riesgoPresupuesto === 'bajo' ? 'text-cyan-400' :
                        balance.riesgoPresupuesto === 'medio' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {balance.riesgoPresupuesto.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Alertas del evento */}
                  {balance.alertas.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-700">Alertas:</span>
                      </div>
                      <div className="space-y-1">
                        {balance.alertas.map((alerta, alertIndex) => (
                          <div key={alertIndex} className="text-xs text-yellow-800 bg-yellow-50 px-2 py-1 rounded">
                            {alerta}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Toggle para ver detalles */}
                  <button
                    onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedEventId === event.id ? 'Ocultar detalles' : 'Ver detalles'}
                  </button>
                  
                  {/* Detalles expandidos */}
                  {selectedEventId === event.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-3">Distribución de Gastos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(balance.gastosPorCategoria).map(([categoria, monto]) => {
                          const porcentaje = balance.totalGastos > 0 
                            ? (monto / balance.totalGastos) * 100 
                            : 0;
                          return (
                            <div key={categoria} className="p-3 bg-gray-50 rounded">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-700">{categoria}</span>
                                <span className="text-xs text-gray-600">{porcentaje.toFixed(1)}%</span>
                              </div>
                              <div className="text-sm font-bold text-gray-800">
                                ${monto.toLocaleString()}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full" 
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}