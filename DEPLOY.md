# Guía de Deploy en Vercel

## Configuración de Base de Datos

### 1. Crear Base de Datos en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a la pestaña "Storage"
3. Crea una nueva base de datos Postgres
4. Copia la URL de conexión

### 2. Variables de Entorno

Configura las siguientes variables en Vercel:

```
DATABASE_URL=postgres://username:password@host:port/database
NEXTAUTH_SECRET=tu-clave-secreta-aqui
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

### 3. Generar NEXTAUTH_SECRET

Puedes generar una clave secreta usando:

```bash
openssl rand -base64 32
```

## Pasos para Deploy

1. **Conectar repositorio a Vercel**
   - Importa tu repositorio en Vercel
   - Vercel detectará automáticamente que es un proyecto Next.js

2. **Configurar variables de entorno**
   - Agrega las variables mencionadas arriba

3. **Deploy**
   - Vercel ejecutará automáticamente:
     - `npm install`
     - `prisma generate`
     - `prisma db push`
     - `next build`

## Crear Usuario Administrador

Después del deploy, puedes crear un usuario administrador usando la página de registro:

1. Ve a `https://tu-dominio.vercel.app/register`
2. Registra el primer usuario
3. Este usuario tendrá rol de "Lectura" por defecto
4. Puedes cambiar el rol directamente en la base de datos si necesitas permisos de Admin

## Estructura de Autenticación

- **Login**: `/login`
- **Registro**: `/register`
- **Dashboard**: `/dashboard` (protegido)
- **API de registro**: `/api/auth/register`
- **NextAuth**: `/api/auth/[...nextauth]`

## Roles de Usuario

- **Admin**: Acceso completo
- **Operaciones**: Acceso de operaciones
- **Lectura**: Solo lectura (rol por defecto)