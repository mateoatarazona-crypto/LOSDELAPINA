import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import EstadoInline from './EstadoInline'
import DetailTabs from './DetailTabs'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

type EventDetail = {
  id: number
  fecha: string
  estado: string
  ciudad: string | null
  venue: string | null
  total: number
  anticipo: number
  segundoPago: number
  artistas: Array<{
    nombre: string
    porcentaje: number
  }>
  empresario: {
    nombre: string
    telefono: string | null
    email: string | null
  } | null
}

async function getEventDetail(id: string): Promise<EventDetail | null> {
  const evento = await prisma.event.findUnique({
    where: { id: parseInt(id) },
    include: {
      artistas: { include: { artista: true } },
      empresario: true,
    },
  })

  if (!evento) return null

  return {
    id: evento.id,
    fecha: format(evento.fechaEvento, 'PPPP', { locale: es }),
    estado: evento.estado,
    ciudad: evento.ciudad,
    venue: evento.venue,
    total: Number(evento.totalNegociado),
    anticipo: Number(evento.anticipo),
    segundoPago: Number(evento.segundoPago),
    artistas: evento.artistas.map((ea: { artista: { nombre: string }; porcentaje: Decimal }) => ({
      nombre: ea.artista.nombre,
      porcentaje: Number(ea.porcentaje),
    })),
    empresario: evento.empresario
      ? {
          nombre: evento.empresario.nombre,
          telefono: evento.empresario.telefono,
          email: evento.empresario.email,
        }
      : null,
  }
}

function fmtMoney(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

export default async function EventDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const event = await getEventDetail(id)
  if (!event) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/fechas" className="text-blue-600 underline">← Volver a Próximas</Link>
          <h1 className="text-2xl font-semibold">Detalle de fecha</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 text-sm rounded border hover:bg-zinc-50 transition">Editar</button>
          <button className="px-3 py-2 text-sm rounded bg-black text-white hover:opacity-90 transition">Exportar PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 border rounded-lg shadow-sm">
            <h2 className="font-semibold mb-2">Información básica</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Fecha:</strong> {event.fecha}</div>
              <div className="flex items-center gap-2"><strong>Estado:</strong> <EstadoInline id={event.id} estado={event.estado} /></div>
              <div><strong>Ciudad:</strong> {event.ciudad ?? 'N/A'}</div>
              <div><strong>Venue:</strong> {event.venue ?? 'N/A'}</div>
            </div>
          </div>

          <div className="bg-white p-4 border rounded-lg shadow-sm">
            <h2 className="font-semibold mb-2">Negocio</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Total:</strong> {fmtMoney(event.total)}</div>
              <div><strong>Anticipo:</strong> {fmtMoney(event.anticipo)}</div>
              <div><strong>Segundo pago:</strong> {fmtMoney(event.segundoPago)}</div>
            </div>
          </div>

          <div className="bg-white p-4 border rounded-lg shadow-sm">
            <h2 className="font-semibold mb-2">Empresario</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Nombre:</strong> {event.empresario?.nombre ?? 'N/A'}</div>
              <div><strong>Teléfono:</strong> {event.empresario?.telefono ?? 'N/A'}</div>
              <div><strong>Email:</strong> {event.empresario?.email ?? 'N/A'}</div>
            </div>
          </div>

          <div className="bg-white p-4 border rounded-lg shadow-sm">
            <h2 className="font-semibold mb-2">Artistas</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {event.artistas.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-2 py-1 rounded-full border bg-zinc-50">
                  <span className="font-medium">{a.nombre}</span>
                  <span className="text-zinc-600">{a.porcentaje}%</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Pestañas */}
        <div className="lg:col-span-2">
          <DetailTabs eventId={event.id} totalNegociado={event.total} artistas={event.artistas} />
        </div>
      </div>
    </div>
  )
}