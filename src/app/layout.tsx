import { Geist, Geist_Mono } from "next/font/google";
import { NotificationProvider } from '@/components/NotificationSystem'
import SessionWrapper from '@/components/SessionWrapper'
import MobileMenuButton from "@/components/MobileMenuButton";
import NavigationLink from "@/components/NavigationLink";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configuración unificada de navegación
const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
  },
  {
    href: "/artistas",
    label: "Artistas",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  },
  {
    href: "/empresarios",
    label: "Empresarios",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
  },
  {
    href: "/fechas",
    label: "Fechas",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
  },
  {
    href: "/utilidades",
    label: "Utilidades",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
  },
  {
    href: "/calendario",
    label: "Calendario",
    icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
  },
  {
    href: "/historial",
    label: "Historial",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  }
]



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`} style={{ background: 'var(--background)' }}>
        <SessionWrapper>
          <NotificationProvider>
            <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border)' }}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
              <div className="flex justify-between items-center h-14 sm:h-16">
                <div className="flex-shrink-0">
                  <Link href="/" className="font-display text-xl sm:text-2xl text-gradient hover:scale-105 transition-transform duration-200">
                    LDPNM
                  </Link>
                </div>
                
                {/* Navegación desktop mejorada */}
                <nav className="hidden lg:flex space-x-1 xl:space-x-2">
                  {navigationItems.map((item) => (
                    <NavigationLink
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      className="px-2 py-2 text-sm xl:px-4 xl:text-base"
                    />
                  ))}
                </nav>
                
                {/* Navegación tablet - solo iconos */}
                <nav className="hidden md:flex lg:hidden space-x-1">
                  {navigationItems.map((item) => (
                    <NavigationLink
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={""}
                      className="px-2 py-2"
                      title={item.label}
                    />
                  ))}
                </nav>
                
                <div className="md:hidden">
                  <MobileMenuButton />
                </div>
              </div>
            </div>
          </header>
          
            <main className="flex-1">
              {children}
            </main>
          </NotificationProvider>
        </SessionWrapper>
        

      </body>
    </html>
  );
}
