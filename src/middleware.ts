import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Middleware adicional si es necesario
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
    '/fechas/:path*',
    '/api/fechas/:path*',
    '/artistas/:path*',
    '/api/artistas/:path*',
    '/empresarios/:path*',
    '/api/empresarios/:path*',
    '/calendario/:path*',
    '/historial/:path*'
  ]
};