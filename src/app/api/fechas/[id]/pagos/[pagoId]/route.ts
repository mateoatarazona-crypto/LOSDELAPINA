import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; pagoId: string }> }
) {
  const { id: fechaIdStr, pagoId: pagoIdStr } = await params
  const fechaId = Number(fechaIdStr)
  const id = Number(pagoIdStr)
  if (!Number.isFinite(fechaId) || !Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  try {
    // Cargar pago actual y evento para validaciones
    const [currentPago, event, agg] = await Promise.all([
      prisma.payment.findUnique({ where: { id } }),
      prisma.event.findUnique({ where: { id: fechaId }, select: { totalNegociado: true } }),
      prisma.payment.aggregate({ where: { fechaId }, _sum: { monto: true } }),
    ])

    if (!currentPago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }
    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    const totalNegociado = Number(event.totalNegociado)
    const totalActualPagos = Number(agg._sum.monto ?? 0)

    // Determinar el nuevo monto que quedará tras el PATCH
    const nuevoMonto = body.monto != null ? Number(body.monto) : Number(currentPago.monto)
    if (Number.isNaN(nuevoMonto) || nuevoMonto <= 0) {
      return NextResponse.json({ error: 'monto debe ser > 0' }, { status: 400 })
    }

    // El total proyectado = total actual - monto anterior + nuevo monto
    const totalProyectado = totalActualPagos - Number(currentPago.monto) + nuevoMonto
    if (totalProyectado > totalNegociado) {
      return NextResponse.json(
        { error: `El total de pagos (${totalProyectado}) excede el total negociado (${totalNegociado})` },
        { status: 400 }
      )
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        tipo: body.tipo,
        fechaPago: parseDateAny(body.fechaPago),
        metodo: body.metodo ?? null,
        observacion: body.observacion ?? null,
        monto: nuevoMonto,
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; pagoId: string }> }
) {
  const { id: fechaIdStr, pagoId: pagoIdStr } = await params
  const fechaId = Number(fechaIdStr)
  const id = Number(pagoIdStr)
  if (!Number.isFinite(fechaId) || !Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    await prisma.payment.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}