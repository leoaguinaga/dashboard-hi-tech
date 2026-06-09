import path from "node:path"
import { createRequire } from "node:module"
import { defineConfig } from "prisma/config"

const require = createRequire(import.meta.url)
const dotenv = require("dotenv") as typeof import("dotenv")
dotenv.config({ path: path.join(import.meta.dirname, ".env") })

export default defineConfig({
  schema: path.join(import.meta.dirname, "prisma/schema.prisma"),
  migrations: {
    path: path.join(import.meta.dirname, "prisma/migrations"),
  },
})
