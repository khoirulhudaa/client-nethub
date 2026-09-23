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

// ===== Practice challenges (add more as needed) =====
const CHALLENGES = [
  {
    id: "office-basic",
    title: "Small Office (Basic)",
    difficulty: "Easy",
    description:
      "Create a simple star topology: 1 Router, 1 Switch, 2 PCs, and 1 Access Point.",
    hint: "All devices connect to the Switch. The Router connects to the Switch with UTP.",
    allowedHardware: ["Router", "Switch", "PC", "Access Point"],
    allowedCables: ["utp", "wireless"],
    minNodes: 5,
  },
  {
    id: "office-medium",
    title: "Medium Office",
    difficulty: "Medium",
    description:
      "1 MikroTik (Router), 1 Firewall, 2 Switches, 3 PCs, 1 Server, 1 Access Point.",
    hint: "Place the Firewall between the Router and the main Switch. Server and AP connect to the Switch.",
    allowedHardware: ["MikroTik", "Firewall", "Switch", "PC", "Server", "Access Point"],
    allowedCables: ["utp", "fiber", "wireless"],
    minNodes: 8,
  },
  {
    id: "cctv-network",
    title: "CCTV Network",
    difficulty: "Easy",
    description:
      "1 Switch, 1 NVR/DVR, 3 CCTV cameras, and 1 Monitor/PC for monitoring.",
    hint: "All CCTV cameras and the NVR connect to the Switch with UTP.",
    allowedHardware: ["Switch", "DVR/DVR", "CCTV", "PC"],
    allowedCables: ["utp"],
    minNodes: 6,
  },
  {
    id: "free",
    title: "Free Practice",
    difficulty: "Free",
    description: "Open practice. Use any hardware and cable types.",
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
    if (
      topology.nodes.length > 0 &&
      !confirm("Switch challenge? The canvas will be reset.")
    ) {
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
              Topology Practice
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
                    ch.difficulty === "Easy"
                      ? "bg-emerald-100 text-emerald-700"
                      : ch.difficulty === "Medium"
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
              {showHint ? "Hide Hint" : "Show Hint"}
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
            {nodeCount} devices
          </span>
          <span>{edgeCount} cables</span>
          {selectedChallenge.minNodes > 0 && (
            <span>
              Minimum target: {selectedChallenge.minNodes} devices
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

      {/* Quick tips */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
        <p className="font-medium text-gray-800 dark:text-gray-100">Quick tips:</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>Click hardware in the toolbar to add a device</li>
          <li>Select a cable type first, then drag from one node handle to another</li>
          <li>Click a node to rename it or add a note</li>
          <li>Click a cable to change its type or delete it</li>
          <li>Use the Export PNG button below the canvas to save your work</li>
        </ul>
      </div>
    </div>
  );
}