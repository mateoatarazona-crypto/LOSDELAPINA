'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionWrapperProps {
  children: ReactNode;
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <SessionProvider 
      basePath="/api/auth" 
      refetchInterval={0} // Desactivar refetch automático
      refetchOnWindowFocus={false} // Desactivar refetch en focus
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}