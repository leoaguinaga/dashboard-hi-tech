/**
 * lib/services.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for Hi-Tech HVAC service catalogue.
 *
 * Used in:
 *  • Dashboard  — /portfolio form serviceType dropdown
 *                 /leads form service filter
 *                 /crm service record type
 *  • Landing    — GetQuote form <select> options
 *                 Services section cards
 *                 Portfolio filter tabs (Projects.tsx)
 *
 * HOW TO ADD A SERVICE:
 *   1. Add an entry to SERVICES below.
 *   2. Re-export from landing's lib/services.ts (or import via API if SSR).
 */

export type ServiceKey =
  | "ac-services"
  | "heating-services"
  | "duct-cleaning"
  | "smart-thermostat"
  | "preventive-maintenance"
  | "emergency-support"

export interface Service {
  /** URL slug — matches /services/[id] on the landing */
  id:          ServiceKey
  /** Display label used in forms and badges */
  label:       string
  /** Short description for landing cards */
  description: string
  /** Tailwind classes for badge in portfolio/leads list */
  badgeClass:  string
}

export const SERVICES: Service[] = [
  {
    id:          "ac-services",
    label:       "AC Services",
    description: "Installation, repair, and tune-ups for all major AC brands by certified Bay Area technicians.",
    badgeClass:  "bg-sky-50 text-sky-700 border border-sky-100",
  },
  {
    id:          "heating-services",
    label:       "Heating Services",
    description: "Furnace installation, heating repair, and seasonal maintenance handled right the first time.",
    badgeClass:  "bg-orange-50 text-orange-700 border border-orange-100",
  },
  {
    id:          "duct-cleaning",
    label:       "Duct Cleaning",
    description: "Professional duct cleaning to improve air quality and maximize your system's efficiency.",
    badgeClass:  "bg-slate-100 text-slate-600 border border-slate-200",
  },
  {
    id:          "smart-thermostat",
    label:       "Smart Thermostat",
    description: "Smart thermostat installation for better home comfort, control, and energy savings.",
    badgeClass:  "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  {
    id:          "preventive-maintenance",
    label:       "Preventive Maintenance",
    description: "Scheduled tune-ups to extend equipment life and prevent unexpected costly breakdowns.",
    badgeClass:  "bg-violet-50 text-violet-700 border border-violet-100",
  },
  {
    id:          "emergency-support",
    label:       "Emergency Support",
    description: "Fast priority service for HVAC emergencies throughout the Bay Area, available 24/7.",
    badgeClass:  "bg-red-50 text-red-700 border border-red-100",
  },
  {
    id:          "other" as ServiceKey,
    label:       "Other / Not Sure",
    description: "Not sure what you need? We'll help you figure it out.",
    badgeClass:  "bg-gray-50 text-gray-600 border border-gray-200",
  },
]

/** Flat list of label strings — for <select> options */
export const SERVICE_LABELS = SERVICES.map((s) => s.label)

/** Map label → Service — for badge lookups */
export const SERVICE_BY_LABEL = Object.fromEntries(
  SERVICES.map((s) => [s.label, s])
) as Record<string, Service>

/** Map id → Service */
export const SERVICE_BY_ID = Object.fromEntries(
  SERVICES.map((s) => [s.id, s])
) as Record<string, Service>
