import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  const { nombre, genero, representante, contacto, notas } = body
  try {
    const updated = await prisma.artist.update({
      where: { id },
      data: {
        nombre: typeof nombre === 'string' ? nombre : undefined,
        genero: genero ?? undefined,
        representante: representante ?? undefined,
        contacto: contacto ?? undefined,
        notas: notas ?? undefined,
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('PATCH /api/artistas/[id] error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  try {
    await prisma.artist.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('DELETE /api/artistas/[id] error', e)
    return NextResponse.json({ error: 'No se puede eliminar el artista. Puede tener fechas asociadas.' }, { status: 400 })
  }
}