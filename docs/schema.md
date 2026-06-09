# Schema Prisma — Completo

Schema unificado para copiar directamente en `prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // cambiar a "postgresql" en producción
  url      = env("DATABASE_URL")
}

// ─── Auth (Better-Auth) ───────────────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          UserRole  @default(VIEWER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions Session[]
  accounts Account[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

model Project {
  id          String    @id @default(cuid())
  title       String
  description String
  serviceType JobType
  images      String    // JSON array de URLs
  tags        String    // JSON array de strings
  published   Boolean   @default(false)
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// ─── CRM ─────────────────────────────────────────────────────────────────────

model Client {
  id        String   @id @default(cuid())
  name      String
  phone     String
  email     String?
  address   String?
  channel   Channel
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  serviceRecords ServiceRecord[]
  reminders      Reminder[]
  jobs           Job[]
}

model ServiceRecord {
  id             String   @id @default(cuid())
  clientId       String
  type           JobType
  serviceDate    DateTime
  equipmentBrand String?
  equipmentModel String?
  notes          String?
  followUpDays   Int      @default(180)
  followUpDate   DateTime
  createdAt      DateTime @default(now())

  client    Client     @relation(fields: [clientId], references: [id])
  reminders Reminder[]
}

model Reminder {
  id              String         @id @default(cuid())
  clientId        String
  serviceRecordId String
  dueDate         DateTime
  message         String
  status          ReminderStatus @default(PENDING)
  createdAt       DateTime       @default(now())

  client        Client        @relation(fields: [clientId], references: [id])
  serviceRecord ServiceRecord @relation(fields: [serviceRecordId], references: [id])
}

model Job {
  id          String    @id @default(cuid())
  clientId    String
  type        JobType
  status      JobStatus @default(PENDING)
  amount      Float     @default(0)
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  client Client @relation(fields: [clientId], references: [id])
}

// ─── Google Ads ───────────────────────────────────────────────────────────────

model AdCampaign {
  id               String     @id @default(cuid())
  googleCampaignId String     @unique
  name             String
  status           String
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  metrics AdMetric[]
}

model AdMetric {
  id           String   @id @default(cuid())
  campaignId   String
  date         DateTime
  impressions  Int      @default(0)
  clicks       Int      @default(0)
  costMicros   Int      @default(0)  // dividir /1_000_000 para obtener USD
  conversions  Float    @default(0)

  campaign AdCampaign @relation(fields: [campaignId], references: [id])

  @@unique([campaignId, date])
}

model OAuthToken {
  id           String   @id @default(cuid())
  provider     String   @unique  // "google-ads"
  accessToken  String
  refreshToken String
  expiresAt    DateTime
  updatedAt    DateTime @updatedAt
}

// ─── Enums ────────────────────────────────────────────────────────────────────

enum UserRole {
  ADMIN
  VIEWER
}

enum JobType {
  INSTALLATION
  MAINTENANCE
  REPAIR
}

enum JobStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Channel {
  GOOGLE_ADS
  REFERRAL
  ORGANIC
  DIRECT
}

enum ReminderStatus {
  PENDING
  DISMISSED
  DONE
}
```

> **Nota SQLite**: SQLite no soporta arrays nativos. Los campos `images` y `tags` en `Project` se almacenan como JSON string. Con PostgreSQL en producción se pueden convertir a `String[]`.
