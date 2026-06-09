"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  History,
  Briefcase,
  TrendingUp,
  Flame,
  LayoutList,
  Inbox,
  Wrench,
} from "lucide-react";

type NavItem = { name: string; href: string; icon: React.ElementType }
type NavGroup = { label: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    label: "",
    items: [{ name: "Inicio", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Ventas",
    items: [
      { name: "Leads", href: "/leads", icon: Inbox },
    ],
  },
  {
    label: "CRM",
    items: [
      { name: "Panel CRM",    href: "/crm",             icon: LayoutList },
      { name: "Clientes",     href: "/crm/clientes",    icon: Users },
      { name: "Servicios",    href: "/services",         icon: Wrench },
      { name: "Seguimientos", href: "/crm/seguimientos", icon: History },
    ],
  },
  {
    label: "Marketing",
    items: [{ name: "Google Ads", href: "/ads", icon: TrendingUp }],
  },
  {
    label: "Contenido",
    items: [{ name: "Portafolio", href: "/portfolio", icon: Briefcase }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    const isCurrent = pathname === href || pathname.startsWith(href + "/");
    if (!isCurrent) return false;
    const hasMoreSpecific = NAV.flatMap((g) => g.items).some(
      (item) =>
        item.href !== href &&
        item.href.length > href.length &&
        (pathname === item.href || pathname.startsWith(item.href + "/"))
    );

    return !hasMoreSpecific;
  };

  return (
    <div className="flex h-full w-full flex-col bg-bg-subtle">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Flame className="h-5 w-5 text-brand-primary shrink-0" />
        <span className="text-sm font-bold tracking-tight text-app-primary">Hi-Tech HVAC</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV.map((group) => (
          <div key={group.label || "__home"}>
            {group.label && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-app-muted/60">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors ${active
                        ? "bg-brand-light text-brand-primary font-medium"
                        : "text-app-muted hover:bg-bg-muted hover:text-app-primary"
                      }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
