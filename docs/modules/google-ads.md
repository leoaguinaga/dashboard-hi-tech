# Módulo: Google Ads

Seguimiento de campañas publicitarias y métricas de adquisición de clientes.

## Integración

- **Método**: Google Ads API (REST/gRPC) via OAuth2.
- **Librería**: `google-ads-api` (npm) o llamadas directas al REST API v19.
- **Sincronización**: job programado (cron o `node-cron`) que jala datos cada 24h. También se puede refrescar manualmente.
- Los datos se persisten en la DB (no se consulta la API en cada page load).

## Métricas que se muestran

| Métrica | Descripción |
|---|---|
| Gasto total | `metrics.cost_micros / 1_000_000` |
| Impresiones | `metrics.impressions` |
| Clicks | `metrics.clicks` |
| CTR | `clicks / impressions * 100` |
| CPC promedio | `cost / clicks` |
| Conversiones | `metrics.conversions` (leads/formularios) |
| Costo por conversión | `cost / conversions` |
| **CAC** | `cost / new_clients_attributed` (cruza con CRM) |

> **CAC real**: se calcula cruzando el gasto de Ads en un período contra los clientes nuevos en ese mismo período cuyo canal sea "Google Ads".

## Vistas

1. **Resumen de campañas** — tabla con todas las campañas activas y sus métricas del período seleccionado.
2. **Tendencia de gasto** — line chart por día/semana.
3. **Conversiones vs Gasto** — bar chart comparativo.
4. **CAC histórico** — line chart mensual.

## Configuración OAuth2

El usuario admin conecta su cuenta de Google Ads una sola vez:

```
/ads/connect   ← inicia flujo OAuth2 con Google
/ads/callback  ← callback, guarda refresh_token en DB (cifrado)
```

Los tokens se almacenan en la tabla `OAuthToken`, cifrados en reposo.

## Schema Prisma

```prisma
model AdCampaign {
  id             String   @id @default(cuid())
  googleCampaignId String @unique
  name           String
  status         String
  createdAt      DateTime @default(now())
  metrics        AdMetric[]
}

model AdMetric {
  id             String   @id @default(cuid())
  campaignId     String
  date           DateTime
  impressions    Int
  clicks         Int
  costMicros     BigInt
  conversions    Float
  campaign       AdCampaign @relation(fields: [campaignId], references: [id])

  @@unique([campaignId, date])
}

model OAuthToken {
  id           String   @id @default(cuid())
  provider     String   // "google-ads"
  accessToken  String
  refreshToken String
  expiresAt    DateTime
  updatedAt    DateTime @updatedAt
}
```

## Rutas

```
/ads                ← dashboard de campañas
/ads/campaigns      ← tabla detallada por campaña
/ads/connect        ← inicio flujo OAuth
/ads/callback       ← callback OAuth (no UI, redirect)
```

## Consideraciones

- La API de Google Ads requiere un **Developer Token** aprobado por Google (puede tomar días). Documentar en README de setup.
- Nivel de acceso: "Basic access" es suficiente para métricas de campañas propias.
- El `customer_id` de Google Ads debe guardarse en variables de entorno o en la tabla `OAuthToken`.
