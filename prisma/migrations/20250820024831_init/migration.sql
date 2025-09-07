-- CreateTable
CREATE TABLE "Artist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "genero" TEXT,
    "representante" TEXT,
    "contacto" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Promoter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "empresa" TEXT,
    "ciudad" TEXT,
    "pais" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "nit" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaEvento" DATETIME NOT NULL,
    "estado" TEXT NOT NULL,
    "ciudad" TEXT,
    "venue" TEXT,
    "aforo" INTEGER,
    "moneda" TEXT NOT NULL DEFAULT 'COP',
    "tipoCambio" DECIMAL,
    "totalNegociado" DECIMAL NOT NULL,
    "anticipo" DECIMAL NOT NULL DEFAULT 0,
    "segundoPago" DECIMAL NOT NULL DEFAULT 0,
    "contratoUrl" TEXT,
    "notasInternas" TEXT,
    "empresarioId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_empresarioId_fkey" FOREIGN KEY ("empresarioId") REFERENCES "Promoter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventArtist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaId" INTEGER NOT NULL,
    "artistaId" INTEGER NOT NULL,
    "porcentaje" DECIMAL NOT NULL DEFAULT 0,
    CONSTRAINT "EventArtist_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventArtist_fechaId_fkey" FOREIGN KEY ("fechaId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaId" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT,
    "monto" DECIMAL NOT NULL,
    "comprobanteUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_fechaId_fkey" FOREIGN KEY ("fechaId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "fechaPago" DATETIME,
    "metodo" TEXT,
    "observacion" TEXT,
    "monto" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_fechaId_fkey" FOREIGN KEY ("fechaId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Lectura',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EventArtist_fechaId_artistaId_key" ON "EventArtist"("fechaId", "artistaId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
