"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Camera, FileCheck, TrendingUp } from "lucide-react";

// ============================================
// COMPONENTE DASHBOARD - Panel principal con estadísticas
// ============================================

interface Stats {
  totalClients: number;
  totalPhotos: number;
  photosEditadas: number;
  photosPublicadas: number;
}

interface DashboardProps {
  stats?: Stats;
}

export function Dashboard({ stats }: DashboardProps) {
  const { data: session } = useSession();

  const statCards = [
    {
      title: "Total Clientes",
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "Fotos Registradas",
      value: stats?.totalPhotos ?? 0,
      icon: Camera,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      title: "Fotos Editadas",
      value: stats?.photosEditadas ?? 0,
      icon: FileCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30"
    },
    {
      title: "Fotos Publicadas",
      value: stats?.photosPublicadas ?? 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Bienvenido, {session?.user?.name}
        </h1>
        <p className="text-muted-foreground">
          Resumen del sistema de gestión
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Utilice el menú lateral para acceder a los diferentes módulos del sistema.
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Gestión de clientes y sus datos</span>
              </li>
              <li className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                <span>Registro y seguimiento de fotos</span>
              </li>
              {session?.user?.role === "ADMIN" && (
                <li className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" />
                  <span>Administración de usuarios</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rol actual:</span>
              <span className="font-medium">{session?.user?.role}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Correo:</span>
              <span className="font-medium">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sesión:</span>
              <span className="text-green-600 font-medium">Activa</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
