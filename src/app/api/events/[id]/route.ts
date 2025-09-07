import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 });
    }

    // Obtener el evento con todos sus datos relacionados
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        gastos: {
          orderBy: { createdAt: 'desc' }
        },
        pagos: {
          orderBy: { createdAt: 'desc' }
        },
        artistas: {
          include: {
            artista: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Formatear los datos para el algoritmo de cálculo financiero
    const formattedEvent = {
      id: event.id,
      fechaEvento: event.fechaEvento,
      venue: event.venue,
      totalNegociado: event.totalNegociado || 0,
      anticipo: event.anticipo || 0,
      segundoPago: event.segundoPago || 0,
      gastos: event.gastos.map(gasto => ({
        id: gasto.id,
        categoria: gasto.categoria,
        descripcion: gasto.descripcion,
        monto: gasto.monto,
        createdAt: gasto.createdAt
      })),
      pagos: event.pagos.map(pago => ({
        id: pago.id,
        tipo: pago.tipo,
        monto: pago.monto,
        fechaPago: pago.fechaPago
      })),
      artistas: event.artistas.map(ea => ({
        id: ea.artista.id,
        nombre: ea.artista.nombre,
        porcentaje: ea.porcentaje
      }))
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { totalNegociado, anticipo, segundoPago, venue, fechaEvento } = body;

    // Validar que el evento existe
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Actualizar el evento
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        totalNegociado: totalNegociado ? parseFloat(totalNegociado.toString()) : undefined,
        anticipo: anticipo ? parseFloat(anticipo.toString()) : undefined,
        segundoPago: segundoPago ? parseFloat(segundoPago.toString()) : undefined,
        venue: venue || undefined,
        fechaEvento: fechaEvento ? new Date(fechaEvento) : undefined
      },
      include: {
        gastos: true,
        pagos: true,
        artistas: {
          include: {
            artista: true
          }
        }
      }
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error actualizando evento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 });
    }

    // Verificar que el evento existe
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Eliminar el evento (esto también eliminará los gastos y pagos relacionados por CASCADE)
    await prisma.event.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}