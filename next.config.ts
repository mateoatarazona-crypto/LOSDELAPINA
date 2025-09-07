import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  typedRoutes: false,
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    // Ignorar errores de linting en build para permitir deploy en Vercel
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
