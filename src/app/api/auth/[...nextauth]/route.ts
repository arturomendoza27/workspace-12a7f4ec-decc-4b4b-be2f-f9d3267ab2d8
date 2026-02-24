import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/authConfig";

// ============================================
// RUTA DE NEXTAUTH - Maneja todas las rutas de autenticación
// ============================================

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
