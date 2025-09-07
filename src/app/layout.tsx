'use client'

import { Geist, Geist_Mono } from "next/font/google";
import { NotificationProvider } from "@/components/NotificationSystem";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
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

function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary p-2"
        aria-label="Abrir menú"
      >
        <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
      
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-80 card-elevated transform transition-transform duration-300 ease-out" style={{ background: 'var(--background)', borderLeft: '1px solid var(--border)' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="font-display text-2xl text-gradient">
                  LDPNM
                </Link>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary p-2"
                  aria-label="Cerrar menú"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className="flex items-center gap-3 font-subheading p-3 rounded-lg transition-all duration-200 group hover:scale-[1.02]" 
                    style={{ color: 'var(--foreground-secondary)' }}
                    onClick={() => setIsOpen(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--background-secondary)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--foreground-secondary)';
                    }}
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="font-caption text-center">
                  Sistema de Gestión Musical
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`} style={{ background: 'var(--background)' }}>
        <SessionProvider>
          <NotificationProvider>
            <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0">
                  <Link href="/" className="font-display text-2xl text-gradient hover:scale-105 transition-transform duration-200">
                    LDPNM
                  </Link>
                </div>
                
                <nav className="hidden md:flex space-x-2">
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      className="flex items-center gap-2 font-subheading px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                      style={{ color: 'var(--foreground-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background-secondary)';
                        e.currentTarget.style.color = 'var(--accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--foreground-secondary)';
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span>{item.label}</span>
                    </Link>
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
        </SessionProvider>
        

      </body>
    </html>
  );
}
