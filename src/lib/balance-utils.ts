import { prisma } from '@/lib/prisma';

interface BalanceCalculation {
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

export function calculateEventBalance(event: any): BalanceCalculation {
  const totalNegociado = event.totalNegociado || 0;
  const anticipo = event.anticipo || 0;
  const segundoPago = event.segundoPago || 0;
  const totalIngresos = anticipo + segundoPago;

  // Calcular gastos totales y por categoría
  const gastosPorCategoria: Record<string, number> = {};
  let totalGastos = 0;

  event.gastos?.forEach((gasto: any) => {
    const categoria = gasto.categoria || 'Sin categoría';
    const monto = gasto.monto || 0;
    
    gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + monto;
    totalGastos += monto;
  });

  // Calcular saldo restante
  const saldoRestante = totalIngresos - totalGastos;
  
  // Calcular porcentaje gastado
  const porcentajeGastado = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;
  
  // Determinar estado
  let estado: 'positivo' | 'negativo' | 'equilibrado';
  if (saldoRestante > 0) {
    estado = 'positivo';
  } else if (saldoRestante < 0) {
    estado = 'negativo';
  } else {
    estado = 'equilibrado';
  }

  return {
    totalNegociado,
    anticipo,
    segundoPago,
    totalIngresos,
    totalGastos,
    saldoRestante,
    porcentajeGastado,
    gastosPorCategoria,
    estado
  };
}

export async function getMultipleEventsBalance(eventIds: number[]) {
  const events = await prisma.event.findMany({
    where: { id: { in: eventIds } },
    include: {
      gastos: true,
      pagos: true
    }
  });

  return events.map(event => ({
    eventId: event.id,
    fechaEvento: event.fechaEvento,
    ciudad: event.ciudad,
    venue: event.venue,
    balance: calculateEventBalance(event)
  }));
}

export type { BalanceCalculation };