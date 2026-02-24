"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  FileSpreadsheet,
  X,
  Loader2,
  Users,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// ============================================
// INTERFACES
// ============================================
interface Client {
  id: string;
  cedula: string;
  nombreCompleto: string;
  rh: string | null;
  createdAt: string;
  _count?: { photoRecords: number };
}

// ============================================
// COMPONENTE PRINCIPAL - LISTA DE CLIENTES
// ============================================
export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  // Estado del formulario
  const [formData, setFormData] = useState({
    cedula: "",
    nombreCompleto: "",
    rh: ""
  });

  // Cargar clientes
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clients?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error("Error al cargar clientes");
      const data = await response.json();
      setClients(data);
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchClients]);

  // Copiar primer apellido al portapapeles
  const copyFirstLastName = async (client: Client) => {
    // Extraer el primer apellido (segunda palabra del nombre completo)
    const parts = client.nombreCompleto.trim().split(/\s+/);
    const firstLastName = parts.length > 1 ? parts[parts.length - 1] : client.nombreCompleto;
    
    try {
      await navigator.clipboard.writeText(firstLastName);
      setCopiedId(client.id);
      toast({
        title: "¡Copiado!",
        description: `"${firstLastName}" copiado al portapapeles`
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive"
      });
    }
  };

  // Abrir diálogo de edición
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      cedula: client.cedula,
      nombreCompleto: client.nombreCompleto,
      rh: client.rh || ""
    });
    setIsDialogOpen(true);
  };

  // Abrir diálogo de nuevo cliente
  const handleNew = () => {
    setEditingClient(null);
    setFormData({
      cedula: "",
      nombreCompleto: "",
      rh: ""
    });
    setIsDialogOpen(true);
  };

  // Guardar cliente (crear o actualizar)
  const handleSave = async () => {
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
      const method = editingClient ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar");
      }

      toast({
        title: editingClient ? "Cliente actualizado" : "Cliente creado",
        description: "Los cambios se guardaron correctamente"
      });

      setIsDialogOpen(false);
      fetchClients();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar",
        variant: "destructive"
      });
    }
  };

  // Confirmar eliminación
  const confirmDelete = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  // Eliminar cliente
  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      const response = await fetch(`/api/clients/${clientToDelete.id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Error al eliminar");

      toast({
        title: "Cliente eliminado",
        description: "El cliente se eliminó correctamente"
      });

      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
      fetchClients();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive"
      });
    }
  };

  // Manejar importación de Excel - Envia archivo al backend
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      // Crear FormData para enviar el archivo al backend
      const importFormData = new FormData();
      importFormData.append("file", file);

      const response = await fetch("/api/import", {
        method: "POST",
        body: importFormData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error en la importación");
      }

      toast({
        title: "Importación completada",
        description: `${result.imported} clientes creados, ${result.updated} actualizados${result.errors ? `. ${result.errors.length} errores.` : ""}`
      });

      setIsImportDialogOpen(false);
      fetchClients();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar el archivo Excel",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Encabezado y acciones */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gestión de Clientes
          </h2>
          <p className="text-muted-foreground text-sm">
            Administre la información de sus clientes
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button onClick={handleNew} className="flex-1 sm:flex-none h-11">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsImportDialogOpen(true)}
            className="flex-1 sm:flex-none h-11"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Importar Excel
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cédula o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Lista de clientes */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron clientes</p>
              <p className="text-sm">Intente con otra búsqueda o agregue un nuevo cliente</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Cédula</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead className="hidden md:table-cell">RH</TableHead>
                    <TableHead className="hidden lg:table-cell">Fotos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.cedula}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[200px]">{client.nombreCompleto}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyFirstLastName(client)}
                            className="h-8 w-8 p-0 shrink-0"
                            title="Copiar apellido"
                          >
                            {copiedId === client.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {client.rh && <Badge variant="secondary">{client.rh}</Badge>}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">
                          {client._count?.photoRecords || 0} fotos
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(client)}
                            className="h-9 w-9"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(client)}
                            className="h-9 w-9 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de crear/editar - Simplificado */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula *</Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                className="h-11"
                placeholder="Ej: 12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
              <Input
                id="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                className="h-11"
                placeholder="Ej: Juan Pérez García"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rh">RH (Tipo de Sangre)</Label>
              <Input
                id="rh"
                value={formData.rh}
                onChange={(e) => setFormData({ ...formData, rh: e.target.value })}
                placeholder="Ej: O+"
                className="h-11"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingClient ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a <strong>{clientToDelete?.nombreCompleto}</strong> y todos sus registros de fotos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de importación */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Clientes desde Excel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Seleccione un archivo Excel (.xlsx) con las siguientes columnas:
            </p>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Columnas requeridas:</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><strong>Cédula</strong> - Identificador único *</p>
                <p><strong>Nombre Completo</strong> (o "Nombre") *</p>
                <p><strong>RH</strong> - Tipo de sangre (opcional)</p>
              </CardContent>
            </Card>
            <div className="flex items-center justify-center w-full">
              {isImporting ? (
                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Procesando archivo...</p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileSpreadsheet className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Click para seleccionar</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Archivos .xlsx</p>
                  </div>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImport}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
