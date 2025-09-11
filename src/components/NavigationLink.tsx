'use client';

import Link from 'next/link';

interface NavigationLinkProps {
  href: string;
  icon: string;
  label: string;
  className?: string;
  title?: string;
}

export default function NavigationLink({ href, icon, label, className = '', title }: NavigationLinkProps) {
  const showLabel = label && label.length > 0;
  
  return (
    <Link 
      href={href} 
      className={`flex items-center justify-center gap-2 font-subheading rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
      style={{ color: 'var(--foreground-secondary)' }}
      title={title || label}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--background-secondary)';
        e.currentTarget.style.color = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--foreground-secondary)';
      }}
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      {showLabel && (
        <span className="text-xs sm:text-sm whitespace-nowrap">{label}</span>
      )}
    </Link>
  );
}