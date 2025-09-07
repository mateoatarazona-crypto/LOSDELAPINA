import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper para parsear múltiples formatos de fecha provenientes del cliente
function parseDateAny(input: any): Date | null {
  if (!input) return null
  if (typeof input === 'string' || typeof input === 'number') {
    const d = new Date(input)
    return isNaN(d.valueOf()) ? null : d
  }
  if (typeof input === 'object') {
    const v = (input as any).value ?? (input as any).$date ?? (input as any).iso ?? (input as any).toString?.()
    if (v) {
      const d = new Date(v)
      return isNaN(d.valueOf()) ? null : d
    }
  }
  return null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const pagos = await prisma.payment.findMany({
      where: { fechaId: id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(pagos)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params
  const fechaId = Number(idParam)
  if (!Number.isFinite(fechaId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { tipo, monto, fechaPago, metodo, observacion } = body
  if (!tipo || monto == null || Number(monto) <= 0) {
    return NextResponse.json({ error: 'tipo y monto > 0 son requeridos' }, { status: 400 })
  }

  try {
    // Validación de negocio: no permitir pagos que superen el total negociado
    const event = await prisma.event.findUnique({
      where: { id: fechaId },
      select: { totalNegociado: true },
    })
    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }
    const agg = await prisma.payment.aggregate({
      where: { fechaId },
      _sum: { monto: true },
    })
    const totalActualPagos = Number(agg._sum.monto ?? 0)
    const nuevoMonto = Number(monto)
    const totalProyectado = totalActualPagos + nuevoMonto
    const totalNegociado = Number(event.totalNegociado)

    if (totalProyectado > totalNegociado) {
      return NextResponse.json(
        { error: `El total de pagos (${totalProyectado}) excede el total negociado (${totalNegociado})` },
        { status: 400 }
      )
    }

    const fechaPagoDate = parseDateAny(fechaPago)

    const created = await prisma.payment.create({
      data: {
        fechaId,
        tipo,
        monto: nuevoMonto,
        fechaPago: fechaPagoDate,
        metodo: metodo ?? null,
        observacion: observacion ?? null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}