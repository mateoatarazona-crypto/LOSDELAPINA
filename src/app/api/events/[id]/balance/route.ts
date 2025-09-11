import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { calculateEventBalance } from '@/lib/balance-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);
    
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