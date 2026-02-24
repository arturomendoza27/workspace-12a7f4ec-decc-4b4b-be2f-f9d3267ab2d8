"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

// ============================================
// PROVIDER DE SESIÓN - Envuelve la app para autenticación
// ============================================

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
