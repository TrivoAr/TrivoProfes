"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration.scope);

          // Verificar actualizaciones cada 1 hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error);
        });

      // Detectar cuando hay una nueva versión disponible
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("🔄 New Service Worker activated, reloading...");
        window.location.reload();
      });
    }
  }, []);

  return null;
}
