import { CheckCircle2, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt.js";
import { useNavigate } from "react-router-dom";

const WindowsIcon = ({ size = 40 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M0 3.449 9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
  </svg>
);

const WhatsAppIcon = ({ size = 40, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const detectOS = () => {
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac/i.test(ua)) return "macos";
  if (/Linux/i.test(ua)) return "linux";
  return "other";
};

const OS_LABEL = {
  windows: "Install for Windows",
  macos: "Install for macOS",
  linux: "Install for Linux",
  android: "Install di Android",
  other: "Install Aplikasi",
};

// Ditampilkan saat tombol install otomatis tidak tersedia
const OS_HINT = {
  ios: "Buka lewat Safari, ketuk Share, lalu pilih Add to Home Screen.",
  android: "Buka menu ⋮ di Chrome, lalu pilih Install app.",
  default: "Gunakan Chrome atau Edge, lalu klik ikon Install di ujung kanan kolom alamat.",
};

const InstallAppPage = () => {
  const { canInstall, install } = useInstallPrompt();
  const [os] = useState(detectOS);
  const [isInstalled, setIsInstalled] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      navigate("/ticket", { replace: true });
    }
  }, [navigate]);

  const INSTALLED_KEY = "texnet-installed";
  const [installedBefore, setInstalledBefore] = useState(
    () => localStorage.getItem(INSTALLED_KEY) === "1"
  );

  useEffect(() => {
    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "1");
      setInstalledBefore(true);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  // Browser kembali menawarkan install = aplikasi sudah dihapus, penanda dibersihkan
  useEffect(() => {
    if (canInstall) {
      localStorage.removeItem(INSTALLED_KEY);
      setInstalledBefore(false);
    }
  }, [canInstall]);

  const handleInstall = async () => {
    if ((await install()) === "accepted") setIsInstalled(true);
  };

  const canInstallNow = os !== "ios" && canInstall;

  const SITE_URL = "https://texnet-hub.vercel.app";

  const SHARE_MESSAGE = [
    "TEXNet - Helpdesk IT:",
    `${SITE_URL}/ticket`,
    "",
    "Install aplikasi TEXNet:",
    `${SITE_URL}/install`,
  ].join("\n");

  // Share link halaman install: share sheet bawaan di HP, WhatsApp di PC
  const handleShare = async () => {
    // Di HP: share sheet bawaan. Semua isi pesan ada di `text`, jadi `url` tidak dikirim terpisah
    // supaya link tidak muncul dua kali.
    if ((os === "android" || os === "ios") && navigator.share) {
      try {
        await navigator.share({ title: "TEXNet - Helpdesk IT", text: SHARE_MESSAGE });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    // Di PC (atau jika share sheet gagal): langsung ke WhatsApp
    window.open(
      `https://wa.me/?text=${encodeURIComponent(SHARE_MESSAGE)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="flex h-screen md:max-h-screen md:overflow-hidden items-center justify-center bg-[#0a0a12] px-5 text-white">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-blue-950/50 via-transparent to-indigo-950/30" />

      <div className="relative flex w-full max-w-md md:h-screen justify-center flex-col items-center text-center">
        {isInstalled ? (
         <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-8 ring-emerald-500/5">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>

            <h2 className="text-xl font-semibold tracking-tight">TEXNet sudah terinstall</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              silahkan buka dari layar utama device kamu
            </p>
          </div>
        ) : (
          <>
            <div className="md:mt-8 w-[92vw] md:space-y-0 space-y-5 md:w-[60vw] h-screen overflow-hidden items-center justify-center md:flex-row flex-col flex md:gap-4">
            <button
              onClick={handleShare}
              className="w-full md:!w-1/2 h-[40vh] md:h-1/2 hover:bg-green-600 flex justify-center flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 transition duration-100 active:scale-[0.99]"
            >
              <WhatsAppIcon size={120} className="text-white" />
              <span className="text-xl mt-3.5 font-medium">Share your device</span>
            </button>

            <div className="group relative w-full md:!w-1/2 h-[40vh] md:h-1/2">
              <button
                onClick={handleInstall}
                disabled={!canInstallNow}
                className="relative flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 transition duration-100 hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/[0.03] disabled:active:scale-100"
              >
                {os === "windows" ? <WindowsIcon size={120} /> : <Download size={40} />}
                <span className="mt-3.5 text-xl font-medium">{OS_LABEL[os]}</span>
              </button>

              {!canInstallNow && (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-0 top-[-14%] z-10 w-max max-w-[80%] rounded-lg border border-white/10 bg-blue-600 px-3 py-2 text-center text-xs text-gray-200 shadow-xl transition-opacity duration-150"
                >
                  Sudah anda install
                </div>
              )}
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstallAppPage;