"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Camera,
  X,
  Loader2,
  CheckCircle,
  Printer,
  Globe,
  User,
  Check,
  HardHat,
  UserCircle,
  CircleDot
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
}

interface PhotoRecord {
  id: string;
  fotoConGorra: string | null;
  fotoSinGorra: string | null;
  fotoDeFrente: string | null;
  editada: boolean;
  impresa: boolean;
  publicada: boolean;
  notas: string | null;
  createdAt: string;
  client: {
    id: string;
    cedula: string;
    nombreCompleto: string;
  };
  user: {
    name: string;
  };
}

// ============================================
// COMPONENTE PRINCIPAL - REGISTRO DE FOTOS
// ============================================
export function PhotoRegistration() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [editingPhoto, setEditingPhoto] = useState<PhotoRecord | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoRecord | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { toast } = useToast();

  // Estado del formulario - Solo referencias de fotos
  const [formData, setFormData] = useState({
    fotoConGorra: "",
    fotoSinGorra: "",
    fotoDeFrente: "",
    editada: false,
    impresa: false,
    publicada: false,
    notas: ""
  });

  // Cargar registros de fotos
  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      
      const response = await fetch(`/api/photos?${params.toString()}`);
      if (!response.ok) throw new Error("Error al cargar fotos");
      const data = await response.json();
      setPhotos(data);
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros de fotos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  // Cargar clientes para el selector
  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Error al cargar clientes");
      const data = await response.json();
      setClients(data);
    } catch {
      // Error silencioso
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
    fetchClients();
  }, [fetchPhotos, fetchClients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPhotos();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchPhotos]);

  // Filtrar clientes para el selector
  const filteredClients = clients.filter(client =>
    client.cedula.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.nombreCompleto.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Seleccionar cliente
  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setIsClientSearchOpen(false);
    setClientSearch("");
  };

  // Abrir diálogo de nueva foto
  const handleNew = () => {
    setEditingPhoto(null);
    setSelectedClient(null);
    setFormData({
      fotoConGorra: "",
      fotoSinGorra: "",
      fotoDeFrente: "",
      editada: false,
      impresa: false,
      publicada: false,
      notas: ""
    });
    setIsDialogOpen(true);
  };

  // Abrir diálogo de edición
  const handleEdit = (photo: PhotoRecord) => {
    setEditingPhoto(photo);
    setSelectedClient({
      id: photo.client.id,
      cedula: photo.client.cedula,
      nombreCompleto: photo.client.nombreCompleto
    });
    setFormData({
      fotoConGorra: photo.fotoConGorra || "",
      fotoSinGorra: photo.fotoSinGorra || "",
      fotoDeFrente: photo.fotoDeFrente || "",
      editada: photo.editada,
      impresa: photo.impresa,
      publicada: photo.publicada,
      notas: photo.notas || ""
    });
    setIsDialogOpen(true);
  };

  // Guardar registro de foto
  const handleSave = async () => {
    if (!editingPhoto && !selectedClient) {
      toast({
        title: "Error",
        description: "Debe seleccionar un cliente",
        variant: "destructive"
      });
      return;
    }

    // Los campos de foto son opcionales - no se requiere validación

    try {
      const url = editingPhoto ? `/api/photos/${editingPhoto.id}` : "/api/photos";
      const method = editingPhoto ? "PUT" : "POST";

      const body = editingPhoto
        ? {
            fotoConGorra: formData.fotoConGorra || null,
            fotoSinGorra: formData.fotoSinGorra || null,
            fotoDeFrente: formData.fotoDeFrente || null,
            editada: formData.editada,
            impresa: formData.impresa,
            publicada: formData.publicada,
            notas: formData.notas
          }
        : {
            clientId: selectedClient?.id,
            fotoConGorra: formData.fotoConGorra || null,
            fotoSinGorra: formData.fotoSinGorra || null,
            fotoDeFrente: formData.fotoDeFrente || null,
            editada: formData.editada,
            impresa: formData.impresa,
            publicada: formData.publicada,
            notas: formData.notas
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar");
      }

      toast({
        title: editingPhoto ? "Registro actualizado" : "Registro creado",
        description: "Los cambios se guardaron correctamente"
      });

      setIsDialogOpen(false);
      fetchPhotos();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar",
        variant: "destructive"
      });
    }
  };

  // Confirmar eliminación
  const confirmDelete = (photo: PhotoRecord) => {
    setPhotoToDelete(photo);
    setIsDeleteDialogOpen(true);
  };

  // Eliminar registro
  const handleDelete = async () => {
    if (!photoToDelete) return;

    try {
      const response = await fetch(`/api/photos/${photoToDelete.id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Error al eliminar");

      toast({
        title: "Registro eliminado",
        description: "El registro de foto se eliminó correctamente"
      });

      setIsDeleteDialogOpen(false);
      setPhotoToDelete(null);
      fetchPhotos();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive"
      });
    }
  };

  // Actualizar estado de foto inline
  const toggleStatus = async (photo: PhotoRecord, field: "editada" | "impresa" | "publicada") => {
    try {
      const response = await fetch(`/api/photos/${photo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !photo[field] })
      });

      if (!response.ok) throw new Error("Error al actualizar");

      // Actualizar localmente
      setPhotos(photos.map(p => 
        p.id === photo.id ? { ...p, [field]: !p[field] } : p
      ));

      toast({
        title: "Estado actualizado",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)}: ${!photo[field] ? "Sí" : "No"}`
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado y acciones */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Registro de Fotos
          </h2>
          <p className="text-muted-foreground text-sm">
            Registre las referencias de fotos por cliente
          </p>
        </div>
        <Button onClick={handleNew} className="h-11">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Foto
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por referencia, cédula o nombre..."
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

      {/* Lista de registros */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron registros de fotos</p>
              <p className="text-sm">Agregue un nuevo registro para comenzar</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Foto con Gorra</TableHead>
                    <TableHead className="hidden sm:table-cell">Foto sin Gorra</TableHead>
                    <TableHead className="hidden md:table-cell">Foto de Frente</TableHead>
                    <TableHead className="text-center">E</TableHead>
                    <TableHead className="text-center">I</TableHead>
                    <TableHead className="text-center">P</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {photos.map((photo) => (
                    <TableRow key={photo.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-[120px]">{photo.client.nombreCompleto}</p>
                          <p className="text-xs text-muted-foreground">{photo.client.cedula}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {photo.fotoConGorra ? (
                          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30">
                            <HardHat className="h-3 w-3 mr-1 text-orange-600" />
                            {photo.fotoConGorra}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {photo.fotoSinGorra ? (
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
                            <UserCircle className="h-3 w-3 mr-1 text-blue-600" />
                            {photo.fotoSinGorra}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {photo.fotoDeFrente ? (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30">
                            <CircleDot className="h-3 w-3 mr-1 text-green-600" />
                            {photo.fotoDeFrente}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(photo, "editada")}
                          className="h-8 w-8 p-0"
                          title="Editada"
                        >
                          {photo.editada ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(photo, "impresa")}
                          className="h-8 w-8 p-0"
                          title="Impresa"
                        >
                          {photo.impresa ? (
                            <Printer className="h-5 w-5 text-blue-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(photo, "publicada")}
                          className="h-8 w-8 p-0"
                          title="Publicada"
                        >
                          {photo.publicada ? (
                            <Globe className="h-5 w-5 text-purple-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(photo)}
                            className="h-9 w-9"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(photo)}
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

      {/* Diálogo de crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPhoto ? "Editar Referencias de Fotos" : "Nuevas Referencias de Fotos"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Selector de cliente - Solo para nuevo registro */}
            {!editingPhoto && (
              <div className="space-y-2">
                <Label>Cliente *</Label>
                {selectedClient ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{selectedClient.nombreCompleto}</p>
                        <p className="text-xs text-muted-foreground">{selectedClient.cedula}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedClient(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsClientSearchOpen(true)}
                    className="w-full h-12 justify-start"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar cliente por cédula o nombre...
                  </Button>
                )}
              </div>
            )}

            {/* Tres tipos de foto - Campos principales */}
            <div className="space-y-3">
              <Label>Referencias de Fotos (opcionales)</Label>
              <div className="grid gap-3">
                {/* Foto con Gorra */}
                <div className="flex items-center gap-3">
                  <div className="shrink-0 h-11 w-11 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <HardHat className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="fotoConGorra" className="text-xs text-muted-foreground mb-1 block">
                      Foto con Gorra
                    </Label>
                    <Input
                      id="fotoConGorra"
                      placeholder="Ej: F-001-G"
                      value={formData.fotoConGorra}
                      onChange={(e) => setFormData({ ...formData, fotoConGorra: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Foto sin Gorra */}
                <div className="flex items-center gap-3">
                  <div className="shrink-0 h-11 w-11 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <UserCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="fotoSinGorra" className="text-xs text-muted-foreground mb-1 block">
                      Foto sin Gorra
                    </Label>
                    <Input
                      id="fotoSinGorra"
                      placeholder="Ej: F-001-SG"
                      value={formData.fotoSinGorra}
                      onChange={(e) => setFormData({ ...formData, fotoSinGorra: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Foto de Frente */}
                <div className="flex items-center gap-3">
                  <div className="shrink-0 h-11 w-11 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CircleDot className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="fotoDeFrente" className="text-xs text-muted-foreground mb-1 block">
                      Foto de Frente
                    </Label>
                    <Input
                      id="fotoDeFrente"
                      placeholder="Ej: F-001-F"
                      value={formData.fotoDeFrente}
                      onChange={(e) => setFormData({ ...formData, fotoDeFrente: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Estados */}
            <div className="space-y-3">
              <Label>Estados</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editada"
                    checked={formData.editada}
                    onCheckedChange={(checked) => setFormData({ ...formData, editada: !!checked })}
                  />
                  <label htmlFor="editada" className="text-sm font-medium leading-none cursor-pointer">
                    Editada
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="impresa"
                    checked={formData.impresa}
                    onCheckedChange={(checked) => setFormData({ ...formData, impresa: !!checked })}
                  />
                  <label htmlFor="impresa" className="text-sm font-medium leading-none cursor-pointer">
                    Impresa
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="publicada"
                    checked={formData.publicada}
                    onCheckedChange={(checked) => setFormData({ ...formData, publicada: !!checked })}
                  />
                  <label htmlFor="publicada" className="text-sm font-medium leading-none cursor-pointer">
                    Publicada
                  </label>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingPhoto ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de búsqueda de clientes - Optimizado para móvil */}
      <Dialog open={isClientSearchOpen} onOpenChange={setIsClientSearchOpen}>
        <DialogContent className="sm:max-w-lg h-[90vh] sm:h-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleccionar Cliente</DialogTitle>
          </DialogHeader>
          
          {/* Buscador de clientes - Sticky en móvil */}
          <div className="sticky top-0 bg-background pb-3 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cédula o nombre..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="pl-10 h-12"
                autoFocus
              />
              {clientSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setClientSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Lista de clientes - Scrollable */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-1 pb-4">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron clientes</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => selectClient(client)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{client.nombreCompleto}</p>
                      <p className="text-sm text-muted-foreground">{client.cedula}</p>
                    </div>
                    <Check className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer con botón cerrar - Sticky en móvil */}
          <div className="sticky bottom-0 bg-background pt-3 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsClientSearchOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro de fotos de <strong>{photoToDelete?.client.nombreCompleto}</strong>. Esta acción no se puede deshacer.
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

      <Toaster />
    </div>
  );
}
