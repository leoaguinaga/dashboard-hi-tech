# Design System

Guía visual para el dashboard. Referencia: Vercel Dashboard, Cloudflare Dashboard.

## Principios

- **Densidad alta**: menos padding, más información visible sin scroll.
- **Sin decoración innecesaria**: sin gradientes llamativos, sin shadows excesivas.
- **Acción clara**: botones primarios solo donde hay una acción principal por vista.

## Colores (CSS variables)

```css
/* globals.css */
:root {
  --brand-primary: #1D4ED8;    /* Azul corporativo */
  --brand-dark:    #1E3A8A;    /* Azul oscuro — hover, activo */
  --brand-light:   #DBEAFE;    /* Azul pálido — fondos de badge */

  --bg-base:       #FFFFFF;
  --bg-subtle:     #F8FAFC;    /* Fondo de cards y sidebar */
  --bg-muted:      #F1F5F9;    /* Hover rows, dividers */

  --text-primary:  #0F172A;
  --text-muted:    #64748B;
  --text-disabled: #CBD5E1;

  --border:        #E2E8F0;
  --border-focus:  #1D4ED8;

  --success:       #16A34A;
  --warning:       #D97706;
  --danger:        #DC2626;
}
```

## Espaciado

| Contexto | Valor |
|---|---|
| Padding de página | `px-6 py-4` |
| Gap entre secciones | `gap-4` |
| Padding de card | `p-4` |
| Padding de stat card | `p-3` |
| Gap entre stat cards | `gap-3` |
| Padding de tabla celda | `px-3 py-2` |
| Gap sidebar items | `gap-0.5` |

## Tipografía

| Elemento | Clase |
|---|---|
| Título de página | `text-xl font-semibold` |
| Subtítulo de sección | `text-sm font-medium text-muted` |
| Stat value (KPI) | `text-2xl font-bold` |
| Stat label | `text-xs text-muted` |
| Cuerpo / tabla | `text-sm` |
| Caption | `text-xs text-muted` |

## Componentes clave

### Stat Card

```tsx
<div className="rounded-lg border border-border bg-bg-subtle p-3">
  <p className="text-xs text-muted mb-1">Ingresos del mes</p>
  <p className="text-2xl font-bold text-primary">$12,400</p>
  <p className="text-xs text-success mt-0.5">+8% vs mes anterior</p>
</div>
```

### Sidebar

- Ancho: `w-56` (224px).
- Fondo: `bg-bg-subtle border-r border-border`.
- Items: `text-sm px-3 py-1.5 rounded-md`, activo con `bg-brand-light text-brand-primary font-medium`.
- Logo arriba, navegación en el medio, perfil/logout abajo.

### Header de página

```tsx
<div className="flex items-center justify-between mb-4">
  <h1 className="text-xl font-semibold">Clientes</h1>
  <Button size="sm">Nuevo cliente</Button>
</div>
```

### Tablas

- Usar shadcn `<Table>` con `text-sm`.
- Filas: `hover:bg-bg-muted`.
- Sin bordes entre celdas, solo `border-b border-border` entre filas.
- Columnas de acción a la derecha con `<DropdownMenu>`.

### Badges de estado

| Estado | Clase |
|---|---|
| Activo / Completado | `bg-success/10 text-success` |
| Pendiente | `bg-warning/10 text-warning` |
| Cancelado / Vencido | `bg-danger/10 text-danger` |
| Borrador | `bg-muted text-muted-foreground` |

## Layout

```
┌─────────────────────────────────────────────────────┐
│ Sidebar (w-56)  │  Main content                     │
│                 │  ┌─ Header (título + acción) ────┐ │
│ Logo            │  │                               │ │
│ ─────────────   │  └───────────────────────────────┘ │
│ Nav items       │  ┌─ Content area ────────────────┐ │
│                 │  │  px-6 py-4                    │ │
│                 │  │                               │ │
│ ─────────────   │  └───────────────────────────────┘ │
│ User / logout   │                                   │
└─────────────────────────────────────────────────────┘
```
