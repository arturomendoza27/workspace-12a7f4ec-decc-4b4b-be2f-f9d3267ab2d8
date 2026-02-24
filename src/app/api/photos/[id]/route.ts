import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";

// ============================================
// API FOTO POR ID - Actualizar y Eliminar
// ============================================

// GET - Obtener foto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const photo = await db.photoRecord.findUnique({
      where: { id },
      include: {
        client: true,
        user: { select: { name: true } }
      }
    });

    if (!photo) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error al obtener foto:", error);
    return NextResponse.json({ error: "Error al obtener foto" }, { status: 500 });
  }
}

// PUT - Actualizar registro de foto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      fotoConGorra,
      fotoSinGorra,
      fotoDeFrente,
      editada, 
      impresa, 
      publicada, 
      notas 
    } = body;

    // Verificar si el registro existe
    const existingPhoto = await db.photoRecord.findUnique({ where: { id } });
    if (!existingPhoto) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    const photo = await db.photoRecord.update({
      where: { id },
      data: {
        fotoConGorra: fotoConGorra !== undefined ? fotoConGorra : existingPhoto.fotoConGorra,
        fotoSinGorra: fotoSinGorra !== undefined ? fotoSinGorra : existingPhoto.fotoSinGorra,
        fotoDeFrente: fotoDeFrente !== undefined ? fotoDeFrente : existingPhoto.fotoDeFrente,
        editada: editada ?? existingPhoto.editada,
        impresa: impresa ?? existingPhoto.impresa,
        publicada: publicada ?? existingPhoto.publicada,
        notas: notas !== undefined ? notas : existingPhoto.notas
      },
      include: {
        client: { select: { id: true, cedula: true, nombreCompleto: true } }
      }
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error al actualizar foto:", error);
    return NextResponse.json({ error: "Error al actualizar foto" }, { status: 500 });
  }
}

// DELETE - Eliminar registro de foto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar si el registro existe
    const existingPhoto = await db.photoRecord.findUnique({ where: { id } });
    if (!existingPhoto) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    await db.photoRecord.delete({ where: { id } });

    return NextResponse.json({ message: "Registro eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar foto:", error);
    return NextResponse.json({ error: "Error al eliminar foto" }, { status: 500 });
  }
}
