import { useEffect, useState } from "react";

// Disimpan di level modul supaya event tidak hilang saat pindah halaman
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

export const useInstallPrompt = () => {
  const [, force] = useState(0);

  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return "unavailable";
    deferredPrompt.prompt(); // harus dipanggil dari klik pengguna
    const { outcome } = await deferredPrompt.userChoice; // "accepted" | "dismissed"
    deferredPrompt = null;
    notify();
    return outcome;
  };

  return { canInstall: !!deferredPrompt, install };
};