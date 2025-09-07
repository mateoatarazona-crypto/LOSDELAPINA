import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fechaId = searchParams.get('fechaId');

    if (!fechaId) {
      return NextResponse.json({ error: 'fechaId es requerido' }, { status: 400 });
    }

    const expenses = await prisma.expense.findMany({
      where: { fechaId: parseInt(fechaId) },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { fechaId, categoria, descripcion, monto } = await request.json();

    if (!fechaId || !categoria || !descripcion || !monto) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        fechaId: parseInt(fechaId),
        categoria,
        descripcion,
        monto: parseFloat(monto)
      }
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('Error creando gasto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get('id');

    if (!expenseId) {
      return NextResponse.json({ error: 'ID del gasto es requerido' }, { status: 400 });
    }

    await prisma.expense.delete({
      where: { id: parseInt(expenseId) }
    });

    return NextResponse.json({ message: 'Gasto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}