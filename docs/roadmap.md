# Roadmap

## Fase 1 — Base (semana 1-2)

- [ ] Instalar dependencias: Prisma, Better-Auth, shadcn
- [ ] Schema DB + migraciones iniciales
- [ ] Layout del dashboard: sidebar, header, rutas base
- [ ] Autenticación con Better-Auth (email/password)
- [ ] Roles ADMIN / VIEWER

## Fase 2 — CRM (semana 2-3)

- [ ] CRUD de clientes
- [ ] Registro de servicios (`ServiceRecord`)
- [ ] Generación automática de recordatorios al crear servicio
- [ ] Vista `/crm/seguimientos` con filtros
- [ ] Badge en sidebar con recordatorios pendientes
- [ ] Widget de próximos recordatorios en la home

## Fase 3 — Portfolio (semana 3-4)

- [ ] Integración con R2 (endpoint `/api/upload`)
- [ ] CRUD de proyectos con upload de imágenes
- [ ] Toggle publicado/borrador
- [ ] Endpoint público `GET /api/portfolio`
- [ ] Conectar landing (Astro) al endpoint

## Fase 4 — Home KPIs (semana 4)

- [ ] Queries de ingresos, trabajos, clientes nuevos
- [ ] Stat cards en la home
- [ ] Gráfico de ingresos (recharts)
- [ ] Gráfico de trabajos por tipo
- [ ] Gráfico de clientes por canal

## Fase 5 — Google Ads (semana 5)

- [ ] Flujo OAuth2 con Google (`/ads/connect`)
- [ ] Sincronización diaria de campañas y métricas
- [ ] Dashboard de campañas
- [ ] Cálculo de CAC cruzando Ads + CRM

## Roadmap futuro

- WhatsApp Business API para notificar clientes directamente
- Dark mode
- App móvil (PWA o React Native)
- Módulo de facturación / cotizaciones
- Dashboard de inventario de equipos
