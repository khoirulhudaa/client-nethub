import {
  AlertTriangle,
  Box,
  Briefcase,
  Cable,
  CheckCircle2,
  Cpu,
  Gamepad2,
  Info,
  Power,
  RotateCcw,
  Server,
  Video,
  Wallet
} from "lucide-react";
import { useState } from "react";

/* ====================== DATA ====================== */
const PURPOSES = [
  { id: "gaming", label: "Gaming", icon: Gamepad2, desc: "Performa tinggi untuk game" },
  { id: "editing", label: "Video Editing", icon: Video, desc: "Render cepat & multi-task" },
  { id: "office", label: "Kantor / Browsing", icon: Briefcase, desc: "Hemat daya & tenang" },
  { id: "server", label: "Home Server", icon: Server, desc: "Stabil 24/7" },
  { id: "budget", label: "Budget", icon: Wallet, desc: "Maksimal di harga rendah" },
];

const COMPONENTS = {
  case: [
    { id: "case1", name: "Mid Tower ATX", form: ["ATX", "mATX"], maxGpu: 360 },
    { id: "case2", name: "High Airflow", form: ["ATX", "mATX"], maxGpu: 400 },
  ],
  motherboard: [
    { id: "mb1", name: "ASUS Prime H610M-K", socket: "LGA1700", form: "mATX", ramType: "DDR4" },
    { id: "mb2", name: "MSI B760M WiFi", socket: "LGA1700", form: "mATX", ramType: "DDR5" },
    { id: "mb3", name: "Gigabyte B550M", socket: "AM4", form: "mATX", ramType: "DDR4" },
  ],
  cpu: [
    { id: "cpu1", name: "Intel i3-12100", socket: "LGA1700", tdp: 60 },
    { id: "cpu2", name: "Intel i5-12400F", socket: "LGA1700", tdp: 65 },
    { id: "cpu3", name: "Ryzen 5 5600", socket: "AM4", tdp: 65 },
    { id: "cpu4", name: "Ryzen 7 5800X3D", socket: "AM4", tdp: 105 },
  ],
  cooler: [
    { id: "cool1", name: "Tower Air Cooler", tdpSupport: 150 },
    { id: "cool2", name: "AIO 240mm", tdpSupport: 250 },
  ],
  ram: [
    { id: "ram1", name: "16GB DDR4-3200", type: "DDR4", capacity: 16 },
    { id: "ram2", name: "32GB DDR5-6000", type: "DDR5", capacity: 32 },
  ],
  gpu: [
    { id: "gpu1", name: "GTX 1650 4GB", tdp: 75, length: 170, needsPower: false },
    { id: "gpu2", name: "RTX 4060 8GB", tdp: 115, length: 240, needsPower: true },
    { id: "gpu3", name: "RTX 4070 Super", tdp: 220, length: 280, needsPower: true },
  ],
  storage: [
    { id: "ssd1", name: "1TB NVMe Gen4", type: "NVMe" },
    { id: "ssd2", name: "1TB SATA SSD", type: "SATA" },
  ],
  psu: [
    { id: "psu1", name: "650W 80+ Gold", watt: 650 },
    { id: "psu2", name: "750W Modular", watt: 750 },
  ],
};

const CABLES = [
  { id: "atx24", name: "24-pin ATX", target: "atx24", color: "#eab308", required: true },
  { id: "cpu8", name: "8-pin EPS (CPU)", target: "cpu8", color: "#ca8a04", required: true },
  { id: "pcie", name: "PCIe Power (GPU)", target: "pcie", color: "#ef4444", required: false },
  { id: "sata_p", name: "SATA Power", target: "sata_p", color: "#3b82f6", required: true },
  { id: "sata_d", name: "SATA Data", target: "sata_d", color: "#06b6d4", required: true },
  { id: "pwr_sw", name: "POWER SW (2-pin)", target: "pwr_sw", color: "#a3a3a3", required: true },
  { id: "rst_sw", name: "RESET SW (2-pin)", target: "rst_sw", color: "#a3a3a3", required: true },
  { id: "pwr_led", name: "POWER LED", target: "pwr_led", color: "#a3a3a3", required: true },
  { id: "hdd_led", name: "HDD LED", target: "hdd_led", color: "#a3a3a3", required: true },
  { id: "usb9", name: "USB 9-pin Header", target: "usb9", color: "#8b5cf6", required: true },
  { id: "audio9", name: "HD AUDIO 9-pin", target: "audio9", color: "#ec4899", required: true },
  { id: "cpu_fan", name: "CPU Fan 4-pin", target: "cpu_fan", color: "#22c55e", required: true },
  { id: "sys_fan", name: "SYS_FAN 4-pin", target: "sys_fan", color: "#4ade80", required: true },
];

/* ====================== VALIDASI ====================== */
function validate(build) {
  const errors = [];
  const cpu = build.cpu;
  const mb = build.motherboard;
  const ram = build.ram;
  const gpu = build.gpu;
  const psu = build.psu;
  const cooler = build.cooler;
  const pcCase = build.case;

  if (cpu && mb && cpu.socket !== mb.socket) errors.push(`CPU ${cpu.socket} ≠ Motherboard ${mb.socket}`);
  if (ram && mb && ram.type !== mb.ramType) errors.push(`RAM ${ram.type} tidak cocok (${mb.ramType})`);
  if (cpu && cooler && cooler.tdpSupport < cpu.tdp) errors.push(`Cooler terlalu lemah untuk CPU`);
  if (mb && pcCase && !pcCase.form.includes(mb.form)) errors.push(`Motherboard tidak muat di case`);
  if (gpu && pcCase && gpu.length > pcCase.maxGpu) errors.push(`GPU terlalu panjang`);
  if (cpu && psu) {
    const need = cpu.tdp + (gpu?.tdp || 0) + 120;
    if (psu.watt < need) errors.push(`PSU kurang (butuh ≈${need}W)`);
  }
  return errors;
}

/* ====================== KOMPONEN UTAMA ====================== */
export default function PCBuilder() {
  const [step, setStep] = useState("purpose"); // purpose | build | wiring | done
  const [purpose, setPurpose] = useState(null);
  const [build, setBuild] = useState({});
  const [selectedCat, setSelectedCat] = useState("case");
  const [dragItem, setDragItem] = useState(null);
  const [cables, setCables] = useState({}); // { target: cableId }
  const [dragCable, setDragCable] = useState(null);

  const errors = validate(build);
  const requiredCats = ["case", "motherboard", "cpu", "cooler", "ram", "storage", "psu"];
  const progress = requiredCats.filter(c => build[c]).length;
  const canWire = progress === 7 && errors.length === 0;

  const neededCables = CABLES.filter(c => {
    if (c.id === "pcie") return build.gpu?.needsPower;
    return c.required;
  });

  const wiredCount = Object.keys(cables).length;
  const allWired = wiredCount >= neededCables.length;

  // ===== HANDLERS =====
  const startBuild = (p) => {
    setPurpose(p);
    setStep("build");
  };

  const onDragStart = (e, item, cat) => {
    setDragItem({ item, cat });
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e, cat) => {
    e.preventDefault();
    if (!dragItem || dragItem.cat !== cat) return;
    setBuild(prev => ({ ...prev, [cat]: dragItem.item }));
    setDragItem(null);
  };

  const remove = (cat) => {
    setBuild(prev => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
    setCables({});
  };

  const reset = () => {
    setBuild({});
    setCables({});
    setStep("purpose");
    setPurpose(null);
  };

  const onCableDrag = (e, cable) => {
    setDragCable(cable);
    e.dataTransfer.effectAllowed = "move";
  };

  const onHeaderDrop = (e, target) => {
    e.preventDefault();
    if (!dragCable || dragCable.target !== target) return;
    setCables(prev => ({ ...prev, [target]: dragCable.id }));
    setDragCable(null);
  };

  // ===== RENDER: PURPOSE =====
  if (step === "purpose") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white/5 to-slate-800 text-white flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          <h1 className="text-3xl font-bold text-center mb-2">Rakit PC Simulator</h1>
          <p className="text-center text-white mb-10">Pilih tujuanmu dulu, biar rekomendasinya pas</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PURPOSES.map(p => (
              <button
                key={p.id}
                onClick={() => startBuild(p)}
                className="group bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-left transition-all"
              >
                <p.icon size={32} className="mb-4 text-blue-400 group-hover:scale-110 transition" />
                <h3 className="font-semibold text-lg">{p.label}</h3>
                <p className="text-sm text-white mt-1">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: BUILD + WIRING =====
  return (
    <div className="min-h-screen surface-card text-slate-100 p-4 md:p-6">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-white/5 backdrop-blur sticky rounded-xl top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold">Rakit PC</h1>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
              {purpose?.label}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-white">Komponen</span>
              <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${(progress/7)*100}%` }} />
              </div>
              <span>{progress}/7</span>
            </div>
            
            {step === "wiring" && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white">Kabel</span>
                <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(wiredCount/neededCables.length)*100}%` }} />
                </div>
                <span>{wiredCount}/{neededCables.length}</span>
              </div>
            )}

            <button onClick={reset} className="flex items-center gap-1.5 text-sm text-white hover:text-white">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ===== LEFT: Katalog ===== */}
        <div className="lg:col-span-3 space-y-4">
          {step === "build" && (
            <>
              <div className="bg-white/5 rounded-xl border border-slate-800 p-3">
                <p className="text-xs font-medium text-slate-500 mb-2">KATEGORI</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(COMPONENTS).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCat(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs capitalize transition ${
                        selectedCat === cat 
                          ? "bg-blue-600 text-white" 
                          : "bg-slate-800 text-white hover:bg-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl border border-slate-800 p-3">
                <p className="text-xs font-medium text-slate-500 mb-3">Drag ke slot</p>
                <div className="space-y-2 max-h-[520px] overflow-y-auto">
                  {COMPONENTS[selectedCat].map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={e => onDragStart(e, item, selectedCat)}
                      className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing transition"
                    >
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {selectedCat === "cpu" && `${item.socket} • ${item.tdp}W`}
                        {selectedCat === "motherboard" && `${item.socket} • ${item.ramType}`}
                        {selectedCat === "ram" && `${item.type} • ${item.capacity}GB`}
                        {selectedCat === "gpu" && `${item.tdp}W • ${item.length}mm`}
                        {selectedCat === "psu" && `${item.watt}W`}
                        {selectedCat === "cooler" && `Support ${item.tdpSupport}W`}
                        {selectedCat === "case" && `Max GPU ${item.maxGpu}mm`}
                        {selectedCat === "storage" && item.type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === "wiring" && (
            <div className="bg-white/5 rounded-xl border border-slate-800 p-4">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Cable size={16} /> Daftar Kabel
              </p>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {neededCables.map(cable => {
                  const installed = Object.values(cables).includes(cable.id);
                  return (
                    <div
                      key={cable.id}
                      draggable={!installed}
                      onDragStart={e => !installed && onCableDrag(e, cable)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm transition ${
                        installed 
                          ? "bg-emerald-500/10 border-emerald-500/40 opacity-70" 
                          : "bg-slate-800/60 border-slate-700 cursor-grab active:cursor-grabbing hover:border-slate-500"
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cable.color }} />
                      <span className="flex-1">{cable.name}</span>
                      {installed && <CheckCircle2 size={14} className="text-emerald-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ===== CENTER: Visual Case ===== */}
        <div className="lg:col-span-5">
          <div className="bg-white/5 rounded-xl border border-slate-800 px-3">
            <div className="flex items-center justify-between mb-3">
              {step === "build" && canWire && (
                <button
                  onClick={() => setStep("wiring")}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition"
                >
                  <Cable size={14} /> Lanjut ke Kabel
                </button>
              )}
              {step === "wiring" && (
                <button
                  onClick={() => setStep("build")}
                  className="text-sm text-white hover:text-white"
                >
                  ← Kembali
                </button>
              )}
            </div>

            {/* Visual Motherboard */}
            <div className="relative mx-auto aspect-[1/1.3] bg-slate-950 rounded-lg border-4 border-slate-700 overflow-hidden">
              
              {/* Motherboard Area */}
              <div className="absolute inset-2 bottom-[16%] bg-[#111827] border border-slate-700">
                {/* PCB Grid */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
                  backgroundSize: "14px 14px"
                }} />

                {/* CPU Socket */}
                <div
                  onDrop={e => onDrop(e, "cpu")}
                  onDragOver={e => e.preventDefault()}
                  className={`absolute left-6 top-5 w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center ${
                    build.cpu ? "border-emerald-500 bg-emerald-500/20" : "border-amber-500/60 bg-amber-500/10"
                  }`}
                >
                  {build.cpu ? (
                    <span className="text-[10px] text-emerald-300 text-center px-1">{build.cpu.name}</span>
                  ) : (
                    <>
                      <Cpu size={20} className="text-amber-400" />
                      <span className="text-[9px] text-amber-300 mt-1">CPU</span>
                    </>
                  )}
                </div>

                {/* CPU 8-pin */}
                <Header 
                  id="cpu8" 
                  label="8-pin" 
                  installed={!!cables.cpu8} 
                  onDrop={onHeaderDrop}
                  className="absolute right-3 top-14 w-5 flex items-center justify-center h-9"
                  vertical
                />

                {/* RAM */}
                <div
                  onDrop={e => onDrop(e, "ram")}
                  onDragOver={e => e.preventDefault()}
                  className={`absolute right-14 top-72 w-40 h-5 rounded border-2 border-dashed flex items-center justify-center ${
                    build.ram ? "border-emerald-500 bg-emerald-500/20" : "border-blue-500/60 bg-blue-500/10"
                  }`}
                >
                  <span className="text-[9px] whitespace-nowrap text-blue-300">
                    {build.ram ? "RAM ✓" : "DDR"}
                  </span>
                </div>
                <div
                  onDrop={e => onDrop(e, "ram")}
                  onDragOver={e => e.preventDefault()}
                  className={`absolute right-14 top-64 w-40 h-5 rounded border-2 border-dashed flex items-center justify-center ${
                    build.ram ? "border-emerald-500 bg-emerald-500/20" : "border-blue-500/60 bg-blue-500/10"
                  }`}
                >
                  <span className="text-[9px] whitespace-nowrap text-blue-300">
                    {build.ram ? "RAM ✓" : "DDR"}
                  </span>
                </div>

                {/* PCIe / GPU */}
                <div
                  onDrop={e => onDrop(e, "gpu")}
                  onDragOver={e => e.preventDefault()}
                  className={`absolute left-6 right-16 top-32 h-7 w-[70%] rounded border-2 border-dashed flex items-center justify-center ${
                    build.gpu ? "border-emerald-500 bg-emerald-500/20" : "border-purple-500/60 bg-purple-500/10"
                  }`}
                >
                  <span className="text-[10px] text-purple-300 truncate px-2">
                    {build.gpu ? build.gpu.name : "PCIe x16 / GPU"}
                  </span>
                </div>

                {/* PCIe Power target */}
                {build.gpu?.needsPower && (
                  <Header 
                    id="pcie" 
                    label="PCIe Power" 
                    installed={!!cables.pcie} 
                    onDrop={onHeaderDrop}
                    className="absolute left-1/2 -translate-x-1/2 top-[42%] px-2 py-0.5 text-[9px]"
                  />
                )}

                {/* 24-pin ATX */}
                <Header 
                  id="atx24" 
                  label="24-pin" 
                  installed={!!cables.atx24} 
                  onDrop={onHeaderDrop}
                  className="absolute right-2 top-52 flex items-center justify-center w-4 h-16"
                  vertical
                />

                {/* SATA */}
                <div className="absolute left-6 top-56 flex gap-1.5">
                  <Header id="sata_d" label="SATA Data" installed={!!cables.sata_d} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                </div>

                {/* FAN Headers */}
                <div className="absolute left-28 top-5 flex gap-1">
                  <Header id="cpu_fan" label="CPU_FAN" installed={!!cables.cpu_fan} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                  <Header id="sys_fan" label="SYS_FAN" installed={!!cables.sys_fan} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                </div>

                {/* Front Panel */}
                <div className="absolute left-5 bottom-2 right-5">
                  <p className="text-[7px] text-slate-500 mb-1">FRONT PANEL</p>
                  <div className="flex flex-wrap gap-1">
                    <Header id="pwr_sw" label="PWR_SW" installed={!!cables.pwr_sw} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                    <Header id="rst_sw" label="RESET" installed={!!cables.rst_sw} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                    <Header id="pwr_led" label="PLED" installed={!!cables.pwr_led} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                    <Header id="hdd_led" label="HD_LED" installed={!!cables.hdd_led} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                  </div>
                </div>

                {/* USB & Audio */}
                <div className="absolute right-2 bottom-10 flex flex-col gap-1">
                  <Header id="usb9" label="USB 9p" installed={!!cables.usb9} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                  <Header id="audio9" label="AUDIO 9p" installed={!!cables.audio9} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                </div>
              </div>

              {/* PSU Area */}
              <div
                onDrop={e => onDrop(e, "psu")}
                onDragOver={e => e.preventDefault()}
                className={`absolute bottom-1.5 left-2 right-2 h-[14%] border-2 border-dashed flex flex-col items-center justify-center ${
                  build.psu ? "border-emerald-500 bg-white/5" : "border-orange-500/50 bg-white/5"
                }`}
              >
                <Power size={14} className="mb-0.5" />
                <span className="text-[10px]">{build.psu?.name || "PSU"}</span>
                <Header 
                  id="sata_p" 
                  label="SATA Power" 
                  installed={!!cables.sata_p} 
                  onDrop={onHeaderDrop}
                  className="mt-1 px-2 py-0.5 text-[8px]"
                />
              </div>
            </div>

            {/* Quick slots under visual */}
            {step === "build" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["case", "motherboard", "cooler", "storage"].map(cat => (
                  <div
                    key={cat}
                    onDrop={e => onDrop(e, cat)}
                    onDragOver={e => e.preventDefault()}
                    className={`rounded-lg border border-dashed p-2 text-center text-xs ${
                      build[cat] ? "border-emerald-500 bg-emerald-500/10" : "border-slate-600"
                    }`}
                  >
                    {build[cat]?.name || cat.toUpperCase()}
                    {build[cat] && (
                      <button onClick={() => remove(cat)} className="ml-1 text-red-400 hover:text-red-300">×</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT: Status ===== */}
        <div className="lg:col-span-4 space-y-4">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle size={16} />
                <span className="font-medium text-sm">Tidak Kompatibel</span>
              </div>
              <ul className="text-sm text-red-300/90 space-y-1">
                {errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}

          {/* Build Summary */}
          <div className="bg-white/5 rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-medium mb-3">Ringkasan Build</p>
            <div className="space-y-2 text-sm">
              {requiredCats.map(cat => (
                <div key={cat} className="flex justify-between items-center">
                  <span className="text-white capitalize">{cat}</span>
                  <span className={build[cat] ? "text-emerald-400" : "text-slate-600"}>
                    {build[cat]?.name || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {step === "build" && canWire && (
            <button
              onClick={() => setStep("wiring")}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition"
            >
              <Cable size={18} /> Mulai Pasang Kabel
            </button>
          )}

          {step === "wiring" && allWired && (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-5 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
              <h3 className="font-semibold text-lg text-emerald-300">PC Siap Menyala!</h3>
              <p className="text-sm text-emerald-400/80 mt-1">Semua komponen & kabel sudah terpasang dengan benar.</p>
            </div>
          )}

          {step === "wiring" && !allWired && (
            <div className="bg-white/5 border border-slate-800 rounded-xl p-4 text-sm text-white">
              <Info size={16} className="inline mr-2" />
              Tarik kabel dari panel kiri, lalu drop ke pin yang sesuai di motherboard.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Helper: Header Pin ===== */
function Header({ id, label, installed, onDrop, className = "", vertical = false }) {
  return (
    <div
      onDrop={e => onDrop(e, id)}
      onDragOver={e => e.preventDefault()}
      className={`rounded border text-center transition cursor-pointer ${
        installed 
          ? "border-emerald-500 bg-emerald-500/30 text-emerald-200" 
          : "border-slate-600 bg-slate-800/80 text-white hover:border-slate-400"
      } ${className}`}
    >
      <span className={vertical ? "text-[8px] font-medium" : ""} style={vertical ? { writingMode: "vertical-rl" } : {}}>
        {installed ? "✓" : label}
      </span>
    </div>
  );
}