import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const STEPS = [
  {
    id: "categories",
    title: "Categories",
    desc: "Filter guide berdasarkan topik: Topology, Installation, Maintenance, dan Hardware.",
    selector: "[data-tour='categories']",
    group: "categories",
  },
  {
    id: "discover",
    title: "Discover",
    desc: "Lihat guide yang sedang trending dan buka tools seperti Subnet Calculator.",
    selector: "[data-tour='discover']",
    group: "discover",
  },
  {
    id: "practice",
    title: "Practice",
    desc: "Latihan kuis, buat exam, atau tes pengetahuan networking kamu.",
    selector: "[data-tour='practice']",
    group: "quiz",
  },
  {
    id: "library",
    title: "Library",
    desc: "Akses My Guides, Reading List, dan Collection Card dari sini.",
    selector: "[data-tour='library']",
    group: "library",
  },
  {
    id: "search",
    title: "Search",
    desc: "Cari guide, tag, atau kategori langsung dari bar pencarian.",
    selector: "[data-tour='search']",
    group: null,
  },
  {
    id: "notif",
    title: "Pengumuman",
    desc: "Notifikasi pengumuman terbaru dari admin muncul di sini.",
    selector: "[data-tour='notif']",
    group: null,
  },
  {
    id: "profile",
    title: "Profile",
    desc: "Buka profil, reading list, atau logout dari menu ini.",
    selector: "[data-tour='profile']",
    group: null,
  },
];

const STORAGE_KEY = "nethub_intro_seen";

const IntroTour = () => {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY) === "true";
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const current = STEPS[step];

  // Buka group + expand sidebar saat step berubah
  useEffect(() => {
    if (!open || !current) return;

    // Minta sidebar expand + buka group yang relevan
    window.dispatchEvent(
      new CustomEvent("nethub-intro-step", {
        detail: {
          group: current.group,
          expandSidebar: true,
        },
      })
    );
  }, [open, step, current]);

  // Hitung posisi highlight (tunggu sedikit biar group sempat terbuka)
  useEffect(() => {
    if (!open || !current) return;

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const el = document.querySelector(current.selector);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    };

    // delay kecil supaya animasi open group selesai
    const t1 = setTimeout(measure, 280);
    const t2 = setTimeout(measure, 450);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step, current]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const next = () => {
    if (step >= STEPS.length - 1) finish();
    else setStep((s) => s + 1);
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (!open) return null;

  const pad = 10;
  const highlight = rect
    ? {
        top: Math.max(8, rect.top - pad),
        left: Math.max(8, rect.left - pad),
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  // posisi tooltip: di bawah target, atau di tengah kalau belum ketemu
  const tooltipStyle = highlight
    ? {
        top: Math.min(
          highlight.top + highlight.height + 14,
          window.innerHeight - 200
        ),
        left: Math.min(
          Math.max(highlight.left, 16),
          window.innerWidth - 340
        ),
      }
    : {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };

  return (
    <div className="fixed inset-0 z-[999999] pointer-events-none">
      {/* Overlay gelap — di bawah highlight & tooltip */}
      <div className="absolute inset-0 bg-black/55 pointer-events-auto" />

      {/* Spotlight cutout */}
      {highlight && (
        <div
          className="absolute rounded-2xl bg-transparent pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            outline: "2px solid rgba(255,255,255,0.85)",
            outlineOffset: "0px",
          }}
        />
      )}

      {/* Tooltip — SELALU di atas overlay */}
      <div
        className="absolute z-10 w-[min(calc(100vw-2rem),320px)] rounded-2xl border border-white/15 bg-white p-4 shadow-2xl pointer-events-auto dark:bg-[#12121a]"
        style={tooltipStyle}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              {step + 1} / {STEPS.length}
            </p>
            <h3 className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
              {current.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={finish}
            className="rounded-lg p-1 text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {current.desc}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
            Back
          </button>

          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-white"
          >
            {step === STEPS.length - 1 ? "Selesai" : "Next"}
            {step !== STEPS.length - 1 && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroTour;