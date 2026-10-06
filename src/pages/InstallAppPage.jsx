import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  MonitorSmartphone,
} from "lucide-react";

const InstallAppPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState("unknown"); // android | ios | desktop

  useEffect(() => {
    // Deteksi platform
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
      setPlatform("android");
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform("ios");
    } else {
      setPlatform("desktop");
    }

    // Cek apakah sudah diinstall sebagai PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Tangkap event install (Android/Chrome)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center md:h-screen overflow-x-hidden md:overflow-hidden bg-[#0a0a12] text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/50 via-transparent to-indigo-950/30 pointer-events-none" />

      <div className="relative mx-auto w-[98vw] md:max-w-6xl px-5 py-10 sm:py-14">
          {/* Header */}
        <div className="mb-8 gap-x-2 flex items-center text-left">
          <div className="flex w-14 md:h-16 h-14 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
            <img
              src="/icons/icon-192x192.png"
              alt="TEXNet"
              className="h-[88%] w-[88%]"
              draggable={false}
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Install TEXNet
          </h1>
          {/* <p className="mt-2 text-sm text-gray-400">
            Pasang sebagai aplikasi di HP supaya lebih cepat & praktis
          </p> */}
        </div>

        {/* Sudah terinstall */}
        {isInstalled ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-400" />
            <h2 className="text-lg font-semibold text-emerald-300">
              TEXNet sudah terinstall!
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Kamu bisa membukanya langsung dari layar utama HP.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Buka TEXNet
            </Link>
          </div>
        ) : (
          <>
            {/* Tombol Install (Android) */}
            {platform === "android" && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="mb-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-[0.98]"
              >
                <Download size={20} />
                Install Sekarang
              </button>
            )}

            {/* Instruksi berdasarkan platform */}
            <div className="grid md:grid-cols-2 md:space-y-0 space-y-4 gap-x-3">
              {/* Android */}
              {(platform === "android" || platform === "desktop") && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Android (Chrome)</h3>
                      <p className="text-xs text-gray-500">Cara paling mudah</p>
                    </div>
                  </div>
                  <ol className="space-y-3 text-sm text-gray-300">
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                        1
                      </span>
                      <span>Buka TEXNet menggunakan <strong>Chrome</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                        2
                      </span>
                      <span>
                        Ketuk menu <strong>⋮</strong> (titik tiga) di pojok kanan atas
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                        3
                      </span>
                      <span>
                        Pilih <strong>"Install app"</strong> atau{" "}
                        <strong>"Tambahkan ke layar utama"</strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                        4
                      </span>
                      <span>Konfirmasi → TEXNet akan muncul di layar utama</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* iOS */}
              {(platform === "ios" || platform === "desktop") && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">iPhone / iPad (Safari)</h3>
                      <p className="text-xs text-gray-500">Wajib pakai Safari</p>
                    </div>
                  </div>
                  <ol className="space-y-3 text-sm text-gray-300">
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                        1
                      </span>
                      <span>
                        Buka TEXNet menggunakan <strong>Safari</strong> (bukan Chrome)
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                        2
                      </span>
                      <span className="flex items-center gap-1.5">
                        Ketuk tombol <Share size={14} className="inline" /> <strong>Share</strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                        3
                      </span>
                      <span className="flex items-center gap-1.5">
                        Gulir ke bawah dan pilih{" "}
                        <PlusSquare size={14} className="inline" />{" "}
                        <strong>Add to Home Screen</strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                        4
                      </span>
                      <span>Ketuk <strong>Add</strong> di pojok kanan atas</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Keuntungan */}
            <div className="mt-4 md:mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <MonitorSmartphone size={16} />
                Keuntungan Install sebagai Aplikasi
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-blue-400" />
                  <span>Buka lebih cepat (tanpa ketik alamat website)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-blue-400" />
                  <span>Tampilan fullscreen seperti aplikasi asli</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-blue-400" />
                  <span>Bisa ditambahkan ke layar utama HP</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstallAppPage;