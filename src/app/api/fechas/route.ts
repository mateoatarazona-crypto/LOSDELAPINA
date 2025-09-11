import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import type { Session } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      fechaEvento,
      venue,
      ciudad,
      estado,
      totalNegociado,
      anticipo,
      segundoPago,
      empresarioId,
      artistas,
      notas
    } = body

    // Validaciones básicas
    if (!fechaEvento || !venue || !ciudad) {
      return NextResponse.json(
        { error: 'Fecha, venue y ciudad son campos obligatorios' },
        { status: 400 }
      )
    }

    if (!artistas || artistas.length === 0) {
      return NextResponse.json(
        { error: 'Debe agregar al menos un artista' },
        { status: 400 }
      )
    }

    // Validar que los porcentajes no excedan 100%
    const totalPorcentajes = artistas.reduce((sum: number, a: any) => sum + (a.porcentaje || 0), 0)
    if (totalPorcentajes > 100) {
      return NextResponse.json(
        { error: 'La suma de porcentajes de artistas no puede exceder 100%' },
        { status: 400 }
      )
    }

    // Crear el evento en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el evento
      const evento = await tx.event.create({
        data: {
          fechaEvento: new Date(fechaEvento),
          venue: venue.trim(),
          ciudad: ciudad.trim(),
          estado,
          totalNegociado: totalNegociado || 0,
          anticipo: anticipo || 0,
          segundoPago: segundoPago || 0,
          empresarioId: empresarioId || null,
          notasInternas: notas?.trim() || null,
        }
      })

      // Crear las relaciones con artistas
      if (artistas && artistas.length > 0) {
        const artistasData = artistas
          .filter((a: any) => a.artistaId && a.artistaId > 0)
          .map((a: any) => ({
            fechaId: evento.id,
            artistaId: a.artistaId,
            porcentaje: a.porcentaje || 0
          }))

        if (artistasData.length > 0) {
          await tx.eventArtist.createMany({
            data: artistasData
          })
        }
      }

      return evento
    })

    return NextResponse.json(
      { 
        message: 'Fecha creada exitosamente',
        evento: result
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creando fecha:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    const where: any = {}
    
    if (estado) {
      where.estado = estado
    }
    
    if (desde || hasta) {
      where.fechaEvento = {}
      if (desde) where.fechaEvento.gte = new Date(desde)
      if (hasta) where.fechaEvento.lte = new Date(hasta)
    } else {
      // Si no hay filtros de fecha, limitar a eventos de los últimos 6 meses
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      where.fechaEvento = { gte: sixMonthsAgo }
    }

    const eventos = await prisma.event.findMany({
      where,
      include: {
        artistas: {
          include: {
            artista: true
          }
        },
        empresario: true,
        gastos: true,
        pagos: true
      },
      orderBy: {
        fechaEvento: 'asc'
      },
      take: 100 // Limitar a 100 eventos por consulta
    })

    return NextResponse.json(eventos)

  } catch (error) {
    console.error('Error obteniendo fechas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}