# Manual de Despliegue en Vercel

Debido a problemas de permisos con el CLI de Vercel, sigue estos pasos para realizar el despliegue manual:

## 1. Acceder al Dashboard de Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub

## 2. Crear Nuevo Proyecto
1. Haz clic en "New Project"
2. Importa el repositorio desde GitHub o sube los archivos manualmente
3. Configura el nombre del proyecto: `ldpnm-production`

## 3. Configurar Variables de Entorno
En la sección "Environment Variables" del proyecto, agrega:

```
DATABASE_URL=postgres://postgres.ggziyvsbcozzudnsqobt:OrYoozLm1UA90U30@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

NEXTAUTH_SECRET=CXmOtMLkiKaNpDAE+XciYEp7yFDJyrxQs8lhTf/XgeE=
NEXTAUTH_URL=https://tu-dominio.vercel.app

NEXT_PUBLIC_SUPABASE_URL=https://ggziyvsbcozzudnsqobt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdneml5dnNiY296enVkbnNxb2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODE1MDIsImV4cCI6MjA3Mjg1NzUwMn0.S0kSUU3f_VmPATPJCCIL2KXkoAUCQ_cxDelsrxtk81I
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdneml5dnNiY296enVkbnNxb2J0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4MTUwMiwiZXhwIjoyMDcyODU3NTAyfQ.wp56kL9IAkRlZRCi2cxsYUFV41L5I0C52fGyPtzJk0U
```

## 4. Configuración del Build
- Build Command: `prisma generate && next build`
- Install Command: `npm install`
- Framework: Next.js

## 5. Deploy
1. Haz clic en "Deploy"
2. Espera a que termine el build
3. Una vez completado, actualiza NEXTAUTH_URL con la URL real del deployment

## 6. Verificación Post-Despliegue
1. Accede a la URL del proyecto
2. Verifica que la autenticación funcione
3. Prueba la conexión a Supabase
4. Verifica que todas las funcionalidades estén operativas

## Notas Importantes
- ✅ Supabase está configurado y funcionando
- ✅ Build de producción exitoso
- ✅ Variables de entorno preparadas
- ❌ CLI de Vercel bloqueado por permisos de equipo

## Alternativa: Usar GitHub Integration
1. Conecta tu repositorio de GitHub a Vercel
2. Configura auto-deployment en push a main
3. Las variables de entorno se configuran una sola vez