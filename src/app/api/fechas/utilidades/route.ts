import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener todos los eventos con sus datos relacionados
    const eventos = await prisma.event.findMany({
      include: {
        gastos: true,
        artistas: {
          include: {
            artista: true
          }
        },
        empresario: true
      },
      orderBy: {
        fechaEvento: 'desc'
      }
    });

    // Calcular utilidades para cada evento
    const eventosConUtilidades = eventos.map(evento => {
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

      return {
        id: evento.id,
        fechaEvento: evento.fechaEvento,
        estado: evento.estado,
        ciudad: evento.ciudad,
        venue: evento.venue,
        empresario: evento.empresario.nombre,
        artistas: evento.artistas.map(ea => ea.artista.nombre).join(', '),
        financiero: {
          ingresoTotal,
          gastosTotal,
          pagoArtistas,
          ingresoCasa,
          utilidadBruta,
          margenUtilidad: Math.round(margenUtilidad * 100) / 100
        },
        resumen: {
          totalGastos: evento.gastos.length,
          totalArtistas: evento.artistas.length,
          rentable: utilidadBruta > 0
        }
      };
    });

    // Calcular estadísticas generales
    const estadisticas = {
      totalEventos: eventos.length,
      eventosRentables: eventosConUtilidades.filter(e => e.resumen.rentable).length,
      ingresosTotales: eventosConUtilidades.reduce((sum, e) => sum + e.financiero.ingresoTotal, 0),
      gastosTotales: eventosConUtilidades.reduce((sum, e) => sum + e.financiero.gastosTotal, 0),
      utilidadTotal: eventosConUtilidades.reduce((sum, e) => sum + e.financiero.utilidadBruta, 0),
      margenPromedioUtilidad: eventosConUtilidades.length > 0 
        ? eventosConUtilidades.reduce((sum, e) => sum + e.financiero.margenUtilidad, 0) / eventosConUtilidades.length
        : 0
    };

    return NextResponse.json({
      eventos: eventosConUtilidades,
      estadisticas: {
        ...estadisticas,
        margenPromedioUtilidad: Math.round(estadisticas.margenPromedioUtilidad * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error obteniendo utilidades de fechas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}