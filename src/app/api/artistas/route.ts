import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?prepared_statements=false&statement_cache_size=0'
      }
    }
  })
  
  try {
    const artistas = await prisma.artist.findMany({
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { fechas: true } } },
    })
    return NextResponse.json(artistas)
  } catch (e) {
    console.error('GET /api/artistas error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(req: Request) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?prepared_statements=false&statement_cache_size=0'
      }
    }
  })
  
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  const { nombre, genero, representante, contacto, notas } = body || {}
  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    return NextResponse.json({ error: 'nombre es requerido' }, { status: 400 })
  }
  try {
    const created = await prisma.artist.create({
      data: {
        nombre: nombre.trim(),
        genero: genero ?? null,
        representante: representante ?? null,
        contacto: contacto ?? null,
        notas: notas ?? null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('POST /api/artistas error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}