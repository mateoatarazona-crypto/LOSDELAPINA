import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const empresarios = await prisma.promoter.findMany({
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { fechas: true } } },
    })
    return NextResponse.json(empresarios)
  } catch (e) {
    console.error('GET /api/empresarios error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  const { nombre, empresa, ciudad, pais, email, telefono, nit, notas } = body || {}
  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    return NextResponse.json({ error: 'nombre es requerido' }, { status: 400 })
  }
  try {
    const created = await prisma.promoter.create({
      data: {
        nombre: nombre.trim(),
        empresa: empresa ?? null,
        ciudad: ciudad ?? null,
        pais: pais ?? null,
        email: email ?? null,
        telefono: telefono ?? null,
        nit: nit ?? null,
        notas: notas ?? null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('POST /api/empresarios error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}