import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  HardDrive,
  MemoryStick,
  CircuitBoard,
  Fan,
  Power,
  Box,
  Monitor,
  Trash2,
  RotateCcw,
  Info,
  Gamepad2,
  Briefcase,
  Video,
  Server,
  Wallet,
  Cable,
  Zap,
  Play,
} from "lucide-react";

/* ====================== DATA ====================== */
// const PC_COMPONENTS = {
//   cpu: [
//     { id: "cpu-1", name: "Intel Core i3-12100", socket: "LGA1700", tdp: 60, brand: "Intel" },
//     { id: "cpu-2", name: "Intel Core i5-12400F", socket: "LGA1700", tdp: 65, brand: "Intel" },
//     { id: "cpu-3", name: "Intel Core i7-14700K", socket: "LGA1700", tdp: 125, brand: "Intel" },
//     { id: "cpu-4", name: "AMD Ryzen 5 5600", socket: "AM4", tdp: 65, brand: "AMD" },
//     { id: "cpu-5", name: "AMD Ryzen 7 5800X3D", socket: "AM4", tdp: 105, brand: "AMD" },
//     { id: "cpu-6", name: "AMD Ryzen 5 7600", socket: "AM5", tdp: 65, brand: "AMD" },
//   ],
//   motherboard: [
//     { id: "mb-1", name: "ASUS Prime H610M-K", socket: "LGA1700", form: "mATX", ramType: "DDR4" },
//     { id: "mb-2", name: "MSI B760M-A WiFi", socket: "LGA1700", form: "mATX", ramType: "DDR5" },
//     { id: "mb-3", name: "Gigabyte B550M DS3H", socket: "AM4", form: "mATX", ramType: "DDR4" },
//     { id: "mb-4", name: "ASUS TUF B650-PLUS", socket: "AM5", form: "ATX", ramType: "DDR5" },
//   ],
//   ram: [
//     { id: "ram-1", name: "16GB DDR4-3200 (2x8)", type: "DDR4", capacity: 16 },
//     { id: "ram-2", name: "32GB DDR4-3600 (2x16)", type: "DDR4", capacity: 32 },
//     { id: "ram-3", name: "16GB DDR5-5600 (2x8)", type: "DDR5", capacity: 16 },
//     { id: "ram-4", name: "32GB DDR5-6000 (2x16)", type: "DDR5", capacity: 32 },
//   ],
//   gpu: [
//     { id: "gpu-1", name: "Integrated Graphics", tdp: 0, length: 0, needsPower: false },
//     { id: "gpu-2", name: "GTX 1650 4GB", tdp: 75, length: 170, needsPower: false },
//     { id: "gpu-3", name: "RTX 4060 8GB", tdp: 115, length: 240, needsPower: true },
//     { id: "gpu-4", name: "RTX 4070 Super", tdp: 220, length: 280, needsPower: true },
//   ],
//   storage: [
//     { id: "ssd-1", name: "500GB NVMe", type: "NVMe", interface: "M.2" },
//     { id: "ssd-2", name: "1TB NVMe Gen4", type: "NVMe", interface: "M.2" },
//     { id: "ssd-3", name: "1TB SATA SSD", type: "SATA", interface: "SATA" },
//     { id: "hdd-1", name: "2TB HDD", type: "HDD", interface: "SATA" },
//   ],
//   psu: [
//     { id: "psu-1", name: "550W 80+ Bronze", watt: 550 },
//     { id: "psu-2", name: "650W 80+ Gold", watt: 650 },
//     { id: "psu-3", name: "750W 80+ Gold Modular", watt: 750 },
//     { id: "psu-4", name: "850W 80+ Gold Modular", watt: 850 },
//   ],
//   cooler: [
//     { id: "cooler-1", name: "Stock Cooler", tdpSupport: 65 },
//     { id: "cooler-2", name: "Tower Air Cooler", tdpSupport: 150 },
//     { id: "cooler-3", name: "AIO 240mm", tdpSupport: 250 },
//   ],
//   case: [
//     { id: "case-1", name: "mATX Budget Case", form: ["mATX", "ITX"], maxGpu: 300 },
//     { id: "case-2", name: "Mid Tower ATX", form: ["ATX", "mATX"], maxGpu: 360 },
//     { id: "case-3", name: "High Airflow Case", form: ["ATX", "mATX"], maxGpu: 400 },
//   ],
// };

const PC_COMPONENTS = {
  cpu: [
    {
      id: "cpu-1",
      name: "Intel Core i3-12100",
      socket: "LGA1700",
      tdp: 60,
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=300&fit=crop",
    },
    {
      id: "cpu-2",
      name: "Intel Core i5-12400F",
      socket: "LGA1700",
      tdp: 65,
      image: "https://images.unsplash.com/photo-1555617981-624c78c473a4?w=300&h=300&fit=crop",
    },
    {
      id: "cpu-3",
      name: "AMD Ryzen 5 5600",
      socket: "AM4",
      tdp: 65,
      image: "https://images.unsplash.com/photo-1625948515299-5757407c8588?w=300&h=300&fit=crop",
    },
    {
      id: "cpu-4",
      name: "AMD Ryzen 7 5800X3D",
      socket: "AM4",
      tdp: 105,
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop",
    },
  ],
  motherboard: [
    {
      id: "mb-1",
      name: "ASUS Prime H610M-K",
      socket: "LGA1700",
      form: "mATX",
      ramType: "DDR4",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop",
    },
    {
      id: "mb-2",
      name: "MSI B760M-A WiFi",
      socket: "LGA1700",
      form: "mATX",
      ramType: "DDR5",
      image: "https://images.unsplash.com/photo-1555680202-c86f0e48dabb?w=300&h=300&fit=crop",
    },
    {
      id: "mb-3",
      name: "Gigabyte B550M DS3H",
      socket: "AM4",
      form: "mATX",
      ramType: "DDR4",
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop",
    },
  ],
  ram: [
    {
      id: "ram-1",
      name: "16GB DDR4-3200 (2x8)",
      type: "DDR4",
      capacity: 16,
      image: "https://images.unsplash.com/photo-1562976540-08d666df4126?w=300&h=300&fit=crop",
    },
    {
      id: "ram-2",
      name: "32GB DDR5-6000 (2x16)",
      type: "DDR5",
      capacity: 32,
      image: "https://images.unsplash.com/photo-1600333438772-2c2c8c8c8c8c?w=300&h=300&fit=crop",
    },
  ],
  gpu: [
    {
      id: "gpu-1",
      name: "GTX 1650 4GB",
      tdp: 75,
      length: 170,
      needsPower: false,
      image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=300&h=300&fit=crop",
    },
    {
      id: "gpu-2",
      name: "RTX 4060 8GB",
      tdp: 115,
      length: 240,
      needsPower: true,
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop",
    },
    {
      id: "gpu-3",
      name: "RTX 4070 Super",
      tdp: 220,
      length: 280,
      needsPower: true,
      image: "https://images.unsplash.com/photo-1625948515299-5757407c8588?w=300&h=300&fit=crop",
    },
  ],
  storage: [
    {
      id: "ssd-1",
      name: "1TB NVMe Gen4",
      type: "NVMe",
      interface: "M.2",
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop",
    },
    {
      id: "ssd-2",
      name: "1TB SATA SSD",
      type: "SATA",
      interface: "SATA",
      image: "https://images.unsplash.com/photo-1555680202-c86f0e48dabb?w=300&h=300&fit=crop",
    },
  ],
  psu: [
    {
      id: "psu-1",
      name: "650W 80+ Gold",
      watt: 650,
      image: "https://images.unsplash.com/photo-1600333438772-2c2c8c8c8c8c?w=300&h=300&fit=crop",
    },
    {
      id: "psu-2",
      name: "750W Modular",
      watt: 750,
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop",
    },
  ],
  cooler: [
    {
      id: "cooler-1",
      name: "Tower Air Cooler",
      tdpSupport: 150,
      image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=300&h=300&fit=crop",
    },
    {
      id: "cooler-2",
      name: "AIO 240mm",
      tdpSupport: 250,
      image: "https://images.unsplash.com/photo-1625948515299-5757407c8588?w=300&h=300&fit=crop",
    },
  ],
  case: [
    {
      id: "case-1",
      name: "Mid Tower ATX",
      form: ["ATX", "mATX"],
      maxGpu: 360,
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop",
    },
    {
      id: "case-2",
      name: "High Airflow Case",
      form: ["ATX", "mATX"],
      maxGpu: 400,
      image: "https://images.unsplash.com/photo-1555680202-c86f0e48dabb?w=300&h=300&fit=crop",
    },
  ],
};

const PURPOSES = [
  { id: "office", label: "Kantor / Browsing", icon: Briefcase },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "editing", label: "Video Editing", icon: Video },
  { id: "server", label: "Home Server", icon: Server },
  { id: "budget", label: "Budget", icon: Wallet },
];

const CABLE_STEPS = [
  { id: "24pin",     label: "24-pin ATX (Motherboard)",     color: "#eab308", thick: true },
  { id: "cpu8pin",   label: "8-pin EPS (CPU Power)",        color: "#eab308", thick: true },
  { id: "pcie1",     label: "PCIe 8-pin (GPU)",             color: "#ef4444", thick: true, optional: true },
  { id: "pcie2",     label: "PCIe 6-pin / 12VHPWR (GPU)",   color: "#ef4444", thick: true, optional: true },
  { id: "sata_power",label: "SATA Power (ke SSD/HDD)",      color: "#3b82f6" },
  { id: "sata_data", label: "SATA Data (Motherboard → Storage)", color: "#06b6d4" },
  { id: "front_panel", label: "Front Panel (Power/Reset/LED)", color: "#a3a3a3" },
  { id: "cpu_fan",   label: "CPU Fan Header",               color: "#22c55e" },
  { id: "case_fan",  label: "Case Fan / SYS_FAN",           color: "#22c55e" },
  { id: "usb_header",label: "USB 2.0 / 3.0 Header",         color: "#8b5cf6" },
];

/* ====================== VALIDASI ====================== */
function validateBuild(build) {
  const errors = [];
  const warnings = [];
  const cpu = build.cpu?.[0];
  const mb = build.motherboard?.[0];
  const rams = build.ram || [];
  const gpu = build.gpu?.[0];
  const psu = build.psu?.[0];
  const cooler = build.cooler?.[0];
  const pcCase = build.case?.[0];
  const storages = build.storage || [];

  if (cpu && mb && cpu.socket !== mb.socket) {
    errors.push(`CPU ${cpu.socket} tidak cocok dengan Motherboard ${mb.socket}`);
  }
  rams.forEach((ram) => {
    if (mb && ram.type !== mb.ramType) {
      errors.push(`RAM ${ram.type} tidak cocok (Motherboard: ${mb.ramType})`);
    }
  });
  if (rams.length === 0 && mb) errors.push("Wajib pasang minimal 1 RAM");
  if (cpu && cooler && cooler.tdpSupport < cpu.tdp) {
    errors.push(`Cooler hanya support ${cooler.tdpSupport}W, CPU butuh ${cpu.tdp}W`);
  }
  if (mb && pcCase && !pcCase.form.includes(mb.form)) {
    errors.push(`Motherboard ${mb.form} tidak muat di case ini`);
  }
  if (gpu && pcCase && gpu.length > pcCase.maxGpu) {
    errors.push(`GPU terlalu panjang (${gpu.length}mm)`);
  }
  if (cpu && psu) {
    const need = cpu.tdp + (gpu?.tdp || 0) + 100;
    if (psu.watt < need) errors.push(`PSU ${psu.watt}W kurang (butuh ≈${need}W)`);
  }
  if (storages.length === 0) errors.push("Wajib pasang Storage");

  return { errors, warnings };
}

/* ====================== MAIN COMPONENT ====================== */
export default function PCBuildCanvas() {
  const [purpose, setPurpose] = useState(null);
  const [build, setBuild] = useState({
    case: [], motherboard: [], cpu: [], cooler: [],
    ram: [], gpu: [], storage: [], psu: [],
  });
  const [selectedCategory, setSelectedCategory] = useState("cpu");
  const [dragItem, setDragItem] = useState(null);

  // Cabling states
  const [cablesInstalled, setCablesInstalled] = useState([]);
  const [showCables, setShowCables] = useState(false);
  const [cablingMode, setCablingMode] = useState(false); // Mode Cabling Challenge
  const [currentCableStep, setCurrentCableStep] = useState(0);
  const [cableAnim, setCableAnim] = useState({}); // untuk animasi

  const { errors } = purpose ? validateBuild(build) : { errors: [] };

  const progress = ["case", "motherboard", "cpu", "cooler", "ram", "storage", "psu"]
    .filter((k) => build[k]?.length > 0).length;

  const canInstallCables =
    build.case?.length &&
    build.motherboard?.length &&
    build.cpu?.length &&
    build.psu?.length &&
    build.ram?.length &&
    build.storage?.length &&
    errors.length === 0;

  // ========== HANDLERS ==========
  const handleDragStart = (e, component, category) => {
    setDragItem({ component, category });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, slotId) => {
    e.preventDefault();
    if (!dragItem || dragItem.category !== slotId) return;

    setBuild((prev) => {
      const isMultiple = slotId === "ram" || slotId === "storage";
      return {
        ...prev,
        [slotId]: isMultiple ? [...prev[slotId], dragItem.component] : [dragItem.component],
      };
    });
    setDragItem(null);
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeFromSlot = (slotId, index = 0) => {
    setBuild((prev) => ({
      ...prev,
      [slotId]: prev[slotId].filter((_, i) => i !== index),
    }));
    // Reset cables jika komponen dicabut
    setShowCables(false);
    setCablesInstalled([]);
    setCablingMode(false);
    setCurrentCableStep(0);
  };

  const resetBuild = () => {
    setBuild({
      case: [], motherboard: [], cpu: [], cooler: [],
      ram: [], gpu: [], storage: [], psu: [],
    });
    setShowCables(false);
    setCablesInstalled([]);
    setCablingMode(false);
    setCurrentCableStep(0);
    setCableAnim({});
  };

  // Tombol Pasang Kabel
  const handleInstallCables = () => {
    if (!canInstallCables) return;
    setShowCables(true);

    // Animasi muncul bertahap
    const steps = ["24pin", "cpu8pin", "sata", "front"];
    if (build.gpu?.[0]?.needsPower) steps.splice(2, 0, "pcie");

    steps.forEach((id, idx) => {
      setTimeout(() => {
        setCableAnim((prev) => ({ ...prev, [id]: true }));
        setCablesInstalled((prev) => [...prev, id]);
      }, idx * 600);
    });
  };

  // Mode Cabling Challenge
  const startCablingChallenge = () => {
    if (!canInstallCables) return;
    setCablingMode(true);
    setCurrentCableStep(0);
    setCablesInstalled([]);
    setCableAnim({});
    setShowCables(true);
  };

  const installNextCable = () => {
    const requiredCables = CABLE_STEPS.filter((c) => {
      if (c.id === "pcie") return build.gpu?.[0]?.needsPower;
      return true;
    });

    if (currentCableStep >= requiredCables.length) return;

    const cable = requiredCables[currentCableStep];
    setCableAnim((prev) => ({ ...prev, [cable.id]: true }));
    setCablesInstalled((prev) => [...prev, cable.id]);
    setCurrentCableStep((prev) => prev + 1);
  };

  // ====================== HALAMAN UTAMA ======================
  return (
    <div className="surface-card min-h-screen bg-white px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-medium">
              Build CPU
            </h1>
            <p className="text-sm text-gray-500">Drag komponen → Pasang kabel → Selesai</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPurpose(null)} className="rounded-lg border px-3 py-1.5 text-sm">
              Ganti Tujuan
            </button>
            <button onClick={resetBuild} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5 rounded-xl border bg-white p-3 dark:border-white/10 surface-card">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress Komponen</span>
            <span>{progress}/7</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-white/15">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${(progress / 7) * 100}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT - Komponen */}
          <div className="lg:col-span-3 space-y-3">
            <div className="rounded-xl border bg-white p-3 dark:border-white/10 surface-card">
              <p className="text-xs font-semibold text-gray-400 mb-2">KATEGORI</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(PC_COMPONENTS).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${
                      selectedCategory === cat ? "bg-accent text-white" : "bg-gray-100 dark:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-3 dark:border-white/10 surface-card">
              <p className="text-xs font-semibold text-gray-400 mb-3">Drag ke slot</p>
              <div className="space-y-2 max-h-[480px] overflow-y-auto">
                {PC_COMPONENTS[selectedCategory].map((comp) => (
                    <div
                        key={comp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, comp, selectedCategory)}
                        className="cursor-grab rounded-lg border bg-gray-50 p-2 text-sm active:cursor-grabbing dark:bg-white/5 dark:border-white/10 flex items-center gap-3"
                    >
                        <img
                        src={comp.image}
                        alt={comp.name}
                        className="h-12 w-12 rounded object-cover bg-gray-200"
                        onError={(e) => {
                            e.target.src = "https://placehold.co/100x100?text=No+Image";
                        }}
                        />
                        <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{comp.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">
                            {selectedCategory === "cpu" && `${comp.socket} • ${comp.tdp}W`}
                            {selectedCategory === "motherboard" && `${comp.socket} • ${comp.ramType}`}
                            {selectedCategory === "ram" && `${comp.type} • ${comp.capacity}GB`}
                            {selectedCategory === "gpu" && `${comp.tdp}W`}
                            {selectedCategory === "storage" && comp.interface}
                            {selectedCategory === "psu" && `${comp.watt}W`}
                            {selectedCategory === "cooler" && `${comp.tdpSupport}W`}
                            {selectedCategory === "case" && `Max GPU ${comp.maxGpu}mm`}
                        </p>
                        </div>
                    </div>
                    ))}
              </div>
            </div>
          </div>

          {/* CENTER - Visual + Cables */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border bg-white p-4 dark:border-white/10 surface-card">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Box size={16} /> Casing — Tampak Atas
              </h2>

              {/* Visual Case */}
              <div className="relative mx-auto w-full max-w-[400px]">
                <div className="relative rounded-lg border-[6px] border-gray-700 bg-gray-800" style={{ aspectRatio: "1/1.3" }}>
                  <div className="absolute inset-1.5 rounded bg-gray-900 overflow-hidden">

                    {/* Motherboard */}
                    {/* ==================== MOTHERBOARD (mirip diagram referensi) ==================== */}
                    <div className="absolute left-2 right-2 top-2 bottom-[20%] rounded border-2 border-gray-600 bg-[#1a1a2e] overflow-hidden">
                    
                    {/* Grid halus biar mirip PCB */}
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `linear-gradient(#333 1px, transparent 1px),
                                            linear-gradient(90deg, #333 1px, transparent 1px)`,
                            backgroundSize: "12px 12px"
                        }}
                    />

                    {/* ========== REAR I/O (kiri atas) ========== */}
                    <div className="absolute left-0 top-0 bottom-0 w-5 bg-gray-800 border-r border-gray-600">
                        {/* Port-port belakang */}
                        <div className="absolute top-2 left-0.5 right-0.5 h-2 bg-gray-600 rounded-sm" />
                        <div className="absolute top-5 left-0.5 right-0.5 h-2 bg-blue-800 rounded-sm" />
                        <div className="absolute top-8 left-0.5 right-0.5 h-2 bg-blue-800 rounded-sm" />
                        <div className="absolute top-11 left-0.5 right-0.5 h-3 bg-gray-700 rounded-sm" />
                        <div className="absolute top-16 left-0.5 right-0.5 h-2 bg-green-800 rounded-sm" />
                        <div className="absolute bottom-4 left-0.5 right-0.5 h-2 bg-gray-600 rounded-sm" />
                    </div>

                    {/* ========== CPU SOCKET (kanan atas) ========== */}
                    <div
                        onDrop={(e) => handleDrop(e, "cpu")}
                        onDragOver={handleDragOver}
                        className={`absolute left-8 top-8 w-20 h-20 rounded border-2 border-dashed flex flex-col items-center justify-center z-20 ${
                        build.cpu?.length
                            ? "border-green-400 bg-green-500/30"
                            : "border-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20"
                        }`}
                    >
                        {build.cpu?.[0] ? (
                        <img src={build.cpu[0].image} alt="CPU" className="w-full h-full object-cover rounded" />
                        ) : (
                        <>
                            <Cpu size={24} className="text-yellow-300" />
                            <span className="text-[9px] text-yellow-200 mt-1 font-medium">CPU Socket</span>
                        </>
                        )}
                    </div>

                    {/* CPU Power Connector (dekat CPU) */}
                    <div className="absolute right-2 top-20 w-4 h-8 bg-yellow-700 border border-yellow-500 rounded-sm flex items-center justify-center">
                        <span className="text-[6px] text-yellow-100 font-bold" style={{ writingMode: "vertical-rl" }}>
                        8-pin
                        </span>
                    </div>

                    {/* CPU Fan header */}
                    <div className="absolute right-20 top-3 w-7 h-3 bg-gray-700 border border-gray-500 rounded-sm flex items-center justify-center">
                        <span className="text-[5px] text-gray-300">CPU_FAN</span>
                    </div>

                    {/* ========== 2 RAM SLOTS (di bawah CPU) ========== */}
                    <div
                        onDrop={(e) => handleDrop(e, "ram")}
                        onDragOver={handleDragOver}
                        className="absolute right-20 top-16 flex flex-col gap-1 z-10"
                    >
                        {[0, 1].map((i) => (
                        <div
                            key={i}
                            className={`w-28 h-5 rounded-sm border-2 border-dashed flex items-center justify-center ${
                            build.ram?.length > i
                                ? "border-green-400 bg-green-500/40"
                                : "border-blue-400/80 bg-blue-500/10"
                            }`}
                        >
                            {build.ram?.[i] ? (
                            <span className="text-[8px] text-green-300 font-medium truncate px-1">
                                {build.ram[i].name}
                            </span>
                            ) : (
                            <span className="text-[8px] text-blue-300">RAM Slot {i + 1}</span>
                            )}
                        </div>
                        ))}
                    </div>

                    {/* ========== AGP / PCIe x16 (tengah) ========== */}
                    <div
                        onDrop={(e) => handleDrop(e, "gpu")}
                        onDragOver={handleDragOver}
                        className={`absolute left-8 right-20 top-36 h-7 rounded border-2 border-dashed flex items-center justify-center z-10 ${
                        build.gpu?.length
                            ? "border-green-400 bg-green-500/30"
                            : "border-purple-400 bg-purple-500/10"
                        }`}
                    >
                        {build.gpu?.[0] ? (
                        <img src={build.gpu[0].image} alt="GPU" className="h-full object-contain" />
                        ) : (
                        <span className="text-[9px] text-purple-300 font-medium">PCIe x16 / AGP Slot</span>
                        )}
                    </div>

                    {/* ========== PCI SLOTS (kiri bawah) ========== */}
                    <div className="absolute left-8 top-48 space-y-1">
                        <div className="w-40 h-3.5 rounded-sm border border-gray-500 bg-gray-800/80 flex items-center px-1">
                        <span className="text-[7px] text-gray-400">PCI Slot 1</span>
                        </div>
                        <div className="w-40 h-3.5 rounded-sm border border-gray-500 bg-gray-800/70 flex items-center px-1">
                        <span className="text-[7px] text-gray-400">PCI Slot 2</span>
                        </div>
                        <div className="w-40 h-3.5 rounded-sm border border-gray-500 bg-gray-800/60 flex items-center px-1">
                        <span className="text-[7px] text-gray-400">PCI Slot 3</span>
                        </div>
                    </div>

                    {/* ========== 24-pin ATX Power (kanan tengah) ========== */}
                    <div className="absolute right-2 top-60 w-4 h-16 bg-yellow-700 border border-yellow-500 rounded-sm flex items-center justify-center">
                        <span className="text-[7px] text-yellow-100 font-bold" style={{ writingMode: "vertical-rl" }}>
                        24-pin ATX
                        </span>
                    </div>

                    {/* ========== BAGIAN KANAN MOTHERBOARD (sesuai gambar) ========== */}

                    {/* CPUFAN1 */}
                    <div className="absolute right-28 top-3 w-8 h-3 bg-gray-700 border border-gray-500 rounded-sm flex items-center justify-center">
                    <span className="text-[5px] text-gray-300">CPUFAN1</span>
                    </div>

                    {/* DDR1 & DDR2 (2 slot RAM vertikal) */}
                    <div
                    onDrop={(e) => handleDrop(e, "ram")}
                    onDragOver={handleDragOver}
                    className="absolute right-10 top-24 flex flex-col gap-2 z-10"
                    >
                    <div className={`w-6 h-24 rounded-sm border-2 border-dashed flex items-center justify-center ${
                        build.ram?.length > 0 ? "border-green-400 bg-green-500/40" : "border-blue-400/80 bg-blue-500/10"
                    }`}>
                        <span className="text-[7px] text-blue-200 -rotate-90 whitespace-nowrap">
                        {build.ram?.[0] ? "DDR1 ✓" : "DDR1"}
                        </span>
                    </div>
                    <div className={`w-6 h-24 rounded-sm border-2 border-dashed flex items-center justify-center ${
                        build.ram?.length > 1 ? "border-green-400 bg-green-500/40" : "border-blue-400/80 bg-blue-500/10"
                    }`}>
                        <span className="text-[7px] text-blue-200 -rotate-90 whitespace-nowrap">
                        {build.ram?.[1] ? "DDR2 ✓" : "DDR2"}
                        </span>
                    </div>
                    </div>

                    {/* IDE + FDD + ATX Power (paling kanan) */}
                    <div className="absolute right-1 top-6 flex flex-col gap-1 items-end">
                    {/* FDD1 */}
                    {/* <div className="w-10 h-4 bg-gray-700 border border-gray-500 rounded-sm flex items-center justify-center">
                        <span className="text-[6px] text-gray-300">FDD1</span>
                    </div> */}
                    
                    {/* IDE 2 */}
                    <div className="w-12 h-5 bg-gray-700 border border-gray-500 rounded-sm flex relative right-1 top-[-12px] items-center justify-center">
                        <span className="text-[6px] text-gray-300">IDE 2</span>
                    </div>
                    
                    {/* IDE 1 */}
                    <div className="w-12 h-5 bg-gray-700 border border-gray-500 rounded-sm flex relative right-1 top-[-12px] items-center justify-center">
                        <span className="text-[6px] text-gray-300">IDE 1</span>
                    </div>

                    {/* ATX Power Supply (24-pin) */}
                    <div className="w-4 h-20 bg-yellow-700 border-2 border-yellow-500 rounded-sm flex items-center justify-center relative left-[-4px] mt-14">
                        <span className="text-[7px] text-yellow-100 font-bold" style={{ writingMode: "vertical-rl" }}>
                        ATX Power
                        </span>
                    </div>
                    </div>

                    {/* SiS 962 Chipset */}
                    <div className="absolute right-20 top-48 w-10 h-8 bg-gray-700 border border-gray-500 rounded flex items-center justify-center">
                      <span className="text-[7px] text-gray-300 text-center leading-tight">SiS<br/>962</span>
                    </div>

                    {/* JBAT (Clear CMOS) */}
                    <div className="absolute right-16 bottom-14 w-6 h-3 bg-gray-700 border border-gray-500 rounded-sm flex items-center justify-center">
                    <span className="text-[5px] text-gray-300">JBAT</span>
                    </div>

                    {/* JPOW1 */}
                    <div className="absolute right-24 bottom-14 w-6 h-3 bg-gray-700 border border-gray-500 rounded-sm flex items-center justify-center">
                    <span className="text-[5px] text-gray-300">JPOW1</span>
                    </div>

                    {/* Header bawah kanan */}
                    <div className="absolute right-2 bottom-3 flex flex-col gap-0.5 items-end">
                    <div className="px-1 py-0.5 bg-gray-700 border border-gray-500 rounded text-[5px] text-gray-300">JUSB1</div>
                    <div className="px-1 py-0.5 bg-gray-700 border border-gray-500 rounded text-[5px] text-gray-300">SYSFAN1</div>
                    <div className="px-1 py-0.5 bg-gray-700 border border-gray-500 rounded text-[5px] text-gray-300">JP1</div>
                    <div className="px-1 py-0.5 bg-gray-700 border border-gray-500 rounded text-[5px] text-gray-300">J1394_1</div>
                    </div>

                    {/* ========== SATA / Storage ========== */}
                    <div
                        onDrop={(e) => handleDrop(e, "storage")}
                        onDragOver={handleDragOver}
                        className={`absolute left-8 top-64 w-32 h-6 rounded border border-dashed flex items-center justify-center ${
                        build.storage?.length
                            ? "border-green-400 bg-green-500/30"
                            : "border-cyan-400 bg-cyan-500/10"
                        }`}
                    >
                        <span className="text-[8px] text-cyan-300">
                        {build.storage?.length ? "Storage ✓" : "SATA / M.2"}
                        </span>
                    </div>

                    {/* ========== CMOS Battery ========== */}
                    <div className="absolute right-16 bottom-8 w-5 h-5 rounded-full bg-gray-600 border-2 border-gray-400 flex items-center justify-center">
                        <span className="text-[6px] text-gray-200">BAT</span>
                    </div>

                    {/* ========== FRONT PANEL + HEADERS (bawah) ========== */}
                    <div className="absolute left-8 bottom-2 flex gap-2">
                        <div className="px-1.5 py-0.5 bg-gray-700 border border-gray-500 rounded text-[6px] text-gray-300">
                        F_PANEL
                        </div>
                        <div className="px-1.5 py-0.5 bg-gray-700 border border-gray-500 rounded text-[6px] text-gray-300">
                        USB
                        </div>
                        <div className="px-1.5 py-0.5 bg-gray-700 border border-gray-500 rounded text-[6px] text-gray-300">
                        FAN
                        </div>
                        <div className="px-1.5 py-0.5 bg-gray-700 border border-gray-500 rounded text-[6px] text-gray-300">
                        AUDIO
                        </div>
                    </div>

                    {/* ========== Label kecil ========== */}
                    <div className="absolute left-2 top-28 text-[6px] text-gray-500 rotate-90 origin-left">
                        PCI Slots
                    </div>
                    </div>

                    {/* PSU */}
                    <div
                      onDrop={(e) => handleDrop(e, "psu")}
                      onDragOver={handleDragOver}
                      className={`absolute bottom-1.5 left-2.5 right-2.5 h-[17%] rounded border-2 border-dashed flex flex-col items-center justify-center ${
                        build.psu?.length ? "border-green-400 bg-green-500/20" : "border-orange-500/50"
                      }`}
                    >
                      <Power size={16} />
                      <span className="text-[10px]">PSU</span>
                    </div>

                    {/* ==================== KABEL REALISTIS ==================== */}
                    {showCables && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {/* Cable Channel (jalur sebelah kiri) */}
                        <div className="absolute left-1 top-[10%] bottom-[22%] w-2 rounded bg-gray-800/90 border border-gray-600" />

                        {/* 24-pin ATX - dari PSU naik ke motherboard */}
                        <div
                        className="absolute left-5 bottom-[19%] w-2 rounded-full origin-bottom transition-all duration-1000"
                        style={{
                            backgroundColor: "#eab308",
                            height: cableAnim["24pin"] ? "32%" : "0%",
                            opacity: cableAnim["24pin"] ? 1 : 0,
                            boxShadow: "0 0 6px #eab30888",
                        }}
                        />
                        {/* cabang 24-pin ke kanan sedikit biar tidak lurus */}
                        <div
                        className="absolute left-5 bottom-[48%] h-1.5 rounded-full origin-left transition-all duration-700 delay-200"
                        style={{
                            backgroundColor: "#eab308",
                            width: cableAnim["24pin"] ? "18%" : "0%",
                            opacity: cableAnim["24pin"] ? 0.9 : 0,
                        }}
                        />

                        {/* 8-pin CPU Power - dari PSU naik lalu ke atas motherboard */}
                        <div
                        className="absolute left-8 bottom-[19%] w-1.5 rounded-full origin-bottom transition-all duration-1000 delay-100"
                        style={{
                            backgroundColor: "#ca8a04",
                            height: cableAnim["cpu8pin"] ? "55%" : "0%",
                            opacity: cableAnim["cpu8pin"] ? 1 : 0,
                        }}
                        />
                        <div
                        className="absolute left-8 top-[12%] h-1.5 rounded-full origin-left transition-all duration-700 delay-300"
                        style={{
                            backgroundColor: "#ca8a04",
                            width: cableAnim["cpu8pin"] ? "22%" : "0%",
                            opacity: cableAnim["cpu8pin"] ? 0.9 : 0,
                        }}
                        />

                        {/* PCIe Power ke GPU */}
                        {build.gpu?.[0]?.needsPower && (
                        <>
                            <div
                            className="absolute left-[30%] top-[51%] h-1.5 rounded-full origin-left transition-all duration-800"
                            style={{
                                backgroundColor: "#ef4444",
                                width: cableAnim["pcie1"] ? "28%" : "0%",
                                opacity: cableAnim["pcie1"] ? 1 : 0,
                                boxShadow: "0 0 6px #ef444688",
                            }}
                            />
                            <div
                            className="absolute left-[30%] top-[54%] h-1 rounded-full origin-left transition-all duration-800 delay-150"
                            style={{
                                backgroundColor: "#f87171",
                                width: cableAnim["pcie2"] ? "25%" : "0%",
                                opacity: cableAnim["pcie2"] ? 0.8 : 0,
                            }}
                            />
                        </>
                        )}

                        {/* SATA Power (dari PSU ke kanan bawah) */}
                        <div
                        className="absolute left-[20%] bottom-[19%] h-1.5 rounded-full origin-left transition-all duration-900"
                        style={{
                            backgroundColor: "#3b82f6",
                            width: cableAnim["sata_power"] ? "45%" : "0%",
                            opacity: cableAnim["sata_power"] ? 1 : 0,
                        }}
                        />
                        <div
                        className="absolute right-[18%] bottom-[19%] w-1.5 rounded-full origin-bottom transition-all duration-700 delay-200"
                        style={{
                            backgroundColor: "#3b82f6",
                            height: cableAnim["sata_power"] ? "18%" : "0%",
                            opacity: cableAnim["sata_power"] ? 0.9 : 0,
                        }}
                        />

                        {/* SATA Data (dari motherboard ke storage) */}
                        <div
                        className="absolute right-8 top-[62%] w-1 rounded-full origin-top transition-all duration-800"
                        style={{
                            backgroundColor: "#06b6d4",
                            height: cableAnim["sata_data"] ? "22%" : "0%",
                            opacity: cableAnim["sata_data"] ? 1 : 0,
                        }}
                        />

                        {/* Front Panel (dari depan case ke motherboard) */}
                        <div
                        className="absolute right-0 top-[38%] h-1 rounded-full origin-right transition-all duration-700"
                        style={{
                            backgroundColor: "#a3a3a3",
                            width: cableAnim["front_panel"] ? "35%" : "0%",
                            opacity: cableAnim["front_panel"] ? 0.85 : 0,
                        }}
                        />

                        {/* CPU Fan */}
                        <div
                        className="absolute left-[45%] top-[28%] h-1 rounded-full origin-left transition-all duration-600"
                        style={{
                            backgroundColor: "#22c55e",
                            width: cableAnim["cpu_fan"] ? "20%" : "0%",
                            opacity: cableAnim["cpu_fan"] ? 0.9 : 0,
                        }}
                        />

                        {/* Case Fan */}
                        <div
                        className="absolute left-3 top-[40%] w-1 rounded-full origin-top transition-all duration-700"
                        style={{
                            backgroundColor: "#4ade80",
                            height: cableAnim["case_fan"] ? "25%" : "0%",
                            opacity: cableAnim["case_fan"] ? 0.8 : 0,
                        }}
                        />
                    </div>
                    )}
                  </div>
                </div>

                {/* Drop Case & Cooler & MB */}
                <div className="mt-6 space-y-2">
                  <div
                    onDrop={(e) => handleDrop(e, "case")}
                    onDragOver={handleDragOver}
                    className={`rounded-lg border-2 border-dashed p-2 text-center text-xs ${
                      build.case?.length ? "border-green-400 bg-green-50 dark:bg-green-500/10" : ""
                    }`}
                  >
                    {build.case?.[0]?.name || "Drop Casing"}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onDrop={(e) => handleDrop(e, "motherboard")}
                      onDragOver={handleDragOver}
                      className={`rounded-lg border-2 border-dashed p-2 text-center text-xs ${
                        build.motherboard?.length ? "border-green-400 bg-green-50 dark:bg-green-500/10" : ""
                      }`}
                    >
                      {build.motherboard?.[0]?.name || "Motherboard"}
                    </div>
                    <div
                      onDrop={(e) => handleDrop(e, "cooler")}
                      onDragOver={handleDragOver}
                      className={`rounded-lg border-2 border-dashed p-2 text-center text-xs ${
                        build.cooler?.length ? "border-green-400 bg-green-50 dark:bg-green-500/10" : ""
                      }`}
                    >
                      {build.cooler?.[0]?.name || "Cooler"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Status + Cabling */}
          <div className="lg:col-span-4 space-y-3">
            {/* Errors */}
            {errors.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                  <AlertTriangle size={16} />
                  <span className="font-semibold text-sm">Error Kompatibilitas</span>
                </div>
                <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                  {errors.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tombol Pasang Kabel */}
            <div className="rounded-xl border bg-white p-4 dark:border-white/10 surface-card space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Cable size={16} /> Manajemen Kabel
              </p>

              <button
                onClick={handleInstallCables}
                disabled={!canInstallCables || showCables}
                className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                  canInstallCables && !showCables
                    ? "bg-accent text-white hover:bg-accent/90"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-white/5"
                }`}
              >
                <Zap size={16} />
                {showCables ? "Kabel Sudah Terpasang" : "Pasang Semua Kabel"}
              </button>

              <button
                onClick={startCablingChallenge}
                disabled={!canInstallCables}
                className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium border transition ${
                  canInstallCables
                    ? "border-accent text-accent hover:bg-accent/5"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Play size={16} />
                Mode Cabling Challenge
              </button>

              {/* Challenge Progress */}
              {cablingMode && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-xs font-medium mb-2">
                    Langkah {Math.min(currentCableStep + 1, CABLE_STEPS.length)} / {CABLE_STEPS.filter(c => c.id !== "pcie" || build.gpu?.[0]?.needsPower).length}
                  </p>
                  <p className="text-sm mb-3">
                    {CABLE_STEPS.filter(c => c.id !== "pcie" || build.gpu?.[0]?.needsPower)[currentCableStep]?.label || "Selesai!"}
                  </p>
                  <button
                    onClick={installNextCable}
                    disabled={currentCableStep >= CABLE_STEPS.filter(c => c.id !== "pcie" || build.gpu?.[0]?.needsPower).length}
                    className="w-full rounded-lg bg-green-600 text-white py-2 text-sm font-medium disabled:opacity-50"
                  >
                    {currentCableStep >= CABLE_STEPS.filter(c => c.id !== "pcie" || build.gpu?.[0]?.needsPower).length
                      ? "Challenge Selesai ✓"
                      : "Pasang Kabel Ini"}
                  </button>
                </div>
              )}

              {/* List kabel yang sudah terpasang */}
              {cablesInstalled.length > 0 && (
                <div className="text-xs text-gray-500 space-y-1">
                  {cablesInstalled.map((id) => (
                    <div key={id} className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-green-500" />
                      {CABLE_STEPS.find((c) => c.id === id)?.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Success */}
            {errors.length === 0 && progress >= 7 && cablesInstalled.length >= 3 && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2 size={18} />
                  <span className="font-semibold">PC Siap Menyala!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Semua komponen dan kabel sudah terpasang dengan benar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}