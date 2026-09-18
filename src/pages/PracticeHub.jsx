import { useNavigate } from "react-router-dom";
import {
  Network,
  Monitor,
  ChevronRight,
  PencilRuler,
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

const PracticeHub = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-accent">
          <PencilRuler size={16} />
          <span className="text-xs font-medium uppercase tracking-wide">
            Practice Lab
          </span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          Pilih latihan
        </h1>
      </div>

      {/* Cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {practices.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className="group relative flex flex-col active:scale-[0.99] overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-accent/40 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-accent/30"
            >
              {/* Soft gradient bg */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 transition group-hover:opacity-100`}
              />

              <div className="relative z-10 flex flex-1 flex-col">
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}
                  >
                    <Icon size={22} />
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                    {item.tag}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-accent hover:text-blue-400 transition group-hover:gap-2.5">
                  Mulai latihan
                  <ChevronRight size={16} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PracticeHub;