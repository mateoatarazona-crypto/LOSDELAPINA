import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; gastoId: string }> }
) {
  const { id: fechaIdStr, gastoId: gastoIdStr } = await params
  const fechaId = Number(fechaIdStr)
  const id = Number(gastoIdStr)
  if (!Number.isFinite(fechaId) || !Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  try {
    const updated = await prisma.expense.update({
      where: { id },
      data: {
        categoria: body.categoria,
        descripcion: body.descripcion ?? null,
        monto: body.monto != null ? Number(body.monto) : undefined,
        comprobanteUrl: body.comprobanteUrl ?? null,
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
  { params }: { params: Promise<{ id: string; gastoId: string }> }
) {
  const { id: fechaIdStr, gastoId: gastoIdStr } = await params
  const fechaId = Number(fechaIdStr)
  const id = Number(gastoIdStr)
  if (!Number.isFinite(fechaId) || !Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}