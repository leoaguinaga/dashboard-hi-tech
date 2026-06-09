/**
 * Crea un usuario con rol ADMIN en la base de datos.
 *
 * Uso:
 *   pnpm create-admin                                        # usa valores por defecto
 *   pnpm create-admin admin@empresa.com "MiClave123" "Leo"   # argumentos posicionales
 *
 * Variables de entorno opcionales (alternativa a args):
 *   ADMIN_EMAIL    ADMIN_PASSWORD    ADMIN_NAME
 */

import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

const [, , argEmail, argPassword, argName] = process.argv;

const email    = argEmail    ?? process.env.ADMIN_EMAIL    ?? "admin@hitech.com";
const password = argPassword ?? process.env.ADMIN_PASSWORD ?? "password123";
const name     = argName     ?? process.env.ADMIN_NAME     ?? "Administrador";

async function main() {
  console.log(`\n🔧  Creando admin: ${email}\n`);

  // Verifica si ya existe para no duplicar
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === "ADMIN") {
      console.log(`✅  El usuario ${email} ya existe con rol ADMIN. Sin cambios.`);
    } else {
      await prisma.user.update({
        where: { email },
        data:  { role: "ADMIN" },
      });
      console.log(`✅  Usuario ${email} actualizado a rol ADMIN.`);
    }
    return;
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name, role: "ADMIN" },
  });

  if (!result.user) {
    throw new Error("Better-Auth no devolvió usuario. Revisa los logs.");
  }

  // Better-Auth puede ignorar el campo `role` en signUp; lo forzamos en DB.
  await prisma.user.update({
    where: { id: result.user.id },
    data:  { role: "ADMIN" },
  });

  console.log(`✅  Admin creado:`);
  console.log(`    Email:    ${email}`);
  console.log(`    Nombre:   ${name}`);
  console.log(`    Rol:      ADMIN`);
  console.log(`\n   ⚠️  Cambia la contraseña después del primer acceso.\n`);
}

main()
  .catch((err) => {
    console.error("❌  Error:", err.message ?? err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
