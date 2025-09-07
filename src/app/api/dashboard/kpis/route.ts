import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

type EventWithRelations = Prisma.EventGetPayload<{ include: { gastos: true; artistas: true; empresario: true } }>

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().getMonth().toString();
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    const startMonth = new Date(parseInt(year), parseInt(month), 1);
    const endMonth = new Date(parseInt(year), parseInt(month) + 1, 1);

    const [eventosDelMes, eventosRaw] = await Promise.all([
      prisma.event.count({
        where: { fechaEvento: { gte: startMonth, lt: endMonth } },
      }),
      prisma.event.findMany({ include: { gastos: true, artistas: true, empresario: true } }),
    ]);

    const eventos = eventosRaw as EventWithRelations[];

    let ingresos = 0;
    let gastosTotales = 0;
    for (const e of eventos) {
      ingresos += Number(e.totalNegociado);
      for (const it of e.gastos) gastosTotales += Number(it.monto);
    }

    const anticiposPendientes = eventos.filter(
      (e) => Number(e.anticipo) === 0 || e.estado === 'PendienteAnticipo'
    );
    let anticiposPendientesTotal = 0;
    for (const e of anticiposPendientes) anticiposPendientesTotal += Number(e.totalNegociado);

    const segundosPendientes = eventos.filter(
      (e) => Number(e.segundoPago) < Number(e.totalNegociado) - Number(e.anticipo)
    );
    let segundosPendientesTotal = 0;
    for (const e of segundosPendientes)
      segundosPendientesTotal +=
        Number(e.totalNegociado) - Number(e.anticipo) - Number(e.segundoPago);

    let utilidadEstim = 0;
    for (const e of eventos) {
      const porcentajeArtistas = e.artistas.reduce((s, a) => s + Number(a.porcentaje), 0);
      const pagoArtistas = (Number(e.totalNegociado) * porcentajeArtistas) / 100;
      const gastosEvento = e.gastos.reduce((s, g) => s + Number(g.monto), 0);
      utilidadEstim += Number(e.totalNegociado) - pagoArtistas - gastosEvento;
    }

    return NextResponse.json({
      eventosDelMes,
      ingresos,
      gastosTotales,
      anticiposPendientesTotal,
      segundosPendientesTotal,
      utilidadEstim,
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}