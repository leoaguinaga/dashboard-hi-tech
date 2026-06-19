import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Sidebar } from "@/components/sidebar";
import { UserNav } from "@/components/user-nav";
import { Breadcrumb } from "@/components/breadcrumb";
import { MobileSidebar } from "@/components/mobile-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base font-sans antialiased text-app-primary">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-56 md:flex-col border-r border-border shrink-0">
        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
        <UserNav
          user={{
            name: user.name,
            email: user.email,
            role: user.role || "VIEWER",
          }}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-bg-base px-6 shrink-0">
          {/* Breadcrumb - Desktop */}
          <div className="hidden md:block">
            <Breadcrumb />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <MobileSidebar
              user={{
                name: user.name,
                email: user.email,
                role: user.role || "VIEWER",
              }}
            />
            <span className="font-bold text-sm text-brand-primary">Hi-Tech</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-app-muted">
              Panel HVAC • {new Date().toLocaleDateString("es-ES")}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-6 py-4 bg-bg-base">
          {children}
        </main>
      </div>
    </div>
  );
}
