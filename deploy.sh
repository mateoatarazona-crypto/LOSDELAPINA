#!/bin/bash

# Script de Deploy para Vercel - LDPNM
# Este script prepara la aplicación para el deploy en Vercel

echo "🚀 Preparando deploy para Vercel..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Verificar que git esté inicializado
if [ ! -d ".git" ]; then
    echo "❌ Error: No se encontró repositorio git. Inicializa git primero."
    exit 1
fi

# Verificar que todos los cambios estén committeados
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Hay cambios sin committear. Agregando y committeando..."
    git add .
    git commit -m "chore: preparando para deploy"
fi

echo "✅ Código preparado para deploy"

# Verificar archivos necesarios
echo "🔍 Verificando archivos necesarios..."

if [ ! -f "vercel.json" ]; then
    echo "❌ Error: No se encontró vercel.json"
    exit 1
fi

if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: No se encontró schema.prisma"
    exit 1
fi

if [ ! -f ".env.example" ]; then
    echo "❌ Error: No se encontró .env.example"
    exit 1
fi

echo "✅ Todos los archivos necesarios están presentes"

# Mostrar instrucciones para Vercel
echo ""
echo "📋 INSTRUCCIONES PARA DEPLOY EN VERCEL:"
echo ""
echo "1. 🌐 Ve a https://vercel.com y conecta tu cuenta de GitHub"
echo ""
echo "2. 📁 Sube tu código a GitHub:"
echo "   - Crea un nuevo repositorio en GitHub"
echo "   - Ejecuta: git remote add origin https://github.com/tu-usuario/tu-repo.git"
echo "   - Ejecuta: git push -u origin main"
echo ""
echo "3. 🚀 En Vercel:"
echo "   - Haz clic en 'New Project'"
echo "   - Importa tu repositorio de GitHub"
echo "   - Vercel detectará automáticamente que es un proyecto Next.js"
echo ""
echo "4. 🗄️  Configura la base de datos:"
echo "   - En tu proyecto de Vercel, ve a 'Storage'"
echo "   - Crea una nueva base de datos Postgres"
echo "   - Copia la URL de conexión"
echo ""
echo "5. ⚙️  Configura las variables de entorno en Vercel:"
echo "   DATABASE_URL=tu-url-de-postgres"
echo "   NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "   NEXTAUTH_URL=https://tu-dominio.vercel.app"
echo ""
echo "6. 🔨 Deploy:"
echo "   - Haz clic en 'Deploy'"
echo "   - Vercel ejecutará automáticamente el build"
echo ""
echo "7. 👤 Crear usuario administrador:"
echo "   - Ve a https://tu-dominio.vercel.app/register"
echo "   - Registra el primer usuario"
echo ""
echo "✨ ¡Tu aplicación estará lista en Vercel!"
echo ""
echo "📚 Para más detalles, consulta DEPLOY.md"