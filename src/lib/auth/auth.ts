import { getServerSession } from "next-auth";
import { authOptions } from "./authConfig";

// ============================================
// UTILIDADES DE AUTENTICACIÓN
// ============================================

// Obtener la sesión actual del usuario
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

// Verificar si el usuario es administrador
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

// Verificar si el usuario está autenticado
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
