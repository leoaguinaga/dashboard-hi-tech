# Setup & Variables de Entorno

## Variables requeridas

Crear `/dashboard/.env.local`:

```bash
# Base de datos
DATABASE_URL="file:./dev.db"   # SQLite local
# DATABASE_URL="postgresql://..."  # PostgreSQL en producción

# Better-Auth
BETTER_AUTH_SECRET="genera-un-string-aleatorio-de-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="hi-tech-portfolio"
R2_PUBLIC_URL="https://pub-xxx.r2.dev"   # URL pública del bucket

# Google Ads API
GOOGLE_ADS_DEVELOPER_TOKEN=""
GOOGLE_ADS_CLIENT_ID=""        # OAuth2 client ID (Google Cloud Console)
GOOGLE_ADS_CLIENT_SECRET=""
GOOGLE_ADS_CUSTOMER_ID=""      # ID de la cuenta de Google Ads (sin guiones)
```

## Paquetes a instalar

```bash
# ORM
pnpm add prisma @prisma/client
pnpm add -D prisma

# Auth
pnpm add better-auth

# UI
pnpm add shadcn
pnpm dlx shadcn@latest init

# R2 / S3 compatible
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Google Ads
pnpm add google-ads-api

# Charts
pnpm add recharts

# Utilidades
pnpm add date-fns zod
```

## Inicializar Prisma

```bash
cd dashboard
pnpm prisma init
# pegar schema de docs/schema.md en prisma/schema.prisma
pnpm prisma migrate dev --name init
pnpm prisma generate
```

## Google Ads — pasos de activación

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com).
2. Habilitar "Google Ads API".
3. Crear credenciales OAuth2 (tipo "Web application").
4. Solicitar Developer Token en Google Ads > API Center (puede tardar días).
5. Agregar `GOOGLE_ADS_*` al `.env.local`.
6. Conectar desde `/ads/connect` dentro del dashboard.

## R2 — pasos de activación

1. Crear bucket en Cloudflare R2.
2. Habilitar "Public access" en el bucket.
3. Generar API Token con permisos de lectura/escritura al bucket.
4. Agregar `R2_*` al `.env.local`.
