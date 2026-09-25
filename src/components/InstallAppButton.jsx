import { Download, PlusSquare, Share, X } from "lucide-react";
import { useState } from "react";
import usePWAInstall from "../hooks/usePWAInstall.js";

const InstallAppButton = () => {
  const { canInstall, isIOS, isInstalled, install } = usePWAInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  // Sudah terinstall, atau browser tidak mendukung -> sembunyikan tombol
  if (isInstalled || (!canInstall && !isIOS)) return null;

  const handleClick = () => {
    if (canInstall) install();
    else setShowIosGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Install app"
        className="border-slate-400 dark:md:border-white/20 dark:border-white/30 border rounded-control p-2.5 text-gray-500 transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10 active:scale-[0.98]"
      >
        <Download size={18} />
      </button>

      {showIosGuide && (
        <div
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#12121a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Install TEXNet</p>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-3">
                <Share size={18} className="shrink-0 text-blue-500" />
                <span>Tap the Share button in Safari's toolbar.</span>
              </li>
              <li className="flex items-center gap-3">
                <PlusSquare size={18} className="shrink-0 text-blue-500" />
                <span>Choose "Add to Home Screen".</span>
              </li>
              <li className="flex items-center gap-3">
                <Download size={18} className="shrink-0 text-blue-500" />
                <span>Tap "Add". TEXNet now opens like a regular app.</span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppButton;