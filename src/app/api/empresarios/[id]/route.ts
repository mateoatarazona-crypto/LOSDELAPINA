import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  const { nombre, empresa, ciudad, pais, email, telefono, nit, notas } = body
  try {
    const updated = await prisma.promoter.update({
      where: { id },
      data: {
        nombre: typeof nombre === 'string' ? nombre : undefined,
        empresa: empresa ?? undefined,
        ciudad: ciudad ?? undefined,
        pais: pais ?? undefined,
        email: email ?? undefined,
        telefono: telefono ?? undefined,
        nit: nit ?? undefined,
        notas: notas ?? undefined,
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('PATCH /api/empresarios/[id] error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  try {
    await prisma.promoter.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('DELETE /api/empresarios/[id] error', e)
    return NextResponse.json({ error: 'No se puede eliminar el empresario. Puede tener fechas asociadas.' }, { status: 400 })
  }
}