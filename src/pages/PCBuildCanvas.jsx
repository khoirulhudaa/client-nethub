import {
  AlertTriangle,
  Cable,
  Calculator,
  CheckCircle2,
  Cpu,
  Info,
  LayoutGrid,
  List,
  Power,
  RotateCcw
} from "lucide-react";
import { useMemo, useState } from "react";

/* ====================== DATA (super lengkap) ====================== */
const COMPONENTS = {
  case: [
    { id: "case1", name: "Armaggeddon AERO VII + Magnum 225", form: ["ATX", "mATX"], maxGpu: 360, price: 590000 },
    { id: "case2", name: "Armaggeddon Aquaron Xtreme", form: ["ATX", "mATX"], maxGpu: 400, price: 1000000 },
    { id: "case3", name: "Armaggeddon Tritron Pro 100 (White)", form: ["ATX", "mATX"], maxGpu: 340, price: 480000 },
    { id: "case4", name: "DeepCool CH270 DIGITAL", form: ["ATX", "mATX"], maxGpu: 380, price: 1060000 },
    { id: "case5", name: "Fractal Design Meshify 2 Lite RGB", form: ["ATX", "mATX"], maxGpu: 420, price: 1995000 },
    { id: "case6", name: "Lian Li O11 DYNAMIC MINI V2 FLOW", form: ["ATX", "mATX"], maxGpu: 400, price: 1650000 },
    { id: "case7", name: "MONTECH AIR 1000 PREMIUM (White)", form: ["ATX", "mATX"], maxGpu: 380, price: 1139000 },
    { id: "case8", name: "MSI MAG FORGE 130A AIRFLOW", form: ["ATX", "mATX"], maxGpu: 350, price: 555000 },
    { id: "case9", name: "Tecware Timber L High Airflow ATX", form: ["ATX", "mATX"], maxGpu: 370, price: 660000 },
    { id: "case10", name: "VENOMRX Astral Max ARGB", form: ["ATX", "mATX"], maxGpu: 360, price: 645000 },
    { id: "case11", name: "Zalman P30 Micro-ATX", form: ["mATX"], maxGpu: 320, price: 1107000 },
  ],

  motherboard: [
    // AM4
    { id: "mb1", name: "ASRock A520M-HVS", socket: "AM4", form: "mATX", ramType: "DDR4", price: 880000 },
    { id: "mb2", name: "ASRock B550M Pro SE", socket: "AM4", form: "mATX", ramType: "DDR4", price: 1590000 },
    { id: "mb3", name: "ASUS PRIME A520M-K", socket: "AM4", form: "mATX", ramType: "DDR4", price: 1030000 },
    { id: "mb4", name: "GIGABYTE B550M K", socket: "AM4", form: "mATX", ramType: "DDR4", price: 1240000 },
    { id: "mb5", name: "MSI B550M PRO-VDH", socket: "AM4", form: "mATX", ramType: "DDR4", price: 1459000 },
    { id: "mb6", name: "MSI B450M-A PRO MAX II", socket: "AM4", form: "mATX", ramType: "DDR4", price: 1060000 },
    // AM5
    { id: "mb7", name: "ASUS PRIME B650M-A II", socket: "AM5", form: "mATX", ramType: "DDR5", price: 2270000 },
    { id: "mb8", name: "ASUS PRIME B650M-K", socket: "AM5", form: "mATX", ramType: "DDR5", price: 2059000 },
    { id: "mb9", name: "GIGABYTE B650M GAMING PLUS WIFI", socket: "AM5", form: "mATX", ramType: "DDR5", price: 2490000 },
    { id: "mb10", name: "MSI B850M GAMING PLUS WIFI", socket: "AM5", form: "mATX", ramType: "DDR5", price: 3350000 },
    { id: "mb11", name: "MSI PRO B840M-B", socket: "AM5", form: "mATX", ramType: "DDR5", price: 1675000 },
    { id: "mb12", name: "ASRock B840M-HVS", socket: "AM5", form: "mATX", ramType: "DDR5", price: 1620000 },
    // LGA1700
    { id: "mb13", name: "ASRock H610M-H2/M.2", socket: "LGA1700", form: "mATX", ramType: "DDR4", price: 1050000 },
    { id: "mb14", name: "ASUS PRIME H610M-R D4", socket: "LGA1700", form: "mATX", ramType: "DDR4", price: 1215000 },
    { id: "mb15", name: "GIGABYTE H610M K DDR4", socket: "LGA1700", form: "mATX", ramType: "DDR4", price: 1035000 },
    { id: "mb16", name: "MSI PRO H610M-E DDR4", socket: "LGA1700", form: "mATX", ramType: "DDR4", price: 1225000 },
    { id: "mb17", name: "ASRock B760M PG Lightning", socket: "LGA1700", form: "mATX", ramType: "DDR5", price: 1960000 },
    { id: "mb18", name: "ASUS B760M-AYW WIFI", socket: "LGA1700", form: "mATX", ramType: "DDR5", price: 2355000 },
    { id: "mb19", name: "GIGABYTE B760M DS3H GEN5", socket: "LGA1700", form: "mATX", ramType: "DDR5", price: 2155000 },
    { id: "mb20", name: "MSI PRO B760M-E", socket: "LGA1700", form: "mATX", ramType: "DDR5", price: 1720000 },
    // LGA1851 (Ultra)
    { id: "mb21", name: "MSI PRO H810M-E", socket: "LGA1851", form: "mATX", ramType: "DDR5", price: 1597000 },
    { id: "mb22", name: "ASRock H810M-X", socket: "LGA1851", form: "mATX", ramType: "DDR5", price: 1687000 },
  ],

  cpu: [
    // AMD AM4
    { id: "cpu1", name: "AMD Ryzen 5 5500 (Box)", socket: "AM4", tdp: 65, price: 1625000 },
    { id: "cpu2", name: "AMD Ryzen 5 5600 (Box)", socket: "AM4", tdp: 65, price: 2320000 },
    { id: "cpu3", name: "AMD Ryzen 5 5600X", socket: "AM4", tdp: 65, price: 2605000 },
    { id: "cpu4", name: "AMD Ryzen 5 5600G (Tray)", socket: "AM4", tdp: 65, price: 2570000 },
    { id: "cpu5", name: "AMD Ryzen 7 5700G (Box)", socket: "AM4", tdp: 65, price: 3820000 },
    { id: "cpu6", name: "AMD Ryzen 7 5700X (Tray)", socket: "AM4", tdp: 65, price: 3089000 },
    { id: "cpu7", name: "AMD Ryzen 9 5900X", socket: "AM4", tdp: 105, price: 10900000 },
    // AMD AM5
    { id: "cpu8", name: "AMD Ryzen 5 7500F", socket: "AM5", tdp: 65, price: 2515000 },
    { id: "cpu9", name: "AMD Ryzen 5 8400F (Box)", socket: "AM5", tdp: 65, price: 2939000 },
    { id: "cpu10", name: "AMD Ryzen 5 8500G", socket: "AM5", tdp: 65, price: 2699000 },
    { id: "cpu11", name: "AMD Ryzen 5 8600G", socket: "AM5", tdp: 65, price: 3325000 },
    { id: "cpu12", name: "AMD Ryzen 5 9600", socket: "AM5", tdp: 65, price: 4090000 },
    { id: "cpu13", name: "AMD Ryzen 7 8700G", socket: "AM5", tdp: 65, price: 5050000 },
    { id: "cpu14", name: "AMD Ryzen 7 9700X (Tray)", socket: "AM5", tdp: 65, price: 5330000 },
    { id: "cpu15", name: "AMD Ryzen 9 9900X", socket: "AM5", tdp: 120, price: 7850000 },
    // Intel LGA1700
    { id: "cpu16", name: "Intel Core i3-12100F", socket: "LGA1700", tdp: 58, price: 1690000 },
    { id: "cpu17", name: "Intel Core i3-14100", socket: "LGA1700", tdp: 60, price: 2780000 },
    { id: "cpu18", name: "Intel Core i5-12400F", socket: "LGA1700", tdp: 65, price: 2750000 },
    { id: "cpu19", name: "Intel Core i5-14400F (Tray)", socket: "LGA1700", tdp: 65, price: 2800000 },
    { id: "cpu20", name: "Intel Core i5-14400 (Tray)", socket: "LGA1700", tdp: 65, price: 3900000 },
    { id: "cpu21", name: "Intel Core i7-14700 (Tray)", socket: "LGA1700", tdp: 125, price: 6250000 },
    { id: "cpu22", name: "Intel Core i9-12900K", socket: "LGA1700", tdp: 125, price: 7840000 },
    { id: "cpu23", name: "Intel Core i9-12900KF", socket: "LGA1700", tdp: 125, price: 7350000 },
    // Intel LGA1851
    { id: "cpu24", name: "Intel Core Ultra 5 225F", socket: "LGA1851", tdp: 65, price: 2999000 },
  ],

  cooler: [
    { id: "cool1", name: "Stock Cooler (Wraith Stealth)", tdpSupport: 65, price: 0 },
    { id: "cool2", name: "Tower Air Cooler 120mm", tdpSupport: 150, price: 350000 },
    { id: "cool3", name: "Tower Air Cooler Dual Tower", tdpSupport: 220, price: 650000 },
    { id: "cool4", name: "AIO 240mm", tdpSupport: 250, price: 950000 },
    { id: "cool5", name: "AIO 360mm", tdpSupport: 320, price: 1450000 },
  ],

  ram: [
    { id: "ram1", name: "Kingston ValueRAM DDR4 8GB 3200", type: "DDR4", capacity: 8, price: 1760000 },
    { id: "ram2", name: "Kingston ValueRAM DDR4 16GB 3200", type: "DDR4", capacity: 16, price: 3190000 },
    { id: "ram3", name: "Kingston FURY Beast DDR4 16GB 3600", type: "DDR4", capacity: 16, price: 3520000 },
    { id: "ram4", name: "Kingston FURY Beast DDR4 32GB Kit (2x16) 3200", type: "DDR4", capacity: 32, price: 6380000 },
    { id: "ram5", name: "Team Elite DDR4 16GB 3200", type: "DDR4", capacity: 16, price: 2800000 },
    { id: "ram6", name: "TCS DDR4 16GB 3200", type: "DDR4", capacity: 16, price: 1800000 },
    { id: "ram7", name: "Kingston FURY Beast DDR5 16GB Kit 6000", type: "DDR5", capacity: 16, price: 5120000 },
    { id: "ram8", name: "Kingston FURY Beast DDR5 32GB Kit 6000", type: "DDR5", capacity: 32, price: 9060000 },
    { id: "ram9", name: "Kingston ValueRAM DDR5 16GB 5600", type: "DDR5", capacity: 16, price: 5070000 },
    { id: "ram10", name: "AGI DDR5 16GB 4800", type: "DDR5", capacity: 16, price: 3600000 },
  ],

  gpu: [
    { id: "gpu1", name: "ASUS GT 710 2GB", tdp: 19, length: 150, needsPower: false, price: 1095000 },
    { id: "gpu2", name: "AFOX GTX 1050 Ti 4GB", tdp: 75, length: 180, needsPower: false, price: 1970000 },
    { id: "gpu3", name: "AFOX RX 580 8GB", tdp: 185, length: 240, needsPower: true, price: 2120000 },
    { id: "gpu4", name: "GIGABYTE RTX 3050 WINDFORCE 6G", tdp: 115, length: 220, needsPower: true, price: 5100000 },
    { id: "gpu5", name: "GIGABYTE RTX 3060 WINDFORCE 12G", tdp: 170, length: 240, needsPower: true, price: 8590000 },
    { id: "gpu6", name: "GIGABYTE RX 7600 GAMING OC 8G", tdp: 165, length: 280, needsPower: true, price: 5895000 },
    { id: "gpu7", name: "ASUS RX 7600 Dual EVO 8GB", tdp: 165, length: 270, needsPower: true, price: 6155000 },
    { id: "gpu8", name: "MSI RTX 5060 8G SHADOW 2X", tdp: 145, length: 250, needsPower: true, price: 9060000 },
    { id: "gpu9", name: "MSI RTX 5060 Ti 16G SHADOW", tdp: 180, length: 260, needsPower: true, price: 15290000 },
    { id: "gpu10", name: "MSI RTX 5070 12G SHADOW", tdp: 220, length: 280, needsPower: true, price: 16570000 },
    { id: "gpu11", name: "MSI RTX 5070 Ti 16G SHADOW", tdp: 285, length: 300, needsPower: true, price: 24390000 },
    { id: "gpu12", name: "GIGABYTE RX 9070 XT GAMING OC 16G", tdp: 260, length: 320, needsPower: true, price: 15550000 },
  ],

  storage: [
    { id: "ssd1", name: "Kingston NV3 1TB PCIe 4.0", type: "NVMe", price: 3620000 },
    { id: "ssd2", name: "Kingston NV3 2TB PCIe 4.0", type: "NVMe", price: 6860000 },
    { id: "ssd3", name: "Samsung 990 EVO Plus 1TB", type: "NVMe", price: 4179000 },
    { id: "ssd4", name: "Samsung 990 PRO 1TB", type: "NVMe", price: 4680000 },
    { id: "ssd5", name: "WD_BLACK SN850X 1TB", type: "NVMe", price: 6120000 },
    { id: "ssd6", name: "Kingston A400 960GB SATA", type: "SATA", price: 3620000 },
    { id: "ssd7", name: "Samsung 870 EVO 1TB SATA", type: "SATA", price: 4179000 },
    { id: "ssd8", name: "Crucial BX500 1TB SATA", type: "SATA", price: 2900000 },
    { id: "hdd1", name: "Seagate BarraCuda 2TB", type: "HDD", price: 2635000 },
    { id: "hdd2", name: "Seagate BarraCuda 4TB", type: "HDD", price: 4050000 },
  ],

  psu: [
    { id: "psu1", name: "AeroCool AERO BRONZE 550W", watt: 550, price: 580000 },
    { id: "psu2", name: "AeroCool AERO BRONZE 650W", watt: 650, price: 675000 },
    { id: "psu3", name: "Cooler Master MWE Bronze 650 V3", watt: 650, price: 800000 },
    { id: "psu4", name: "Cooler Master MWE Gold 750 V3", watt: 750, price: 1150000 },
    { id: "psu5", name: "MSI MAG A650BN 650W", watt: 650, price: 850000 },
    { id: "psu6", name: "MSI MAG A850GN PCIE5 850W", watt: 850, price: 1275000 },
    { id: "psu7", name: "CORSAIR CX650 650W Bronze", watt: 650, price: 925000 },
    { id: "psu8", name: "Thermaltake Smart BX3 750W", watt: 750, price: 1090000 },
    { id: "psu9", name: "GIGABYTE UD1000GM PG5 1000W", watt: 1000, price: 2395000 },
    { id: "psu10", name: "Cooler Master GX III Gold 1250W", watt: 1250, price: 2693000 },
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
  if (ram && mb && ram.type !== mb.ramType) errors.push(`RAM ${ram.type} tidak cocok dengan motherboard (${mb.ramType})`);
  if (cpu && cooler && cooler.tdpSupport < cpu.tdp) errors.push(`Cooler terlalu lemah untuk CPU ${cpu.tdp}W`);
  if (mb && pcCase && !pcCase.form.includes(mb.form)) errors.push(`Motherboard ${mb.form} tidak muat di case`);
  if (gpu && pcCase && gpu.length > pcCase.maxGpu) errors.push(`GPU terlalu panjang (${gpu.length}mm > ${pcCase.maxGpu}mm)`);
  if (cpu && psu) {
    const need = cpu.tdp + (gpu?.tdp || 0) + 150;
    if (psu.watt < need) errors.push(`PSU kurang (perkiraan butuh ≈${need}W)`);
  }
  return errors;
}

function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

/* ====================== KOMPONEN UTAMA ====================== */
export default function PCBuilder() {
  const [step, setStep] = useState("build");
  const [mode, setMode] = useState("visual"); // visual = drag-drop, form = select
  const [build, setBuild] = useState({});
  const [selectedCat, setSelectedCat] = useState("cpu");
  const [dragItem, setDragItem] = useState(null);
  const [cables, setCables] = useState({});
  const [dragCable, setDragCable] = useState(null);

  const errors = validate(build);
  const requiredCats = ["case", "motherboard", "cpu", "cooler", "ram", "storage", "psu"];
  const progress = requiredCats.filter(c => build[c]).length;
  const canWire = progress === 7 && errors.length === 0;

  const totalPrice = useMemo(() => {
    return Object.values(build).reduce((sum, item) => sum + (item?.price || 0), 0);
  }, [build]);

  const neededCables = CABLES.filter(c => {
    if (c.id === "pcie") return build.gpu?.needsPower;
    return c.required;
  });

  const wiredCount = Object.keys(cables).length;
  const allWired = wiredCount >= neededCables.length;

  // ===== HANDLERS =====
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

  const selectForm = (cat, id) => {
    const item = COMPONENTS[cat].find((i) => i.id === id);
    if (item) setBuild(prev => ({ ...prev, [cat]: item }));
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
    setStep("build");
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

  // ===== RENDER =====
  return (
    <div className="min-h-screen md:p-6 text-slate-100">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-white/5 backdrop-blur sticky top-0 z-20 rounded-xl mb-4">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-md">Build CPU</h1>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md">
              {mode === "visual" ? "Visual Mode" : "Form Mode"}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">

            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-400">Komponen</span>
              <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${(progress / 7) * 100}%` }} />
              </div>
              <span>{progress}/7</span>
            </div>

            {step === "wiring" && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Kabel</span>
                <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(wiredCount / neededCables.length) * 100}%` }} />
                </div>
                <span>{wiredCount}/{neededCables.length}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
              <Calculator size={14} />
              {formatRupiah(totalPrice)}
            </div>

            <button onClick={reset} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
       {/* ===== LEFT PANEL ===== */}
        <div className="lg:col-span-4 space-y-4">
          {step === "build" && (
            <div className="bg-white/5 rounded-xl border border-slate-800 p-3">
              {/* Mode toggle dipindah ke sini biar nempel sama kategori/form */}
              <div className="flex dark:!bg-[#0c0c18] border border-white/10 rounded-lg p-1 mb-3">
                <button
                  onClick={() => setMode("visual")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition ${
                    mode === "visual" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LayoutGrid size={13} /> Visual
                </button>
                <button
                  onClick={() => setMode("form")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition ${
                    mode === "form" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List size={13} /> Form
                </button>
              </div>

              {mode === "visual" && (
                <>
                  <p className="text-xs font-medium text-slate-500 mb-2">KATEGORI</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(COMPONENTS).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCat(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs uppercase transition ${
                          selectedCat === cat ? "bg-blue-600 text-white" : "dark:!bg-[#0c0c18] text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {step === "build" && mode === "visual" && (
            <div className="bg-white/5 rounded-xl border border-slate-800 p-3">
              <p className="text-xs font-medium text-slate-500 mb-3">Drag ke slot</p>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {COMPONENTS[selectedCat].map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={e => onDragStart(e, item, selectedCat)}
                    className="dark:!bg-[#0c0c18] hover:dark:!bg-[#0c0c18] border border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing transition"
                  >
                    <p className="font-medium text-sm leading-tight">{item.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {selectedCat === "cpu" && `${item.socket} • ${item.tdp}W`}
                      {selectedCat === "motherboard" && `${item.socket} • ${item.ramType}`}
                      {selectedCat === "ram" && `${item.type} • ${item.capacity}GB`}
                      {selectedCat === "gpu" && `${item.tdp}W • ${item.length}mm`}
                      {selectedCat === "psu" && `${item.watt}W`}
                      {selectedCat === "cooler" && `Support ${item.tdpSupport}W`}
                      {selectedCat === "case" && `Max GPU ${item.maxGpu}mm`}
                      {selectedCat === "storage" && item.type}
                    </p>
                    <p className="text-[11px] text-emerald-400 mt-0.5 font-medium">{formatRupiah(item.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "build" && mode === "form" && (
            <div className="bg-white/5 rounded-xl border border-slate-800 p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-sm font-medium text-slate-300">Pilih Komponen (Form Mode)</p>
              {requiredCats.map(cat => (
                <div key={cat}>
                  <label className="text-xs text-slate-500 capitalize mb-1 block">{cat}</label>
                  <select
                    value={build[cat]?.id || ""}
                    onChange={e => selectForm(cat, e.target.value)}
                    className="w-full dark:!bg-[#0c0c18] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">— Pilih {cat} —</option>
                    {COMPONENTS[cat].map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {formatRupiah(item.price)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {step === "wiring" && (
            <div className="bg-white/5 rounded-xl border border-slate-800 p-4">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Cable size={16} /> Daftar Kabel
              </p>
              <div className="space-y-2 max-h-[560px] overflow-y-auto">
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
                          : " border-slate-700 cursor-grab active:cursor-grabbing hover:border-slate-500"
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
        <div className="lg:col-span-4">
          <div className="bg-white/5 rounded-xl pb-3.5 border border-slate-800 px-3">
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
                <button onClick={() => setStep("build")} className="text-sm text-slate-400 hover:text-white">
                  ← Kembali ke Build
                </button>
              )}
            </div>

            {/* Visual Motherboard */}
            <div className="relative mx-auto aspect-[1/1.3] bg-slate-950 rounded-lg border-4 border-slate-700 overflow-hidden">
              <div className="absolute inset-2 bottom-[16%] bg-[#0f172a] border border-slate-700">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
                  backgroundSize: "14px 14px"
                }} />

                {/* CPU */}
                <div
                  onDrop={e => onDrop(e, "cpu")}
                  onDragOver={e => e.preventDefault()}
                  className={`absolute left-6 top-5 w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center ${
                    build.cpu ? "border-emerald-500 bg-emerald-500/20" : "border-amber-500/60 bg-amber-500/10"
                  }`}
                >
                  {build.cpu ? (
                    <span className="text-[9px] text-emerald-300 text-center px-1 leading-tight">{build.cpu.name}</span>
                  ) : (
                    <>
                      <Cpu size={20} className="text-amber-400" />
                      <span className="text-[9px] text-amber-300 mt-1">CPU</span>
                    </>
                  )}
                </div>

                <Header id="cpu8" label="8-pin" installed={!!cables.cpu8} onDrop={onHeaderDrop}
                  className="absolute right-2 top-5 w-5 flex items-center justify-center h-9" vertical />

                {/* RAM slots */}
                <div onDrop={e => onDrop(e, "ram")} onDragOver={e => e.preventDefault()}
                  className={`absolute right-16 bottom-32 w-36 h-5 rounded border-2 border-dashed flex items-center justify-center ${
                    build.ram ? "border-emerald-500 bg-emerald-500/20" : "border-blue-500/60 bg-blue-500/10"
                  }`}>
                  <span className="text-[9px] text-blue-300">{build.ram ? "RAM ✓" : "DDR Slot"}</span>
                </div>
                <div onDrop={e => onDrop(e, "ram")} onDragOver={e => e.preventDefault()}
                  className={`absolute right-16 bottom-24 w-36 h-5 rounded border-2 border-dashed flex items-center justify-center ${
                    build.ram ? "border-emerald-500 bg-emerald-500/20" : "border-blue-500/60 bg-blue-500/10"
                  }`}>
                  <span className="text-[9px] text-blue-300">{build.ram ? "RAM ✓" : "DDR Slot"}</span>
                </div>

                {/* GPU */}
                <div onDrop={e => onDrop(e, "gpu")} onDragOver={e => e.preventDefault()}
                  className={`absolute left-6 right-16 top-40 h-8 rounded border-2 border-dashed flex items-center justify-center ${
                    build.gpu ? "border-emerald-500 bg-emerald-500/20" : "border-purple-500/60 bg-purple-500/10"
                  }`}>
                  <span className="text-[10px] text-purple-300 truncate px-2">
                    {build.gpu ? build.gpu.name : "PCIe x16 / GPU"}
                  </span>
                </div>

                {build.gpu?.needsPower && (
                  <Header id="pcie" label="PCIe Power" installed={!!cables.pcie} onDrop={onHeaderDrop}
                    className="absolute left-1/2 -translate-x-1/2 top-[48%] px-2 py-0.5 text-[9px]" />
                )}

                <Header id="atx24" label="24-pin" installed={!!cables.atx24} onDrop={onHeaderDrop}
                  className="absolute right-2 top-48 flex items-center justify-center w-4 h-16" vertical />

                <div className="absolute left-6 top-64 flex gap-1.5">
                  <Header id="sata_d" label="SATA Data" installed={!!cables.sata_d} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                </div>

                <div className="absolute left-28 top-5 flex gap-1">
                  <Header id="cpu_fan" label="CPU_FAN" installed={!!cables.cpu_fan} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                  <Header id="sys_fan" label="SYS_FAN" installed={!!cables.sys_fan} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                </div>

                <div className="absolute left-5 bottom-2 right-5">
                  <p className="text-[7px] text-slate-500 mb-1">FRONT PANEL</p>
                  <div className="flex flex-wrap gap-1">
                    <Header id="pwr_sw" label="PWR_SW" installed={!!cables.pwr_sw} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                    <Header id="rst_sw" label="RESET" installed={!!cables.rst_sw} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                    <Header id="pwr_led" label="PLED" installed={!!cables.pwr_led} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                    <Header id="hdd_led" label="HD_LED" installed={!!cables.hdd_led} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                  </div>
                </div>

                <div className="absolute right-2 bottom-10 flex flex-col gap-1">
                  <Header id="usb9" label="USB 9p" installed={!!cables.usb9} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                  <Header id="audio9" label="AUDIO 9p" installed={!!cables.audio9} onDrop={onHeaderDrop} className="px-1.5 py-0.5 text-[8px]" />
                </div>
              </div>

              {/* PSU Area */}
              <div onDrop={e => onDrop(e, "psu")} onDragOver={e => e.preventDefault()}
                className={`absolute bottom-1.5 left-2 right-2 h-[14%] border-2 border-dashed flex flex-col items-center justify-center ${
                  build.psu ? "border-emerald-500 bg-white/5" : "border-orange-500/50 bg-white/5"
                }`}>
                <Power size={14} className="mb-0.5" />
                <span className="text-[10px]">{build.psu?.name || "PSU"}</span>
                <Header id="sata_p" label="SATA Power" installed={!!cables.sata_p} onDrop={onHeaderDrop}
                  className="mt-1 px-2 py-0.5 text-[8px]" />
              </div>
            </div>

            {/* Quick slots */}
            {step === "build" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["case", "motherboard", "cooler", "storage"].map(cat => (
                  <div key={cat} onDrop={e => onDrop(e, cat)} onDragOver={e => e.preventDefault()}
                    className={`rounded-lg border border-dashed p-2 text-center text-xs ${
                      build[cat] ? "border-emerald-500 bg-emerald-500/10" : "border-slate-600"
                    }`}>
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
          {/* Ringkasan Build sekarang paling atas */}
          <div className="bg-white/5 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Ringkasan Build</p>
              <span className="text-xs text-slate-500">{progress}/7</span>
            </div>
            <div className="space-y-2 text-sm">
              {requiredCats.map(cat => (
                <div key={cat} className="flex justify-between items-start gap-2">
                  <span className="text-slate-400 capitalize shrink-0">{cat}</span>
                  <span className={`text-right ${build[cat] ? "text-emerald-400" : "text-slate-600"}`}>
                    {build[cat]?.name || "—"}
                    {build[cat]?.price > 0 && (
                      <span className="block text-[11px] text-slate-500">{formatRupiah(build[cat].price)}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="font-medium">Total Estimasi</span>
              <span className="text-lg font-bold text-emerald-400">{formatRupiah(totalPrice)}</span>
            </div>
          </div>

          {/* Error compatibility */}
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

          {/* Aksi / status paling bawah */}
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
              <p className="text-emerald-300 font-medium mt-2">{formatRupiah(totalPrice)}</p>
            </div>
          )}

          {step === "wiring" && !allWired && (
            <div className="bg-white/5 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
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
          : "border-slate-600 dark:!bg-[#0c0c18]/80 text-white hover:border-slate-400"
      } ${className}`}
    >
      <span className={vertical ? "text-[8px] font-medium" : ""} style={vertical ? { writingMode: "vertical-rl" } : {}}>
        {installed ? "✓" : label}
      </span>
    </div>
  );
}