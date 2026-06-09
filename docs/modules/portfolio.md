# Módulo: Portfolio

Gestión de proyectos que se muestran públicamente en la landing page (`/portfolio`).

## Flujo

```
Admin sube proyecto → imágenes se almacenan en R2 → registro en DB → 
landing page consulta la DB/API y renderiza el portfolio
```

## Funcionalidades

- Crear proyecto: título, descripción, tipo de servicio, imágenes, tags, publicado/borrador.
- Editar y eliminar proyectos.
- Reordenar proyectos (drag & drop o campo `order`).
- Toggle publicado/borrador sin eliminar.
- Vista previa antes de publicar.

## Campos del proyecto

| Campo | Tipo | Notas |
|---|---|---|
| `title` | string | Nombre del proyecto |
| `description` | string (markdown) | Descripción visible en landing |
| `serviceType` | enum | INSTALLATION / MAINTENANCE / REPAIR |
| `images` | string[] | URLs de R2 |
| `tags` | string[] | e.g. "Residencial", "Comercial", "Split" |
| `published` | boolean | Visible en landing o no |
| `order` | int | Orden de aparición |
| `createdAt` | DateTime | |

## Integración con R2

- Se usa el SDK oficial de `@aws-sdk/client-s3` (compatible con R2).
- Endpoint en Next.js: `POST /api/upload` — recibe `multipart/form-data`, sube a R2, devuelve la URL pública.
- El bucket R2 expone una URL pública (`https://pub-xxx.r2.dev`) para consumo desde la landing.
- Límite de tamaño por imagen: 5 MB. Formatos: `.webp`, `.jpg`, `.png`.

## Integración con la landing (Astro)

La landing (Astro, en `/landing`) consume los proyectos vía fetch a un endpoint del dashboard:

```
GET /api/portfolio?published=true
```

Devuelve JSON con los proyectos publicados ordenados por `order`.

## Schema Prisma

```prisma
model Project {
  id          String      @id @default(cuid())
  title       String
  description String
  serviceType JobType
  images      String[]
  tags        String[]
  published   Boolean     @default(false)
  order       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

## Rutas

```
/portfolio                  ← tabla de proyectos
/portfolio/new              ← formulario de creación
/portfolio/[id]/edit        ← edición
```

## Componentes UI

```
<ProjectsTable />           ← shadcn DataTable con toggle publicado
<ProjectForm />             ← formulario con upload de imágenes
<ImageUploader />           ← drag & drop, preview, sube a R2
```
