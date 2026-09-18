import { useNavigate } from "react-router-dom";
import {
  Network,
  Monitor,
  ChevronRight,
  PencilRuler,
  Lightbulb,
  Target,
  Clock,
  BookOpen,
} from "lucide-react";

const practices = [
  {
    id: "topology",
    title: "Topology Practice",
    description:
      "Latih kemampuan merancang dan memahami topologi jaringan. Drag & drop perangkat, buat koneksi, dan uji pemahamanmu.",
    icon: Network,
    path: "/topology-practice",
    accent: "from-blue-500/20 to-cyan-500/10",
    iconBg: "bg-blue-500/15 text-blue-500",
    tag: "Networking",
  },
  {
    id: "pc-build",
    title: "PC Build Practice",
    description:
      "Simulasi merakit PC dari komponen. Pilih motherboard, CPU, RAM, storage, dan pastikan kompatibilitasnya.",
    icon: Monitor,
    path: "/pc-build-practice",
    accent: "from-violet-500/20 to-purple-500/10",
    iconBg: "bg-violet-500/15 text-violet-500",
    tag: "Hardware",
  },
];

const tips = [
  {
    icon: Target,
    title: "Fokus satu lab dulu",
    text: "Selesaikan satu practice sampai paham alurnya sebelum pindah ke lab lain.",
  },
  {
    icon: Clock,
    title: "Latihan singkat tapi rutin",
    text: "15–20 menit setiap hari lebih efektif daripada sesi panjang sekali seminggu.",
  },
  {
    icon: BookOpen,
    title: "Baca guide terkait",
    text: "Setelah practice, buka guide di Dashboard untuk memperdalam konsep yang baru dilatih.",
  },
];

const PracticeHub = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center gap-2 text-accent">
          <PencilRuler size={15} />
          <span className="text-xs font-medium uppercase tracking-wide">
            Practice Lab
          </span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Pilih latihan</h1>
      </div>

      {/* Practice cards */}
      <div className="mb-6 surface-card bg-white dark:bg-white/5 p-4 grid gap-4 sm:grid-cols-2 sm:gap-3">
        {practices.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-accent/40 hover:shadow-md active:scale-[0.99] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-accent/30 sm:p-4"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 transition group-hover:opacity-100`}
              />

              <div className="relative z-10 flex flex-1 flex-col">
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${item.iconBg}`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                    {item.tag}
                  </span>
                </div>

                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-md">
                  {item.title}
                </h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>

                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-accent transition group-hover:gap-2.5 group-hover:text-blue-400">
                  Mulai latihan
                  <ChevronRight size={16} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tips section — isi ruang bawah */}
      <section className="mb-6 surface-card bg-white dark:bg-white/5 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-500" />
          <h2 className="text-sm font-semibold tracking-tight text-gray-800 dark:text-gray-200">
            Tips latihan efektif
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {tips.map((tip) => {
            const TipIcon = tip.icon;
            return (
              <div
                key={tip.title}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  <TipIcon size={16} />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {tip.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {tip.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PracticeHub;