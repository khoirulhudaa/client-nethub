import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  HardDrive,
  Loader2,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  Upload,
  Wifi,
  Waves,
  Flame,
  Shield,
  Bug,
  Ghost,
  Lock,
  Brain,
  Skull,
  Network,
  Cloud,
  Server,
  Router,
  Crosshair,
  Scale,
  Sparkles,
  CircleDot,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const ACCENT_PRESETS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
];

const ELEMENT_META = {
  signal: {
    label: "Signal",
    icon: Wifi,
    color: "#eab308",
    desc: "Wireless · packet burst",
  },
  flow: {
    label: "Flow",
    icon: Waves,
    color: "#3b82f6",
    desc: "Bandwidth · throughput",
  },
  overload: {
    label: "Overload",
    icon: Flame,
    color: "#ef4444",
    desc: "DDoS · server heat",
  },
  firewall: {
    label: "Firewall",
    icon: Shield,
    color: "#06b6d4",
    desc: "Block · freeze threat",
  },
  malware: {
    label: "Malware",
    icon: Bug,
    color: "#84cc16",
    desc: "Virus · exploit",
  },
  stealth: {
    label: "Stealth",
    icon: Ghost,
    color: "#a78bfa",
    desc: "VPN · anonymous",
  },
  encryption: {
    label: "Encryption",
    icon: Lock,
    color: "#94a3b8",
    desc: "Security · harden",
  },
  ai: {
    label: "AI",
    icon: Brain,
    color: "#ec4899",
    desc: "ML · anomaly detect",
  },
  darknet: {
    label: "Darknet",
    icon: Skull,
    color: "#7c3aed",
    desc: "Hidden · blackhat",
  },
  backbone: {
    label: "Backbone",
    icon: Network,
    color: "#f97316",
    desc: "Core · infrastructure",
  },
  cloud: {
    label: "Cloud",
    icon: Cloud,
    color: "#38bdf8",
    desc: "Remote · scale out",
  },
  physical: {
    label: "Physical",
    icon: Server,
    color: "#a8a29e",
    desc: "Cable · data center",
  },
  hardware: {
    label: "Hardware",
    icon: Router,
    color: "#78716c",
    desc: "Router · solid gear",
  },
  exploit: {
    label: "Exploit",
    icon: Crosshair,
    color: "#e11d48",
    desc: "Bug · vulnerability",
  },
  balancer: {
    label: "Balancer",
    icon: Scale,
    color: "#14b8a6",
    desc: "Load distribute",
  },
  interface: {
    label: "Interface",
    icon: Sparkles,
    color: "#f472b6",
    desc: "UX · friendly layer",
  },
  protocol: {
    label: "Protocol",
    icon: CircleDot,
    color: "#6b7280",
    desc: "TCP/IP · HTTP base",
  },
};

const emptyForm = {
  name: "",
  brand: "",
  category: "Other",
  description: "",
  image: "",
  accentColor: "#3b82f6",
  isPublished: true,
  specs: [],
  element: "protocol",
  power: 100,
};

/** Kartu Hardware — gaya TCG + drag 360° */
const HardwareCard3D = ({ item, onEdit, onDelete, isAdmin }) => {
  const [rotation, setRotation] = useState({ x: -6, y: 8 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  const el = ELEMENT_META[item.element] || ELEMENT_META.protocol;
  const ElIcon = el.icon;
  const power = item.power ?? 100;
  const accent = item.accentColor || el.color || "#f59e0b";

  const clampX = (val) => Math.max(-45, Math.min(45, val));

  const onPointerDown = useCallback(
    (e) => {
      if (e.target.closest("button")) return;
      e.preventDefault();
      setIsDragging(true);
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      dragStart.current = {
        x: clientX,
        y: clientY,
        rotX: rotation.x,
        rotY: rotation.y,
      };
    },
    [rotation]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragStart.current.x;
      const dy = clientY - dragStart.current.y;
      setRotation({
        x: clampX(dragStart.current.rotX - dy * 0.35),
        y: dragStart.current.rotY + dx * 0.45,
      });
    },
    [isDragging]
  );

  const onPointerUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (!isDragging) return;
    const move = (e) => onPointerMove(e);
    const up = () => onPointerUp();
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [isDragging, onPointerMove, onPointerUp]);

  const displaySpecs = (item.specs || []).slice(0, 3);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative mx-auto h-[340px] w-full max-w-[240px] select-none [perspective:1000px]"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          className="relative h-full w-full [transform-style:preserve-3d]"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? "none" : "transform 0.4s ease-out",
          }}
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[14px] [backface-visibility:hidden]"
            style={{
              background: `linear-gradient(145deg, ${accent}, ${accent}cc 40%, #1a1a1a 100%)`,
              padding: "6px",
            //   boxShadow: `
            //     0 0 0 1px rgba(255,255,255,0.15),
            //     0 18px 40px -10px ${accent}66,
            //     0 8px 16px rgba(0,0,0,0.4)
            //   `,
            }}
          >
            <div
              className="relative flex h-full flex-col overflow-hidden rounded-[10px]"
              style={{
                background:
                  "linear-gradient(180deg, #1e1e2e 0%, #12121a 55%, #0d0d14 100%)",
              }}
            >
              {/* Holo */}
              <div
                className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                  background: `linear-gradient(
                    125deg,
                    transparent 30%,
                    ${accent}44 45%,
                    transparent 55%,
                    ${accent}22 70%,
                    transparent 80%
                  )`,
                }}
              />

              {/* Header: nama + element + HP */}
              <div
                className="relative z-10 flex items-start justify-between gap-2 px-2.5 py-1.5"
                style={{
                  background: `linear-gradient(90deg, ${accent}33, transparent)`,
                  borderBottom: `1px solid ${accent}55`,
                }}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[13px] font-bold leading-tight text-white drop-shadow">
                    {item.name}
                  </h3>
                  {item.brand && (
                    <p className="truncate text-[9px] font-medium uppercase tracking-wide text-white/60">
                      {item.brand}/{power}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm"
                      style={{ background: el.color }}
                      title={`${el.label} — ${el.desc}`}
                    >
                      <ElIcon size={13} strokeWidth={2.5} />
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-white/80">
                      {el.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Artwork */}
              <div
                className="relative z-10 mx-2 mt-2 flex flex-1 items-center justify-center overflow-hidden rounded-md"
                style={{
                  border: `2px solid ${accent}88`,
                  background: `radial-gradient(ellipse at center, ${accent}22 0%, #0a0a12 70%)`,
                  minHeight: "140px",
                }}
              >
                <span
                  className="absolute left-1.5 top-1.5 z-10 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase text-black"
                  style={{ background: accent }}
                >
                  {item.category}
                </span>

                {isAdmin && (
                  <div
                    className="absolute right-1 top-1 z-20 flex gap-0.5"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onEdit?.(item)}
                      className="rounded bg-black/50 p-1 text-gray-300 hover:bg-black/70 hover:text-white"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(item._id)}
                      className="rounded bg-black/50 p-1 text-rose-400 hover:bg-black/70"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                <img
                  src={item.image}
                  alt={item.name}
                  draggable={false}
                  className="max-h-[130px] max-w-[90%] object-contain"
                  style={{
                    filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.55))",
                  }}
                />
              </div>

              {item.description && (
                <p className="relative z-10 mx-2 my-1.5 line-clamp-2 text-[9px] italic leading-snug text-gray-400">
                  {item.description}
                </p>
              )}

              {/* Specs */}
              <div
                className="relative z-10 mx-2 mb-2 mt-auto rounded-md px-2 py-1.5"
                style={{
                  background: `${accent}18`,
                  border: `1px solid ${accent}44`,
                }}
              >
                {displaySpecs.length > 0 ? (
                  <ul className="space-y-1">
                    {displaySpecs.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2 text-[10px]"
                      >
                        <span className="flex items-center gap-1 font-semibold text-white/90">
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ background: accent }}
                          />
                          {s.key}
                        </span>
                        <span className="font-bold tabular-nums text-white">
                          {s.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-[9px] text-gray-500">
                    No specs listed
                  </p>
                )}
              </div>

              <div className="relative z-10 flex items-center justify-between px-2.5 pb-1.5 text-[8px] text-gray-600">
                <span>HW · {item.category}</span>
                <span style={{ color: accent }}>●</span>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 flex flex-col justify-end items-end overflow-hidden rounded-[14px] [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{
              background: `linear-gradient(145deg, ${accent}, #1a1a1a)`,
              padding: "6px",
              boxShadow: `0 18px 40px -10px ${accent}55`,
            }}
          >
            <div className="flex h-[80%] w-full mt-auto flex-col items-center justify-center rounded-[10px] bg-[#0d0d14] p-4 text-center">
              <span
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full text-white"
                style={{ background: el.color }}
              >
                <ElIcon size={22} strokeWidth={2.5} />
              </span>
              <p className="text-xs font-bold text-white">{item.name}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                {el.label} · HP {power}
              </p>
              {item.description && (
                <p className="mt-3 text-[10px] leading-relaxed text-gray-400">
                  {item.description}
                </p>
              )}
              <p className="mt-auto pt-4 text-[9px] text-gray-600">
                3D
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <p className="text-center text-[11px] text-gray-500">Drag untuk putar 360°</p> */}
    </div>
  );
};

const HardwareCollections = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "superAdmin";

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const [showPanel, setShowPanel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");
  const fileRef = useRef(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const url = isAdmin ? "/hardware/admin" : "/hardware";
      const params = {};
      if (!isAdmin) {
        if (category) params.category = category;
        if (search.trim()) params.search = search.trim();
      }
      const { data } = await api.get(url, { params });
      let list = data.items || [];
      if (isAdmin) {
        if (category) list = list.filter((i) => i.category === category);
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          list = list.filter(
            (i) =>
              i.name?.toLowerCase().includes(q) ||
              i.brand?.toLowerCase().includes(q)
          );
        }
      }
      setItems(list);
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [category, user?.role]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchList();
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowPanel(true);
  };

 const openEdit = (item) => {
  setEditing(item);
  setForm({
    name: item.name,
    brand: item.brand || "",
    category: item.category || "Other",
    description: item.description || "",
    image: item.image,
    accentColor: item.accentColor || "#3b82f6",
    isPublished: item.isPublished !== false,
    specs: item.specs || [],
    element: item.element || "protocol", // ← jangan lupa
    power: item.power ?? 100,            // ← jangan lupa
  });
  setShowPanel(true);
};

  const closePanel = () => {
    setShowPanel(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const addSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    setForm((f) => ({
      ...f,
      specs: [...f.specs, { key: specKey.trim(), value: specVal.trim() }],
    }));
    setSpecKey("");
    setSpecVal("");
  };

  const removeSpec = (idx) => {
    setForm((f) => ({
      ...f,
      specs: f.specs.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.image) {
      alert("Nama dan gambar wajib");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/hardware/${editing._id}`, form);
      } else {
        await api.post("/hardware", form);
      }
      closePanel();
      fetchList();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus hardware ini dari koleksi?")) return;
    try {
      await api.delete(`/hardware/${id}`);
      if (editing?._id === id) closePanel();
      fetchList();
    } catch {
      alert("Gagal menghapus");
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-accent">
            <span className="text-xs font-medium uppercase tracking-wide">
              Collection
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Hardware Collection
          </h1>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            <Plus size={16} />
            Upload Hardware
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 border-white/10 border !bg-white/5 p-4 rounded-xl">
        <form onSubmit={handleSearch} className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / brand…"
            className="input-field w-48 py-2 pl-8 text-sm sm:w-56"
          />
        </form>

        <button
          type="button"
          onClick={() => setCategory("")}
          className={`rounded-xl border px-3 py-1.5 text-sm transition ${
            !category
              ? "border-accent bg-blue-600 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-xl border px-3 py-1.5 text-sm transition ${
              category === cat
                ? "border-accent bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))} 
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 py-20 dark:border-white/10">
          <HardDrive size={36} className="text-gray-400" />
          <p className="font-medium">Belum ada hardware</p>
          <p className="text-sm text-gray-500">
            {isAdmin ? "Upload hardware pertama kamu" : "Koleksi masih kosong"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 border-x border-y border-white/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="border-b border-white/10 px-3 py-4 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n)]:border-r xl:[&:nth-child(4n)]:border-r-0"
            >
              <HardwareCard3D
                item={item}
                isAdmin={isAdmin}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Panel kanan */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          showPanel ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closePanel}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-white shadow-2xl transition-transform duration-300 dark:bg-[#12121a] ${
          showPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-md font-semibold">
            {editing ? "Edit Hardware" : "Upload Hardware"}
          </h2>
          <button
            type="button"
            onClick={closePanel}
            className="rounded-lg p-2 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-4 px-5 py-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Gambar</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-6 transition hover:border-accent/50 dark:border-white/15 dark:bg-white/5"
              >
                {form.image ? (
                  <img
                    src={form.image}
                    alt="preview"
                    className="max-h-28 object-contain"
                  />
                ) : (
                  <>
                    <Upload size={22} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Klik upload (max 2MB)
                    </span>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Nama</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field w-full"
                placeholder="Contoh: RTX 4070 Super"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Brand</label>
                <input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="input-field w-full"
                  placeholder="NVIDIA"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Kategori
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="input-field w-full"
                >
                  {(categories.length
                    ? categories
                    : [
                        "CPU",
                        "GPU",
                        "RAM",
                        "Motherboard",
                        "Storage",
                        "PSU",
                        "Case",
                        "Cooling",
                        "Network",
                        "Other",
                      ]
                  ).map((c) => (
                    <option key={c} value={c} className="text-black">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Element + Power */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Element</label>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                {Object.entries(ELEMENT_META).map(([key, meta]) => {
                  const Icon = meta.icon;
                  const active = form.element === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      title={`${meta.label} — ${meta.desc}`}
                      onClick={() => setForm({ ...form, element: key })}
                      className={`flex flex-col items-center gap-0.5 rounded-lg border p-1.5 transition ${
                        active
                          ? "scale-105 border-white/50"
                          : "border-transparent opacity-65 hover:opacity-100"
                      }`}
                      style={{
                        background: active ? `${meta.color}30` : "transparent",
                      }}
                    >
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-white"
                        style={{ background: meta.color }}
                      >
                        <Icon size={14} strokeWidth={2.5} />
                      </span>
                      <span className="max-w-full truncate text-[8px] font-medium text-gray-400">
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Power (HP)
              </label>
              <input
                type="number"
                min={1}
                max={9999}
                value={form.power}
                onChange={(e) =>
                  setForm({ ...form, power: Number(e.target.value) || 100 })
                }
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Deskripsi
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="input-field min-h-[80px] w-full resize-y"
                placeholder="Catatan singkat…"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Warna aksen kartu
              </label>
              <div className="flex flex-wrap gap-2">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, accentColor: c })}
                    className={`h-7 w-7 rounded-full border-2 transition ${
                      form.accentColor === c
                        ? "scale-110 border-white"
                        : "border-transparent"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Specs (opsional)
              </label>
              <div className="mb-2 flex gap-2">
                <input
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="input-field flex-1 text-sm"
                  placeholder="Key"
                />
                <input
                  value={specVal}
                  onChange={(e) => setSpecVal(e.target.value)}
                  className="input-field flex-1 text-sm"
                  placeholder="Value"
                />
                <button
                  type="button"
                  onClick={addSpec}
                  className="rounded-lg bg-white/10 px-3 text-sm hover:bg-white/15"
                >
                  +
                </button>
              </div>
              {form.specs.map((s, i) => (
                <div
                  key={i}
                  className="mb-1 flex items-center justify-between rounded-lg bg-black/5 px-2 py-1.5 text-xs dark:bg-white/5"
                >
                  <span>
                    {s.key}: {s.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="text-rose-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm({ ...form, isPublished: e.target.checked })
                }
                className="rounded"
              />
              Publikasikan
            </label>
          </div>

          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closePanel}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editing ? "Simpan" : "Upload"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
};

export default HardwareCollections;