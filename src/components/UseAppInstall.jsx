import { useCallback, useEffect, useState } from "react";

// Disimpan di level module supaya event `beforeinstallprompt`
// tidak hilang kalau komponen belum ter-mount saat event dipicu.
let deferredPrompt = null;
let installed = false;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });
}

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true);

const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export default function usePWAInstall() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return null;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notify();
    return outcome; // "accepted" | "dismissed"
  }, []);

  return {
    canInstall: !!deferredPrompt, // Chrome / Edge / Android
    isIOS: isIOS(), // iOS Safari: harus manual lewat menu Share
    isInstalled: installed || isStandalone(),
    install,
  };
}