import {
    ArrowLeft,
    CheckCircle2,
    Lightbulb,
    Network,
    RotateCcw
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopologyCanvas from "./TopologyCanvas";

// ===== Challenge latihan (bisa ditambah) =====
const CHALLENGES = [
  {
    id: "office-basic",
    title: "Kantor Kecil (Dasar)",
    difficulty: "Mudah",
    description:
      "Buat topology star sederhana: 1 Router, 1 Switch, 2 PC, dan 1 Access Point.",
    hint: "Semua perangkat terhubung ke Switch. Router terhubung ke Switch dengan UTP.",
    allowedHardware: ["Router", "Switch", "PC", "Access Point"],
    allowedCables: ["utp", "wireless"],
    minNodes: 5,
  },
  {
    id: "office-medium",
    title: "Kantor Menengah",
    difficulty: "Sedang",
    description:
      "1 MikroTik (Router), 1 Firewall, 2 Switch, 3 PC, 1 Server, 1 Access Point.",
    hint: "Firewall di antara Router dan Switch utama. Server dan AP terhubung ke Switch.",
    allowedHardware: ["MikroTik", "Firewall", "Switch", "PC", "Server", "Access Point"],
    allowedCables: ["utp", "fiber", "wireless"],
    minNodes: 8,
  },
  {
    id: "cctv-network",
    title: "Jaringan CCTV",
    difficulty: "Mudah",
    description:
      "1 Switch, 1 NVR/DVR, 3 CCTV, dan 1 Monitor/PC untuk monitoring.",
    hint: "Semua CCTV dan NVR terhubung ke Switch dengan UTP.",
    allowedHardware: ["Switch", "DVR/DVR", "CCTV", "PC"],
    allowedCables: ["utp"],
    minNodes: 6,
  },
  {
    id: "free",
    title: "Free Practice",
    difficulty: "Bebas",
    description: "Latihan bebas. Gunakan semua hardware dan jenis kabel.",
    hint: null,
    allowedHardware: null,
    allowedCables: null,
    minNodes: 0,
  },
];

export default function TopologyPractice() {
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState(CHALLENGES[0]);
  const [topology, setTopology] = useState({ nodes: [], edges: [] });
  const [showHint, setShowHint] = useState(false);

  const resetCanvas = () => {
    if (topology.nodes.length > 0 && !confirm("Reset canvas?")) return;
    setTopology({ nodes: [], edges: [] });
    setShowHint(false);
  };

  const loadChallenge = (challenge) => {
    if (topology.nodes.length > 0 && !confirm("Ganti challenge? Canvas akan di-reset.")) {
      return;
    }
    setSelectedChallenge(challenge);
    setTopology({ nodes: [], edges: [] });
    setShowHint(false);
  };

  const nodeCount = topology.nodes?.length || 0;
  const edgeCount = topology.edges?.length || 0;

  return (
    <div className="mx-auto max-w-full space-y-6 p-0 md:p-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="relative left-[-2px] mt-1 rounded-lg py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Latihan Topology
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetCanvas}
            className="btn-secondary inline-flex items-center gap-1.5 text-sm"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </div>

      {/* Challenge selector */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CHALLENGES.map((ch) => {
          const active = selectedChallenge.id === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => loadChallenge(ch)}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                  : "border-gray-200 surface-card hover:border-gray-500"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    ch.difficulty === "Mudah"
                      ? "bg-emerald-100 text-emerald-700"
                      : ch.difficulty === "Sedang"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ch.difficulty}
                </span>
                {active && <CheckCircle2 size={16} className="text-accent" />}
              </div>
              <p className="text-sm font-semibold">{ch.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                {ch.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Challenge info + hint */}
      <div className="surface-card rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-medium">{selectedChallenge.title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedChallenge.description}
            </p>
          </div>

          {selectedChallenge.hint && (
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
            >
              <Lightbulb size={14} />
              {showHint ? "Sembunyikan Hint" : "Tampilkan Hint"}
            </button>
          )}
        </div>

        {showHint && selectedChallenge.hint && (
          <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            💡 {selectedChallenge.hint}
          </div>
        )}

        {/* Stats */}
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Network size={13} />
            {nodeCount} perangkat
          </span>
          <span>{edgeCount} kabel</span>
          {selectedChallenge.minNodes > 0 && (
            <span>
              Target minimal: {selectedChallenge.minNodes} perangkat
              {nodeCount >= selectedChallenge.minNodes && (
                <span className="ml-1 text-emerald-600">✓</span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="surface-card rounded-xl border border-gray-200 bg-white p-4">
        <TopologyCanvas
          value={topology}
          onChange={setTopology}
          mode="editor"
          allowedHardware={selectedChallenge.allowedHardware}
          allowedCables={selectedChallenge.allowedCables}
          height={480}
          showToolbar={true}
        />
      </div>

      {/* Tips cepat */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
        <p className="font-medium text-gray-800 dark:text-gray-100">Tips cepat:</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>Klik hardware di toolbar untuk menambah perangkat</li>
          <li>Pilih jenis kabel dulu, lalu drag dari handle satu node ke node lain</li>
          <li>Klik node untuk ganti nama / tambah note</li>
          <li>Klik kabel untuk ganti jenis kabel atau hapus</li>
          <li>Gunakan tombol Export PNG di bawah canvas untuk menyimpan hasil</li>
        </ul>
      </div>
    </div>
  );
}