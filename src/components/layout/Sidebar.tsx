"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Users, 
  Camera, 
  UserCog, 
  LogOut, 
  Menu, 
  X,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// COMPONENTE SIDEBAR - Navegación lateral responsive
// ============================================

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const isAdmin = session?.user?.role === "ADMIN";

  const menuItems = [
    { id: "dashboard", label: "Inicio", icon: Home, roles: ["ADMIN", "OPERADOR"] },
    { id: "clients", label: "Clientes", icon: Users, roles: ["ADMIN", "OPERADOR"] },
    { id: "photos", label: "Registro de Fotos", icon: Camera, roles: ["ADMIN", "OPERADOR"] },
    { id: "users", label: "Usuarios", icon: UserCog, roles: ["ADMIN"] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(session?.user?.role as string)
  );

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-card rounded-lg shadow-lg border"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card border-r z-40 transition-transform duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Camera className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">FotoGestor</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
              </div>
            </div>
          </div>

          {/* Usuario */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.role}</p>
              </div>
            </div>
          </div>

          {/* Menú */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  "text-left font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground hover:bg-primary" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Cerrar sesión */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
