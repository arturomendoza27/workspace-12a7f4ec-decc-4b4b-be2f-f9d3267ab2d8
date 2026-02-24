import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Crear usuario administrador por defecto
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "artmen27@fotogestor.com" },
    update: {},
    create: {
      email: "artmen27@fotogestor.com",
      password: adminPassword,
      name: "Administrador",
      role: "ADMIN",
      active: true
    }
  });
  console.log("✅ Usuario administrador creado:", admin.email);

  // Crear usuario operador por defecto
  const operadorPassword = await hash("operador123", 10);
  const operador = await prisma.user.upsert({
    where: { email: "operador@fotogestor.com" },
    update: {},
    create: {
      email: "operador@fotogestor.com",
      password: operadorPassword,
      name: "Operador Demo",
      role: "OPERADOR",
      active: true
    }
  });
  console.log("✅ Usuario operador creado:", operador.email);

 
  console.log("✅ Clientes de ejemplo creados");

  console.log("🎉 Seed completado exitosamente!");
  console.log("\n📋 Credenciales de acceso:");
  console.log("   Admin: admin@fotogestor.com / admin123");
  console.log("   Operador: operador@fotogestor.com / operador123");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
