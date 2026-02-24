"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "@/components/layout/LoginForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/layout/Dashboard";
import { ClientList } from "@/components/clients/ClientList";
import { PhotoRegistration } from "@/components/photos/PhotoRegistration";
import { UserManagement } from "@/components/users/UserManagement";
import { Loader2 } from "lucide-react";

// ============================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ============================================

function MainContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalPhotos: 0,
    photosEditadas: 0,
    photosPublicadas: 0
  });

  // Obtener tab desde URL con useMemo
  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");
    if (tab && ["dashboard", "clients", "photos", "users"].includes(tab)) {
      return tab;
    }
    return "dashboard";
  }, [searchParams]);

  // Actualizar URL cuando cambia el tab
  useEffect(() => {
    if (session) {
      router.push(`/?tab=${activeTab}`, { scroll: false });
    }
  }, [activeTab, session, router]);

  // Cargar estadísticas con fetch para evitar setState en efecto
  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    
    const loadStats = async () => {
      try {
        const [clientsRes, photosRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/photos")
        ]);
        
        if (!cancelled && clientsRes.ok && photosRes.ok) {
          const clients = await clientsRes.json();
          const photos = await photosRes.json();
          
          setStats({
            totalClients: clients.length,
            totalPhotos: photos.length,
            photosEditadas: photos.filter((p: { editada: boolean }) => p.editada).length,
            photosPublicadas: photos.filter((p: { publicada: boolean }) => p.publicada).length
          });
        }
      } catch {
        // Error silencioso
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [session]);

  // Mostrar loading mientras carga la sesión
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si no hay sesión, mostrar login
  if (!session) {
    return <LoginForm />;
  }

  // Renderizar contenido según el tab activo
  const renderContent = () => {
    switch (activeTab) {
      case "clients":
        return <ClientList />;
      case "photos":
        return <PhotoRegistration />;
      case "users":
        return session.user?.role === "ADMIN" ? <UserManagement /> : <Dashboard stats={stats} />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  // Función para cambiar tab (para el sidebar)
  const handleTabChange = (newTab: string) => {
    router.push(`/?tab=${newTab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Contenido principal */}
      <main className="lg:pl-64 flex-1">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {renderContent()}
        </div>
      </main>

      {/* Footer fijo */}
      <footer className="lg:pl-64 bg-card border-t py-4 mt-auto">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 FotoGestor - Sistema de Gestión de Clientes y Fotos</p>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL CON SUSPENSE
// ============================================
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
