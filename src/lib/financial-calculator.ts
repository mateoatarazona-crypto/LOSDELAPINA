/**
 * Algoritmo de Cálculo Financiero para Eventos
 * 
 * Este módulo contiene las funciones principales para calcular:
 * - Balance financiero de eventos
 * - Distribución de gastos por categoría
 * - Proyecciones de rentabilidad
 * - Alertas de presupuesto
 */

export interface EventFinancials {
  id: number;
  totalNegociado: number;
  anticipo: number;
  segundoPago: number;
  gastos: ExpenseData[];
  pagos: PaymentData[];
}

export interface ExpenseData {
  id: number;
  categoria: string;
  descripcion: string;
  monto: number;
  createdAt: Date;
}

export interface PaymentData {
  id: number;
  tipo: 'Anticipo' | 'Segundo';
  monto: number;
  fechaPago: Date | null;
}

export interface FinancialBalance {
  // Ingresos
  totalNegociado: number;
  anticipoEsperado: number;
  segundoPagoEsperado: number;
  totalIngresos: number;
  
  // Pagos recibidos
  anticipoRecibido: number;
  segundoPagoRecibido: number;
  totalPagosRecibidos: number;
  
  // Gastos
  totalGastos: number;
  gastosPorCategoria: Record<string, number>;
  
  // Balance
  saldoRestante: number;
  rentabilidadBruta: number;
  rentabilidadNeta: number;
  porcentajeGastado: number;
  
  // Estado
  estado: 'rentable' | 'perdida' | 'equilibrado';
  alertas: string[];
  
  // Proyecciones
  proyeccionFinal: number;
  riesgoPresupuesto: 'bajo' | 'medio' | 'alto';
}

/**
 * Algoritmo principal para calcular el balance financiero de un evento
 */
export function calculateEventBalance(event: EventFinancials): FinancialBalance {
  // 1. Calcular ingresos
  const totalNegociado = parseFloat(event.totalNegociado.toString());
  const anticipoEsperado = parseFloat(event.anticipo.toString());
  const segundoPagoEsperado = parseFloat(event.segundoPago.toString());
  const totalIngresos = totalNegociado;

  // 2. Calcular pagos recibidos
  const anticipoRecibido = event.pagos
    .filter(p => p.tipo === 'Anticipo' && p.fechaPago)
    .reduce((sum, p) => sum + parseFloat(p.monto.toString()), 0);
    
  const segundoPagoRecibido = event.pagos
    .filter(p => p.tipo === 'Segundo' && p.fechaPago)
    .reduce((sum, p) => sum + parseFloat(p.monto.toString()), 0);
    
  const totalPagosRecibidos = anticipoRecibido + segundoPagoRecibido;

  // 3. Calcular gastos totales
  const totalGastos = event.gastos.reduce((sum, gasto) => {
    return sum + parseFloat(gasto.monto.toString());
  }, 0);

  // 4. Calcular gastos por categoría
  const gastosPorCategoria = event.gastos.reduce((acc, gasto) => {
    const categoria = gasto.categoria;
    acc[categoria] = (acc[categoria] || 0) + parseFloat(gasto.monto.toString());
    return acc;
  }, {} as Record<string, number>);

  // 5. Calcular balance y rentabilidad
  const saldoRestante = totalIngresos - totalGastos;
  const rentabilidadBruta = totalIngresos > 0 ? (saldoRestante / totalIngresos) * 100 : 0;
  const rentabilidadNeta = totalPagosRecibidos - totalGastos;
  const porcentajeGastado = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;

  // 6. Determinar estado
  let estado: 'rentable' | 'perdida' | 'equilibrado';
  if (saldoRestante > 0) {
    estado = 'rentable';
  } else if (saldoRestante < 0) {
    estado = 'perdida';
  } else {
    estado = 'equilibrado';
  }

  // 7. Generar alertas
  const alertas = generateFinancialAlerts({
    totalIngresos,
    totalGastos,
    porcentajeGastado,
    totalPagosRecibidos,
    anticipoEsperado,
    segundoPagoEsperado
  });

  // 8. Calcular proyecciones
  const proyeccionFinal = totalPagosRecibidos - totalGastos;
  const riesgoPresupuesto = calculateBudgetRisk(porcentajeGastado);

  return {
    totalNegociado,
    anticipoEsperado,
    segundoPagoEsperado,
    totalIngresos,
    anticipoRecibido,
    segundoPagoRecibido,
    totalPagosRecibidos,
    totalGastos,
    gastosPorCategoria,
    saldoRestante,
    rentabilidadBruta,
    rentabilidadNeta,
    porcentajeGastado,
    estado,
    alertas,
    proyeccionFinal,
    riesgoPresupuesto
  };
}

/**
 * Genera alertas basadas en el estado financiero
 */
function generateFinancialAlerts(data: {
  totalIngresos: number;
  totalGastos: number;
  porcentajeGastado: number;
  totalPagosRecibidos: number;
  anticipoEsperado: number;
  segundoPagoEsperado: number;
}): string[] {
  const alertas: string[] = [];

  // Alerta de presupuesto excedido
  if (data.porcentajeGastado > 100) {
    alertas.push(`⚠️ Presupuesto excedido en ${(data.porcentajeGastado - 100).toFixed(1)}%`);
  }

  // Alerta de alto gasto
  if (data.porcentajeGastado > 80 && data.porcentajeGastado <= 100) {
    alertas.push(`🟡 Alto nivel de gastos: ${data.porcentajeGastado.toFixed(1)}% del presupuesto`);
  }

  // Alerta de pagos pendientes
  const pagosPendientes = (data.anticipoEsperado + data.segundoPagoEsperado) - data.totalPagosRecibidos;
  if (pagosPendientes > 0) {
    alertas.push(`💰 Pagos pendientes: $${pagosPendientes.toLocaleString()}`);
  }

  // Alerta de flujo de caja negativo
  if (data.totalPagosRecibidos < data.totalGastos) {
    const deficit = data.totalGastos - data.totalPagosRecibidos;
    alertas.push(`🔴 Flujo de caja negativo: -$${deficit.toLocaleString()}`);
  }

  return alertas;
}

/**
 * Calcula el nivel de riesgo del presupuesto
 */
function calculateBudgetRisk(porcentajeGastado: number): 'bajo' | 'medio' | 'alto' {
  if (porcentajeGastado <= 60) {
    return 'bajo';
  } else if (porcentajeGastado <= 85) {
    return 'medio';
  } else {
    return 'alto';
  }
}

/**
 * Calcula métricas de múltiples eventos
 */
export function calculatePortfolioMetrics(events: EventFinancials[]) {
  const balances = events.map(event => calculateEventBalance(event));
  
  const totalIngresos = balances.reduce((sum, b) => sum + b.totalIngresos, 0);
  const totalGastos = balances.reduce((sum, b) => sum + b.totalGastos, 0);
  const totalRentabilidad = totalIngresos - totalGastos;
  
  const eventosRentables = balances.filter(b => b.estado === 'rentable').length;
  const eventosPerdida = balances.filter(b => b.estado === 'perdida').length;
  
  return {
    totalEventos: events.length,
    totalIngresos,
    totalGastos,
    totalRentabilidad,
    rentabilidadPromedio: events.length > 0 ? totalRentabilidad / events.length : 0,
    eventosRentables,
    eventosPerdida,
    tasaExito: events.length > 0 ? (eventosRentables / events.length) * 100 : 0,
    balances
  };
}

/**
 * Proyecta gastos futuros basado en histórico
 */
export function projectFutureExpenses(
  historicalEvents: EventFinancials[],
  newEventBudget: number
): {
  proyeccionGastos: number;
  distribuccionCategoria: Record<string, number>;
  recomendaciones: string[];
} {
  if (historicalEvents.length === 0) {
    return {
      proyeccionGastos: newEventBudget * 0.7, // Estimación conservadora
      distribuccionCategoria: {},
      recomendaciones: ['No hay datos históricos para proyecciones precisas']
    };
  }

  // Calcular promedio de gastos por categoría
  const totalCategorias: Record<string, number[]> = {};
  
  historicalEvents.forEach(event => {
    const balance = calculateEventBalance(event);
    Object.entries(balance.gastosPorCategoria).forEach(([categoria, monto]) => {
      if (!totalCategorias[categoria]) {
        totalCategorias[categoria] = [];
      }
      totalCategorias[categoria].push(monto);
    });
  });

  // Calcular promedios y proyecciones
  const distribuccionCategoria: Record<string, number> = {};
  let proyeccionGastos = 0;

  Object.entries(totalCategorias).forEach(([categoria, montos]) => {
    const promedio = montos.reduce((sum, m) => sum + m, 0) / montos.length;
    distribuccionCategoria[categoria] = promedio;
    proyeccionGastos += promedio;
  });

  // Generar recomendaciones
  const recomendaciones: string[] = [];
  const porcentajeProyectado = (proyeccionGastos / newEventBudget) * 100;
  
  if (porcentajeProyectado > 90) {
    recomendaciones.push('⚠️ Proyección de gastos muy alta, considerar reducir presupuesto');
  } else if (porcentajeProyectado < 50) {
    recomendaciones.push('✅ Proyección conservadora, hay margen para gastos adicionales');
  }

  return {
    proyeccionGastos,
    distribuccionCategoria,
    recomendaciones
  };
}