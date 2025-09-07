import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ESTADOS = new Set([
  'Propuesta',
  'Negociacion',
  'Contratada',
  'PendienteAnticipo',
  'Confirmada',
  'Ejecutada',
  'Cerrada',
  'Cancelada',
])

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    const id = Number(idParam)
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Permitir overrides opcionales para pruebas (p.ej., estado)
    const body = (await request.json().catch(() => null)) as null | { override?: { estado?: string } }
    const overrideEstado = body?.override?.estado
    if (overrideEstado && !ESTADOS.has(overrideEstado)) {
      return NextResponse.json({ error: 'Estado override inválido' }, { status: 400 })
    }

    const original = await prisma.event.findUnique({
      where: { id },
      include: { artistas: true, gastos: true },
    })
    if (!original) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

    const nuevo = await prisma.event.create({
      data: {
        fechaEvento: original.fechaEvento,
        estado: (overrideEstado ?? original.estado) as any,
        ciudad: original.ciudad,
        venue: original.venue,
        aforo: original.aforo,
        moneda: original.moneda,
        tipoCambio: original.tipoCambio,
        totalNegociado: original.totalNegociado,
        anticipo: original.anticipo,
        segundoPago: original.segundoPago,
        contratoUrl: original.contratoUrl,
        notasInternas: original.notasInternas,
        empresarioId: original.empresarioId,
        artistas: {
          create: original.artistas.map((ea) => ({ artistaId: ea.artistaId, porcentaje: ea.porcentaje })),
        },
        gastos: {
          create: original.gastos.map((g) => ({ categoria: g.categoria, descripcion: g.descripcion, monto: g.monto, comprobanteUrl: g.comprobanteUrl })),
        },
      },
      select: { id: true },
    })

    return NextResponse.json({ id: nuevo.id })
  } catch (e) {
    console.error('POST /api/fechas/[id]/duplicate error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}