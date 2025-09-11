'use client';

import { useState } from 'react';
import Link from 'next/link';

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
];

export default function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md transition-colors duration-200"
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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      
      {isOpen && (
        <>
          {/* Overlay para cerrar el menú */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menú móvil mejorado */}
          <div className="absolute top-14 sm:top-16 left-0 right-0 backdrop-blur-md border-b z-50 max-h-[calc(100vh-4rem)] overflow-y-auto" style={{ background: 'var(--glass-bg)', borderColor: 'var(--border)' }}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <nav className="flex flex-col space-y-1">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className="flex items-center gap-3 font-subheading px-3 py-3 sm:px-4 sm:py-3 rounded-lg transition-all duration-200 active:scale-95"
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
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className="text-sm sm:text-base">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}