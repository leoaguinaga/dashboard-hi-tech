# Hi-Tech HVAC — Dashboard Overview

Sistema interno para gestión operativa de una empresa contratista de HVAC. Acceso restringido por autenticación (Better-Auth). No es público.

## Scope

| Módulo | Propósito |
|---|---|
| [Home / KPIs](./modules/home-kpis.md) | Métricas clave del negocio en tiempo real |
| [Portfolio](./modules/portfolio.md) | Subir y publicar proyectos hacia la landing page |
| [Google Ads](./modules/google-ads.md) | Seguimiento de campañas y CAC |
| [CRM](./modules/crm.md) | Clientes, canal de origen y recordatorios de seguimiento |

## Usuarios y roles

Dos roles iniciales gestionados con Better-Auth:

- **ADMIN** — acceso completo: crear, editar, eliminar en todos los módulos.
- **VIEWER** — lectura únicamente. Sin acciones destructivas.

Usuarios esperados: 2–4 personas (dueño + técnicos o vendedores).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | Better-Auth |
| ORM | Prisma + SQLite (dev) → PostgreSQL (prod) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Storage imágenes | Cloudflare R2 |
| Google Ads data | Google Ads API (OAuth2) |
| Notificaciones | In-app por ahora; WhatsApp Business API en roadmap |

## Estilo visual

- **Paleta**: Azul corporativo + Blanco. Acentos en azul oscuro (`#1D4ED8` o el primario del brand).
- **Densidad**: Compacta — espaciado equivalente a `gap-3 / p-3`. Referencia: Vercel dashboard, Cloudflare dashboard.
- **Tipografía**: Inter o Geist (ya en la landing).
- **Modo**: Light por defecto. Dark mode como mejora futura.
- **Componentes**: shadcn/ui con variantes `sm` donde sea posible. Tablas densas, cards sin padding excesivo.

## Carpeta de rutas (Next.js App Router)

```
app/
  (auth)/
    login/
  (dashboard)/
    layout.tsx          ← sidebar + header
    page.tsx            ← home KPIs
    portfolio/
    ads/
    crm/
      clientes/
      seguimientos/
```
