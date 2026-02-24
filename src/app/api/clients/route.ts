import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";

// ============================================
// API CLIENTES - CRUD Completo
// Actualizado: nombreCompleto en lugar de nombre/apellidos
// ============================================

// GET - Listar todos los clientes con búsqueda
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    // Construir filtros de búsqueda
    const where = search
      ? {
          OR: [
            { cedula: { contains: search } },
            { nombreCompleto: { contains: search } }
          ]
        }
      : {};

    const clients = await db.client.findMany({
      where,
      include: {
        _count: { select: { photoRecords: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { cedula, nombreCompleto, rh } = body;

    // Validar campos requeridos
    if (!cedula || !nombreCompleto) {
      return NextResponse.json({ error: "Cédula y nombre completo son requeridos" }, { status: 400 });
    }

    // Verificar si la cédula ya existe
    const existingClient = await db.client.findUnique({
      where: { cedula }
    });

    if (existingClient) {
      return NextResponse.json({ error: "La cédula ya está registrada" }, { status: 400 });
    }

    const client = await db.client.create({
      data: {
        cedula,
        nombreCompleto,
        rh: rh || null
      }
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}
