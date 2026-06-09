import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creando usuario ADMIN...");
  const admin = await auth.api.signUpEmail({
    body: {
      email: "admin@hitech.com",
      password: "password123",
      name: "Administrador HVAC",
      role: "ADMIN",
    },
  });
  console.log("Creado Admin:", admin.user.email);

  console.log("Creando usuario VIEWER...");
  const viewer = await auth.api.signUpEmail({
    body: {
      email: "viewer@hitech.com",
      password: "password123",
      name: "Visualizador HVAC",
      role: "VIEWER",
    },
  });
  console.log("Creado Viewer:", viewer.user.email);

  console.log("¡Semilla ejecutada con éxito!");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar la semilla:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
