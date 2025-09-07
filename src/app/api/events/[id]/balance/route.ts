import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const eventId = parseInt(params.id);
    
    // Obtener el evento con sus gastos
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        gastos: true,
        pagos: true
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Calcular balance financiero
    const balance = calculateEventBalance(event);

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error calculando balance:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

function calculateEventBalance(event: any): BalanceCalculation {
  // Ingresos totales
  const totalNegociado = parseFloat(event.totalNegociado.toString());
  const anticipo = parseFloat(event.anticipo.toString());
  const segundoPago = parseFloat(event.segundoPago.toString());
  const totalIngresos = totalNegociado;

  // Gastos totales
  const totalGastos = event.gastos.reduce((sum: number, gasto: any) => {
    return sum + parseFloat(gasto.monto.toString());
  }, 0);

  // Gastos por categoría
  const gastosPorCategoria = event.gastos.reduce((acc: Record<string, number>, gasto: any) => {
    const categoria = gasto.categoria;
    acc[categoria] = (acc[categoria] || 0) + parseFloat(gasto.monto.toString());
    return acc;
  }, {});

  // Saldo restante
  const saldoRestante = totalIngresos - totalGastos;

  // Porcentaje gastado
  const porcentajeGastado = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;

  // Estado del balance
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

// Función auxiliar para obtener el balance de múltiples eventos
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