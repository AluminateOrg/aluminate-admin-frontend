// components/Providers.tsx
'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/redux/store';
import { Toaster } from '@/components/ui/sonner';
import AuthGuard from '@/security/AuthGuard'; // Optional — include only in (protected)

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ReduxProvider store={store}>
        <AuthProvider>
          <AdminProvider>
            {children}
            <Toaster />
          </AdminProvider>
        </AuthProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}
