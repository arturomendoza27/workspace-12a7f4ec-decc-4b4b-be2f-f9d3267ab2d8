import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";

// ============================================
// API CLIENTE POR ID - Actualizar y Eliminar
// ============================================

// GET - Obtener cliente por ID
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
    const client = await db.client.findUnique({
      where: { id },
      include: {
        photoRecords: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 });
  }
}

// PUT - Actualizar cliente
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
    const { cedula, nombreCompleto, rh } = body;

    // Verificar si el cliente existe
    const existingClient = await db.client.findUnique({ where: { id } });
    if (!existingClient) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    // Si se cambia la cédula, verificar que no exista
    if (cedula && cedula !== existingClient.cedula) {
      const cedulaExists = await db.client.findUnique({ where: { cedula } });
      if (cedulaExists) {
        return NextResponse.json({ error: "La cédula ya está registrada" }, { status: 400 });
      }
    }

    const client = await db.client.update({
      where: { id },
      data: {
        cedula: cedula || existingClient.cedula,
        nombreCompleto: nombreCompleto || existingClient.nombreCompleto,
        rh: rh !== undefined ? rh : existingClient.rh
      }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 });
  }
}

// DELETE - Eliminar cliente
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

    // Verificar si el cliente existe
    const existingClient = await db.client.findUnique({ where: { id } });
    if (!existingClient) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    // Eliminar cliente (las fotos se eliminan en cascada)
    await db.client.delete({ where: { id } });

    return NextResponse.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  }
}
