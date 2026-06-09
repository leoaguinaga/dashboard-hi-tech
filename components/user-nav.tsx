"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface UserNavProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
        onError: () => {
          setLoggingOut(false);
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-2 p-3 border-t border-border bg-bg-subtle">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white font-semibold text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-app-primary truncate">
            {user.name}
          </span>
          <span className="text-[10px] text-app-muted truncate">{user.email}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            user.role === "ADMIN"
              ? "bg-brand-light text-brand-primary"
              : "bg-bg-muted text-app-muted"
          }`}
        >
          {user.role}
        </span>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-xs font-medium text-danger hover:underline disabled:opacity-50 cursor-pointer"
        >
          {loggingOut ? "Saliendo..." : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );
}
