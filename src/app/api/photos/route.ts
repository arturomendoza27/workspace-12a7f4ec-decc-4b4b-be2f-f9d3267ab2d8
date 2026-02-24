import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";

// ============================================
// API REGISTRO DE FOTOS - CRUD
// Actualizado: Solo referencias de fotos (sin numeroFoto)
// v2.0 - Febrero 2024
// ============================================

// GET - Listar registros de fotos con filtros
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const clientId = searchParams.get("clientId") || "";
    const editada = searchParams.get("editada");
    const impresa = searchParams.get("impresa");
    const publicada = searchParams.get("publicada");

    // Construir filtros
    const where: Record<string, unknown> = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (editada !== null) {
      where.editada = editada === "true";
    }
    if (impresa !== null) {
      where.impresa = impresa === "true";
    }
    if (publicada !== null) {
      where.publicada = publicada === "true";
    }

    if (search) {
      where.OR = [
        { fotoConGorra: { contains: search } },
        { fotoSinGorra: { contains: search } },
        { fotoDeFrente: { contains: search } },
        { client: { cedula: { contains: search } } },
        { client: { nombreCompleto: { contains: search } } }
      ];
    }

    const photos = await db.photoRecord.findMany({
      where,
      include: {
        client: { select: { id: true, cedula: true, nombreCompleto: true } },
        user: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error al obtener fotos:", error);
    return NextResponse.json({ error: "Error al obtener fotos" }, { status: 500 });
  }
}

// POST - Crear nuevo registro de foto
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el usuario actual de la base de datos usando el email
    // (el ID en la sesión puede estar desactualizado si se reinició la BD)
    const user = await db.user.findUnique({ 
      where: { email: sessionUser.email } 
    });
    
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado en la base de datos" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      clientId, 
      fotoConGorra,
      fotoSinGorra,
      fotoDeFrente,
      editada, 
      impresa, 
      publicada, 
      notas 
    } = body;

    // Validar que se seleccionó un cliente
    if (!clientId) {
      return NextResponse.json({ error: "Debe seleccionar un cliente" }, { status: 400 });
    }

    // Verificar que el cliente existe
    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    // Los campos de foto son opcionales - no se requiere validación

    const photo = await db.photoRecord.create({
      data: {
        clientId,
        userId: user.id,
        fotoConGorra: fotoConGorra || null,
        fotoSinGorra: fotoSinGorra || null,
        fotoDeFrente: fotoDeFrente || null,
        editada: editada || false,
        impresa: impresa || false,
        publicada: publicada || false,
        notas: notas || null
      },
      include: {
        client: { select: { id: true, cedula: true, nombreCompleto: true } }
      }
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error al crear registro de foto:", error);
    return NextResponse.json({ error: "Error al crear registro de foto" }, { status: 500 });
  }
}
