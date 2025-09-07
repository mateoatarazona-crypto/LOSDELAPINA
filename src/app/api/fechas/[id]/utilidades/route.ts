import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fechaId = parseInt(params.id);

    if (isNaN(fechaId)) {
      return NextResponse.json(
        { error: 'ID de fecha inválido' },
        { status: 400 }
      );
    }

    // Obtener el evento con todos sus datos relacionados
    const evento = await prisma.event.findUnique({
      where: { id: fechaId },
      include: {
        gastos: true,
        artistas: {
          include: {
            artista: true
          }
        },
        empresario: true
      }
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Calcular totales
    const ingresoTotal = Number(evento.totalNegociado);
    const gastosTotal = evento.gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0);
    
    // Calcular porcentajes de artistas
    const porcentajeArtistasTotal = evento.artistas.reduce(
      (sum, ea) => sum + Number(ea.porcentaje), 
      0
    );
    
    const pagoArtistas = (ingresoTotal * porcentajeArtistasTotal) / 100;
    const porcentajeCasa = Math.max(0, 100 - porcentajeArtistasTotal);
    const ingresoCasa = (ingresoTotal * porcentajeCasa) / 100;
    
    // Calcular utilidad
    const utilidadBruta = ingresoCasa - gastosTotal;
    const margenUtilidad = ingresoTotal > 0 ? (utilidadBruta / ingresoTotal) * 100 : 0;

    // Desglose de gastos por categoría
    const gastosPorCategoria = evento.gastos.reduce((acc, gasto) => {
      const categoria = gasto.categoria;
      if (!acc[categoria]) {
        acc[categoria] = {
          total: 0,
          gastos: []
        };
      }
      acc[categoria].total += Number(gasto.monto);
      acc[categoria].gastos.push({
        id: gasto.id,
        descripcion: gasto.descripcion,
        monto: Number(gasto.monto),
        comprobanteUrl: gasto.comprobanteUrl
      });
      return acc;
    }, {} as Record<string, { total: number; gastos: any[] }>);

    // Desglose de artistas
    const artistasDetalle = evento.artistas.map(ea => ({
      id: ea.artista.id,
      nombre: ea.artista.nombre,
      porcentaje: Number(ea.porcentaje),
      pago: (ingresoTotal * Number(ea.porcentaje)) / 100
    }));

    const resultado = {
      evento: {
        id: evento.id,
        fechaEvento: evento.fechaEvento,
        estado: evento.estado,
        ciudad: evento.ciudad,
        venue: evento.venue,
        empresario: evento.empresario.nombre
      },
      financiero: {
        ingresoTotal,
        gastosTotal,
        pagoArtistas,
        ingresoCasa,
        utilidadBruta,
        margenUtilidad: Math.round(margenUtilidad * 100) / 100
      },
      porcentajes: {
        artistas: porcentajeArtistasTotal,
        casa: porcentajeCasa
      },
      gastosPorCategoria,
      artistasDetalle,
      resumen: {
        totalGastos: evento.gastos.length,
        totalArtistas: evento.artistas.length,
        rentable: utilidadBruta > 0
      }
    };

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error calculando utilidades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}