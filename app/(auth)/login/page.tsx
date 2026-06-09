"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, rellene todos los campos.");
      return;
    }

    setLoading(true);
    setError("");

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message || "Correo o contraseña incorrectos.");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-subtle px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-bg-base p-8 shadow-sm">
        <div className="flex flex-col items-center">
          {/* Logo Placeholder / HVAC Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-light text-brand-primary">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-app-primary">
            Hi-Tech HVAC
          </h2>
          <p className="mt-1 text-center text-sm text-app-muted">
            Acceso al Panel de Control Operativo
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-danger/10 p-3 text-sm text-danger border border-danger/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-address"
                className="block text-xs font-medium text-app-muted mb-1"
              >
                Correo Electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-border bg-bg-base px-3 py-2 text-sm text-app-primary placeholder-app-disabled shadow-sm focus:border-app-border-focus focus:outline-none focus:ring-1 focus:ring-app-border-focus disabled:opacity-50"
                placeholder="usuario@hitech.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-app-muted mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-border bg-bg-base px-3 py-2 text-sm text-app-primary placeholder-app-disabled shadow-sm focus:border-app-border-focus focus:outline-none focus:ring-1 focus:ring-app-border-focus disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
