import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";
import * as XLSX from "xlsx";

// ============================================
// API IMPORTACIÓN - Importar clientes desde Excel
// ============================================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el archivo del FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    // Leer el archivo como buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    
    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ error: "El archivo no contiene datos" }, { status: 400 });
    }

    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const row of jsonData) {
      // Mapear columnas del Excel a nuestro formato (flexible con nombres)
      const cedula = String(
        row["Cédula"] || row["cedula"] || row["CEDULA"] || 
        row["Cedula"] || row["ID"] || row["id"] || ""
      ).trim();
      
      // Nombre completo - puede venir como "Nombre", "Nombre Completo", etc.
      const nombreCompleto = String(
        row["Nombre Completo"] || row["nombreCompleto"] || row["NOMBRE_COMPLETO"] ||
        row["Nombre"] || row["nombre"] || row["NOMBRE"] || 
        row["NOMBRES"] || row["Name"] || row["Cliente"] || ""
      ).trim();

      // Validar campos requeridos
      if (!cedula || !nombreCompleto) {
        errors.push(`Fila inválida (omitida): cédula="${cedula}", nombre="${nombreCompleto}"`);
        continue;
      }

      try {
        // Verificar si ya existe el cliente
        const existingClient = await db.client.findUnique({
          where: { cedula }
        });

        const clientData = {
          nombreCompleto,
          rh: String(row["RH"] || row["rh"] || row["Rh"] || row["SANGRE"] || "") || null
        };

        if (existingClient) {
          // Actualizar cliente existente
          await db.client.update({
            where: { cedula },
            data: {
              nombreCompleto: clientData.nombreCompleto,
              rh: clientData.rh || existingClient.rh
            }
          });
          updated++;
        } else {
          // Crear nuevo cliente
          await db.client.create({
            data: {
              cedula,
              nombreCompleto: clientData.nombreCompleto,
              rh: clientData.rh
            }
          });
          imported++;
        }
      } catch {
        errors.push(`Error al procesar cédula: ${cedula}`);
      }
    }

    return NextResponse.json({
      message: "Importación completada",
      imported,
      updated,
      total: imported + updated,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Limitar errores mostrados
    });
  } catch (error) {
    console.error("Error en importación:", error);
    return NextResponse.json({ error: "Error en importación" }, { status: 500 });
  }
}
