# LDPNM - Sistema de Gestión de Eventos Musicales

🎵 **Sistema completo de gestión para eventos musicales, artistas y análisis financiero**

## ✨ Características Principales

### 🎤 Gestión de Artistas y Empresarios
- Perfiles completos de artistas con información de contacto
- Base de datos de empresarios y promotores
- Historial de colaboraciones y eventos

### 📅 Programación de Eventos
- Calendario interactivo de eventos
- Gestión de fechas y estados (Confirmado, Pendiente, Cancelado)
- Duplicación rápida de eventos similares

### 💰 Sistema Financiero Completo
- **Gestión de Pagos**: Anticipos y segundos pagos
- **Control de Gastos**: Categorización por tipo (Transporte, Hospedaje, Alimentación, etc.)
- **Análisis de Utilidades**: Cálculo automático de rentabilidad por evento
- **Dashboard Financiero**: KPIs en tiempo real

### 📊 Análisis y Reportes
- **Utilidades por Fecha**: Análisis detallado de cada evento
- **Estadísticas Generales**: Eventos rentables, márgenes de utilidad
- **Métricas en Tiempo Real**: Ingresos, gastos, utilidades estimadas

### 🔐 Autenticación y Seguridad
- Sistema de login/registro seguro
- Roles de usuario (Admin, Operaciones, Lectura)
- Protección de rutas con middleware

### 🎨 Interfaz Moderna
- Diseño responsivo y minimalista
- Tema oscuro con acentos neón
- Experiencia de usuario optimizada

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Base de datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **Estilos**: Tailwind CSS
- **Deploy**: Vercel

## 🚀 Instalación Rápida

1. **Clona el repositorio**:
```bash
git clone <repository-url>
cd ldpnm
```

2. **Instala dependencias**:
```bash
npm install
```

3. **Configura variables de entorno**:
```bash
cp .env.example .env.local
# Edita .env.local con tus configuraciones
```

4. **Configura la base de datos**:
```bash
npx prisma generate
npx prisma db push
```

5. **Ejecuta el servidor**:
```bash
npm run dev
```

6. **Accede a la aplicación**:
   - Abre http://localhost:3000
   - Registra tu primer usuario en `/register`

## 📋 Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # Linter
npm run db:push    # Sincronizar esquema
npm run db:migrate # Ejecutar migraciones
```

## 🌐 Deploy en Vercel

### Opción 1: Script Automatizado
```bash
./deploy.sh
```

### Opción 2: Manual
1. Sube tu código a GitHub
2. Conecta tu repositorio en [Vercel](https://vercel.com)
3. Configura las variables de entorno:
   - `DATABASE_URL`: URL de Postgres
   - `NEXTAUTH_SECRET`: Clave secreta
   - `NEXTAUTH_URL`: URL de tu dominio
4. Deploy automático

📚 **Ver [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas**

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Autenticación
│   │   ├── fechas/       # Eventos y utilidades
│   │   ├── artistas/     # Gestión de artistas
│   │   └── empresarios/  # Gestión de empresarios
│   ├── dashboard/        # Dashboard principal
│   ├── utilidades/       # Análisis financiero
│   ├── fechas/          # Gestión de eventos
│   ├── artistas/        # Gestión de artistas
│   ├── empresarios/     # Gestión de empresarios
│   ├── calendario/      # Vista de calendario
│   ├── login/           # Página de login
│   └── register/        # Página de registro
├── components/          # Componentes reutilizables
├── lib/                # Utilidades y configuración
└── types/              # Tipos de TypeScript
```

## 🎯 Funcionalidades Clave

### Dashboard Principal
- KPIs financieros en tiempo real
- Accesos rápidos a todas las secciones
- Resumen de eventos del mes

### Gestión de Eventos
- CRUD completo de eventos
- Estados: Confirmado, Pendiente, Cancelado
- Asignación de artistas y empresarios
- Control de gastos por categoría

### Análisis de Utilidades
- Cálculo automático por evento
- Estadísticas generales del negocio
- Identificación de eventos rentables
- Márgenes de utilidad detallados

### Sistema de Pagos
- Anticipos y segundos pagos
- Múltiples métodos de pago
- Tracking de pagos pendientes

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
# Base de datos
DATABASE_URL="file:./dev.db"  # Desarrollo
# DATABASE_URL="postgres://..."  # Producción

# Autenticación
NEXTAUTH_SECRET="tu-clave-secreta"
NEXTAUTH_URL="http://localhost:3000"

# Opcional
LOG_LEVEL="info"
```

### Roles de Usuario
- **Admin**: Acceso completo al sistema
- **Operaciones**: Gestión de eventos y datos
- **Lectura**: Solo visualización (rol por defecto)

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contacta al equipo de desarrollo.

---

**🎵 LDPNM - Gestión profesional de eventos musicales** 🎵
