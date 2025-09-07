import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const payload = await req.json().catch(() => null)
  if (!payload) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { estado } = payload as { estado?: string }
  if (!estado) return NextResponse.json({ error: 'estado requerido' }, { status: 400 })

  // Validar contra el conjunto permitido (según prisma.schema)
  const allowedEstados = [
    'Propuesta',
    'Negociacion',
    'Contratada',
    'PendienteAnticipo',
    'Confirmada',
    'Ejecutada',
    'Cerrada',
    'Cancelada',
  ] as const

  if (!allowedEstados.includes(estado as (typeof allowedEstados)[number])) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  try {
    const event = await prisma.event.update({
      where: { id },
      // Prisma exige el enum; ya validamos valor -> forzamos tipado
      data: { estado: estado as any },
      include: { pagos: true },
    })

    // Cálculos con tipado explícito
    const totalPagos = event.pagos.reduce((sum: number, p: { monto: any }) => sum + Number(p.monto), 0)
    const totalAnticipos = event.pagos
      .filter((p: { tipo: any }) => String(p.tipo) === 'Anticipo')
      .reduce((sum: number, p: { monto: any }) => sum + Number(p.monto), 0)

    // Reglas de validación simples por ejemplo (puedes ajustar según dominio real)
    if (estado === 'Confirmada' && totalAnticipos <= 0) {
      return NextResponse.json({ error: 'Se requiere al menos un anticipo para confirmar' }, { status: 400 })
    }
    if (estado === 'Cerrada' && totalPagos < Number(event.totalNegociado ?? 0)) {
      return NextResponse.json({ error: 'No se puede cerrar sin total de pagos igual al total negociado' }, { status: 400 })
    }

    return NextResponse.json(event)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}