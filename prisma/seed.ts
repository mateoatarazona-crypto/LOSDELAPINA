import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Usuarios
  const password = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'Admin', passwordHash: password, role: Role.Admin },
  })
  const opPass = await bcrypt.hash('ops123', 10)
  await prisma.user.upsert({
    where: { email: 'ops@example.com' },
    update: {},
    create: { email: 'ops@example.com', name: 'Ops', passwordHash: opPass, role: Role.Operaciones },
  })
  const viewPass = await bcrypt.hash('view123', 10)
  await prisma.user.upsert({
    where: { email: 'view@example.com' },
    update: {},
    create: { email: 'view@example.com', name: 'Viewer', passwordHash: viewPass, role: Role.Lectura },
  })

  // Artistas
  const a1 = await prisma.artist.create({ data: { nombre: 'Artista A', genero: 'Rock', representante: 'Rep A', contacto: 'repA@mail.com' }})
  const a2 = await prisma.artist.create({ data: { nombre: 'Artista B', genero: 'Pop' }})
  const a3 = await prisma.artist.create({ data: { nombre: 'Artista C', genero: 'Electrónica', representante: 'Rep C' }})

  // Empresarios
  const e1 = await prisma.promoter.create({ data: { nombre: 'Promotor Norte', empresa: 'Eventos Norte', ciudad: 'Bogotá', pais: 'Colombia', email: 'contacto@norte.com', nit: '900123' } })
  const e2 = await prisma.promoter.create({ data: { nombre: 'Promotor Caribe', empresa: 'Caribe Shows', ciudad: 'Barranquilla', pais: 'Colombia', email: 'info@caribe.com', nit: '901222' } })
  const e3 = await prisma.promoter.create({ data: { nombre: 'Promotor Pacífico', empresa: 'Pacific Prod', ciudad: 'Cali', pais: 'Colombia', email: 'ventas@pacifico.com', nit: '902333' } })

  // Fechas (5: dos futuras, tres históricas)
  const today = new Date()
  function addDays(d: number) { const x = new Date(today); x.setDate(x.getDate()+d); return x }

  // 1) Multi-artista futura
  const f1 = await prisma.event.create({
    data: {
      fechaEvento: addDays(20),
      estado: 'Contratada',
      ciudad: 'Bogotá', venue: 'Movistar Arena', aforo: 10000,
      moneda: 'COP', tipoCambio: null, totalNegociado: 20000000, anticipo: 5000000, segundoPago: 0,
      empresarioId: e1.id,
      artistas: { create: [
        { artistaId: a1.id, porcentaje: 33.33 },
        { artistaId: a2.id, porcentaje: 33.33 },
        { artistaId: a3.id, porcentaje: 33.34 },
      ]},
      gastos: { create: [
        { categoria: 'Viajes', monto: 3500000, descripcion: 'Vuelos' },
        { categoria: 'Alojamiento', monto: 1200000, descripcion: 'Hotel' },
      ]}
    }
  })

  // 2) Futura con anticipo pendiente
  await prisma.event.create({
    data: {
      fechaEvento: addDays(35), estado: 'PendienteAnticipo', ciudad: 'Cali', venue: 'Arena C', aforo: 6000,
      moneda: 'COP', totalNegociado: 15000000, anticipo: 0, segundoPago: 0,
      empresarioId: e3.id,
      artistas: { create: [{ artistaId: a2.id, porcentaje: 100 }]},
      gastos: { create: [{ categoria: 'TecnicaBackline', monto: 2000000 }]}
    }
  })

  // 3) Histórica ejecutada
  await prisma.event.create({
    data: {
      fechaEvento: addDays(-10), estado: 'Ejecutada', ciudad: 'Barranquilla', venue: 'Estadio B', aforo: 20000,
      moneda: 'COP', totalNegociado: 30000000, anticipo: 10000000, segundoPago: 18000000,
      empresarioId: e2.id,
      artistas: { create: [{ artistaId: a1.id, porcentaje: 100 }]},
      gastos: { create: [
        { categoria: 'TransporteLocal', monto: 800000 },
        { categoria: 'Staff', monto: 1200000 },
        { categoria: 'Marketing', monto: 500000 }
      ]}
    }
  })

  // 4) Histórica cerrada
  await prisma.event.create({
    data: {
      fechaEvento: addDays(-30), estado: 'Cerrada', ciudad: 'Bogotá', venue: 'Teatro Colón', aforo: 1700,
      moneda: 'COP', totalNegociado: 8000000, anticipo: 4000000, segundoPago: 4000000,
      empresarioId: e1.id,
      artistas: { create: [{ artistaId: a3.id, porcentaje: 100 }]},
      gastos: { create: [{ categoria: 'Otros', monto: 300000, descripcion: 'Varios' }]}
    }
  })

  // 5) Histórica cancelada
  await prisma.event.create({
    data: {
      fechaEvento: addDays(-60), estado: 'Cancelada', ciudad: 'Medellín', venue: 'La 70', aforo: 3000,
      moneda: 'COP', totalNegociado: 5000000, anticipo: 0, segundoPago: 0,
      empresarioId: e2.id,
      artistas: { create: [{ artistaId: a2.id, porcentaje: 100 }]}
    }
  })

  console.log('Seed completed')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })