# Módulo: CRM

Seguimiento de clientes, canal de origen y recordatorios automáticos de mantenimiento preventivo.

## Entidades

### Cliente (`Client`)

Registro de cada cliente de la empresa.

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre completo |
| `phone` | string | Teléfono de contacto |
| `email` | string? | Email (opcional) |
| `address` | string? | Dirección del servicio |
| `channel` | enum | Canal de origen |
| `notes` | string? | Notas libres |
| `createdAt` | DateTime | Fecha de ingreso al sistema |

**Canales de origen (`Channel`)**:
- `GOOGLE_ADS` — vino por anuncio pago
- `REFERRAL` — referido por otro cliente
- `ORGANIC` — encontró la empresa orgánicamente (SEO, redes)
- `DIRECT` — llamó directo / sin tracking claro

### Servicio (`ServiceRecord`)

Cada trabajo realizado a un cliente. Es la base para calcular el próximo recordatorio.

| Campo | Tipo | Descripción |
|---|---|---|
| `clientId` | string | FK a `Client` |
| `type` | enum `JobType` | INSTALLATION / MAINTENANCE / REPAIR |
| `serviceDate` | DateTime | Fecha en que se realizó |
| `equipmentBrand` | string? | Marca del equipo (Carrier, Trane, etc.) |
| `equipmentModel` | string? | Modelo del equipo |
| `notes` | string? | Observaciones del técnico |
| `followUpDays` | Int | Días hasta el próximo contacto (default: 180) |
| `followUpDate` | DateTime | `serviceDate + followUpDays` (calculado) |

### Recordatorio (`Reminder`)

Se genera automáticamente cuando se crea/edita un `ServiceRecord`.

| Campo | Tipo | Descripción |
|---|---|---|
| `clientId` | string | FK a `Client` |
| `serviceRecordId` | string | FK a `ServiceRecord` |
| `dueDate` | DateTime | Fecha en que debe aparecer el aviso |
| `message` | string | Texto del recordatorio |
| `status` | enum | PENDING / DISMISSED / DONE |
| `createdAt` | DateTime | |

## Lógica de recordatorios

Al crear un `ServiceRecord` de tipo `INSTALLATION`:
1. Se calcula `followUpDate = serviceDate + 180 días` (configurable).
2. Se inserta un `Reminder` con `dueDate = followUpDate` y status `PENDING`.
3. El dashboard muestra todos los `Reminder` donde `dueDate <= today + 7 días` y `status = PENDING` en un panel de alertas visible desde el inicio.

Al marcar un `Reminder` como `DONE`:
1. Se puede generar un nuevo `ServiceRecord` de tipo `MAINTENANCE`.
2. Opcionalmente crear un nuevo `Reminder` para 6 meses después.

## Notificaciones in-app

- Un badge en el sidebar muestra la cantidad de recordatorios vencidos o por vencer en 7 días.
- En la home hay una sección "Seguimientos pendientes" con los próximos 5 recordatorios.
- En `/crm/seguimientos` se listan todos los recordatorios con filtros por estado y fecha.

> **Roadmap**: integración con WhatsApp Business API para enviar mensaje directo al cliente cuando `dueDate = today`.

## Schema Prisma

```prisma
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
  id             String    @id @default(cuid())
  clientId       String
  type           JobType
  serviceDate    DateTime
  equipmentBrand String?
  equipmentModel String?
  notes          String?
  followUpDays   Int       @default(180)
  followUpDate   DateTime

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

## Rutas

```
/crm                        ← resumen: total clientes, canales, recordatorios pendientes
/crm/clientes               ← tabla de clientes con búsqueda y filtros
/crm/clientes/new           ← crear cliente
/crm/clientes/[id]          ← perfil del cliente: datos, historial de servicios, recordatorios
/crm/seguimientos           ← todos los recordatorios con filtros
```

## Componentes UI

```
<ClientsTable />            ← DataTable con columnas: nombre, canal, último servicio, próx. recordatorio
<ClientForm />              ← crear/editar cliente
<ClientProfile />           ← vista detalle: historial + recordatorios
<ServiceRecordForm />       ← registrar servicio (auto-genera recordatorio)
<RemindersTable />          ← lista de recordatorios con badge de urgencia
<RemindersWidget />         ← widget para la home: próximos 5
```
