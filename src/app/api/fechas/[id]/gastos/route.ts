import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const gastos = await prisma.expense.findMany({
      where: { fechaId: id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(gastos)
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

  const { categoria, descripcion, monto, comprobanteUrl } = body
  if (!categoria || monto == null || Number(monto) <= 0) {
    return NextResponse.json({ error: 'categoria y monto > 0 son requeridos' }, { status: 400 })
  }

  try {
    const created = await prisma.expense.create({
      data: {
        fechaId,
        categoria,
        descripcion: descripcion ?? null,
        monto: Number(monto),
        comprobanteUrl: comprobanteUrl ?? null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}