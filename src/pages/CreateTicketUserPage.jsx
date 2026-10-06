import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  LifeBuoy,
  Send,
  Copy,
  Check,
  Search,
  Clock,
  MessageSquare,
  Monitor,
  RefreshCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

const statusColor = {
  Baru: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Sedang Dikerjakan": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Menunggu Info": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Selesai: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Ditutup: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const sinceOptions = [
  "Baru saja",
  "Hari ini",
  "Beberapa hari",
  "Minggu ini",
  "Lebih dari seminggu",
];

// Lekukan sobekan di sisi atas & bawah, tepat di garis pemisah badan tiket dan stub (kanan).
// Lebar stub diatur lewat CSS variable --stub. Di layar kecil stub pindah ke bawah tanpa lekukan.
const ticketCss = `
@media (min-width: 1024px) {
  .ticket-cut {
    -webkit-mask:
      radial-gradient(circle 14px at calc(100% - var(--stub)) 0, #0000 98%, #000),
      radial-gradient(circle 14px at calc(100% - var(--stub)) 100%, #0000 98%, #000);
    -webkit-mask-composite: source-in;
    mask:
      radial-gradient(circle 14px at calc(100% - var(--stub)) 0, #0000 98%, #000),
      radial-gradient(circle 14px at calc(100% - var(--stub)) 100%, #0000 98%, #000);
    mask-composite: intersect;
  }
}
`;

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none";

// Barcode dekoratif dari kode tiket
const Barcode = ({ value = "", height = 40 }) => {
  const bars = useMemo(() => {
    const out = [];
    for (let i = 0; i < 70; i++) {
      const c = value.charCodeAt(i % Math.max(value.length, 1)) || 7;
      out.push({ w: 1 + ((c + i) % 3), gap: 1 + ((c * (i + 1)) % 2) });
    }
    return out;
  }, [value]);

  return (
    <div className="flex items-stretch overflow-hidden" style={{ height }} aria-hidden="true">
      {bars.map((b, i) => (
        <span key={i} className="bg-white/80" style={{ width: b.w, marginRight: b.gap }} />
      ))}
    </div>
  );
};

// Pembungkus tiket landscape: badan di kiri, stub di kanan (di mobile stub di bawah)
const TicketShell = ({ stubWidth = "16rem", band, children, stub }) => (
  <div className="drop-shadow-2xl w-full">
    <div
      className="ticket-cut w-[80vw] flex flex-col overflow-hidden rounded-lg md:rounded-2xl border border-white/40 bg-[#12121a9a] lg:flex-row"
      style={{ "--stub": stubWidth }}
    >
      <div className="min-w-0 flex-1">
        {band && (
          <div className="flex items-center justify-between gap-3 bg-blue-500/15 px-2.5 md:px-6 py-3">
            <span className="text-sm font-semibold text-blue-400">Tiket Helpdesk IT</span>
            <span className="font-mono text-xs text-gray-400">{band}</span>
          </div>
        )}
        <div className="p-3 md:p-6">{children}</div>
      </div>
      <div className="flex flex-col justify-between gap-6 border-t-2 border-dashed border-white/40 bg-white/[0.03] p-3 md:p-6 lg:w-[var(--stub)] lg:shrink-0 lg:border-l-2 lg:border-t-0">
        {stub}
      </div>
    </div>
  </div>
);

// Field bergaya tiket: label kecil + isian dengan garis putus-putus di bawahnya
const fieldCls =
  "w-full border-x-0 border-t-0 border-b-2 border-dashed border-white/40 bg-transparent px-0 py-1.5 text-xs text-slate-300 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none";

const Label = ({ children, required }) => (
  <label className="mb-0.5 block text-sm font-semibold text-white">
    {children}
    {required && <span className="ml-0.5 text-red-400">*</span>}
  </label>
);

const CreateTicketUserPage = () => {
  const { user } = useAuth();

  // Tab: "create" | "track"
  const [activeTab, setActiveTab] = useState("create");

  const [options, setOptions] = useState({ categories: [], priorities: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState("");
  const [copied, setCopied] = useState(false);

  // Track Ticket
  const [trackCode, setTrackCode] = useState("");
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    sinceWhen: "Baru saja",
    location: "",
    pcOwner: user?.name || "",
    computerName: "",
    anydeskNumber: "",
    anydeskPassword: "",
    requesterName: "",
    priority: "Medium",
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data } = await api.get("/tickets/options");
        setOptions(data);
        if (data.categories?.length) {
          setForm((prev) => ({ ...prev, category: data.categories[0] }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(createdTicketId);
      setCopied(true);
      toast.success("Kode tiket berhasil disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      !form.pcOwner.trim() ||
      !form.requesterName.trim()
    ) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post("/tickets", form);

      setCreatedTicketId(data.ticket._id);
      setShowSuccessModal(true);

      setForm({
        title: "",
        description: "",
        category: options.categories[0] || "",
        sinceWhen: "Baru saja",
        location: "",
        pcOwner: "",
        computerName: "",
        anydeskNumber: "",
        anydeskPassword: "",
        requesterName: "",
        priority: "Medium",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal membuat tiket");
    } finally {
      setSubmitting(false);
    }
  };

  // codeOverride dipakai tombol "Lacak Sekarang" agar tidak bergantung pada state yang belum ter-update
  const handleTrack = async (e, codeOverride) => {
    e?.preventDefault?.();
    if (trackLoading) return;

    const code = (codeOverride ?? trackCode).trim();
    if (!code) {
      toast.error("Masukkan kode tiket");
      return;
    }

    try {
      setTrackLoading(true);
      setHasSearched(true);
      const { data } = await api.get(`/tickets/public/${code}`);
      setTrackedTicket(data.ticket);
    } catch (err) {
      setTrackedTicket(null);
      toast.error(err.response?.data?.message || "Tiket tidak ditemukan");
    } finally {
      setTrackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  const panel = "rounded-2xl border border-white/10 bg-white/[0.03] p-5";

  return (
    <div className="relative h-screen bg-[#0a0a12] overflow-y-hidden overflow-x-hidden text-white">
      <style>{ticketCss}</style>
      <img
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        src="/sidebar.png" alt="wallpaper-sidebar" className={`rotate-[14deg] scale-[2] w-full h-screen dark:flex hidden object-cover absolute z-0 top-0 opacity-5 left-0`} 
      />
      
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-blue-950/90 via-transparent to-purple-800/20" />

      <div className="relative mx-auto w-[97vw] h-screen flex flex-col items-center justify-center px-4 py-6 md:!max-w-7xl">
        {/* Header */}
        {/* <div className="mb-6 gap-2.5 md:text-left flex items-center w-max">
          <Link to="/login" className="cursor-pointer active:scale-[0.99] hover:brightness-90">
            <div className="mx-auto border border-white/20 hidden md:flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
              <LifeBuoy size={26} />
            </div>
          </Link>
          <div className="relative top-[-3px]">
            <h1 className="text-lg font-semibold tracking-tight">TEXNET TICKET</h1>
            <p className="text-xs md:text-sm text-gray-400">
              Buat tiket baru atau lacak progress tiket Anda
            </p>
          </div>
        </div> */}

        {/* Tabs */}
        <div className="w-[80vw] mb-6 flex gap-x-1.5 rounded-xl md:rounded-[20px] border border-white/40 bg-white/[0.03] p-2">
          {[
            { key: "create", label: "Buat Tiket" },
            { key: "track", label: "Lacak Tiket" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 border border-white/20 rounded-lg md:rounded-[16px] py-2 md:py-3 text-sm font-medium transition ${
                activeTab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ==================== TAB: BUAT TIKET ==================== */}
        {activeTab === "create" && (
          <form onSubmit={handleSubmit}>
            <TicketShell
              stubWidth="19rem"
              band="Tiket baru"
              stub={
                <>
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                      <LifeBuoy size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Siap dikirim?</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-400">
                        Kode tiket dibuat otomatis setelah tiket terkirim. Simpan kodenya untuk
                        melacak progress.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 relative top-[-7.2px]">
                    <div className="w-full flex items-center justify-center">
                      <Barcode value="TEXNET" height={40} />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Kirim Tiket
                        </>
                      )}
                    </button>
                  </div>
                </>
              }
            >
              <div className="space-y-6">
                {/* Judul (seperti judul tiket) */}
                <div>
                  <Label required>Judul masalah</Label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Contoh: Tidak bisa konek WiFi di Ruang Meeting"
                    className={`${fieldCls} font-semibold tracking-tight`}
                    required
                  />
                </div>

                {/* Kategori (kiri) + prioritas (kanan) */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label required>Kategori</Label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className={`${fieldCls} text-md font-semibold`}
                    >
                      {options.categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#0c0c18] text-xs">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-40">
                    <Label>Prioritas</Label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className={`${fieldCls} text-md font-semibold sm:text-left`}
                    >
                      {options.priorities.map((p) => (
                        <option key={p} value={p} className="bg-[#0c0c18] text-xs">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* "Rute": pelapor -> lokasi */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <Label required>Pelapor</Label>
                    <input
                      type="text"
                      name="requesterName"
                      value={form.requesterName}
                      onChange={handleChange}
                      placeholder="Nama - Jabatan"
                      className={`${fieldCls} text-xs font-medium`}
                      required
                    />
                  </div>
                  <div className="relative top-4 hidden items-center gap-2 pb-2 text-blue-400 sm:flex sm:w-20">
                    <span className="h-0 flex-1 border-t-2 border-dotted border-current opacity-50" />
                    <Monitor size={18} />
                    <span className="h-0 flex-1 border-t-2 border-dotted border-current opacity-50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label required>Lokasi / ruangan</Label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Contoh: Ruang IT Lt. 2"
                      className={`${fieldCls} text-xs font-medium sm:text-left`}
                      required
                    />
                  </div>
                </div>

                {/* Garis sobekan */}
                {/* <div className="border-t-2 border-dashed border-white" /> */}

                {/* Detail perangkat, tersebar seperti grid di tiket */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                  <div>
                    <Label required>Pemilik PC</Label>
                    <input
                      type="text"
                      name="pcOwner"
                      value={form.pcOwner}
                      onChange={handleChange}
                      className={fieldCls}
                      required
                    />
                  </div>
                  <div>
                    <Label required>Sejak kapan</Label>
                    <select
                      name="sinceWhen"
                      value={form.sinceWhen}
                      onChange={handleChange}
                      className={fieldCls}
                    >
                      {sinceOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#0c0c18]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-4 gap-y-5">
                  <div>
                    <Label>Nama komputer / IP</Label>
                    <input
                      type="text"
                      name="computerName"
                      value={form.computerName}
                      onChange={handleChange}
                      placeholder="PC-HRD-01 / 192.168.1.45"
                      className={fieldCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4">
                  <div>
                    <Label>Nomor AnyDesk (opsional)</Label>
                    <input
                      type="text"
                      name="anydeskNumber"
                      value={form.anydeskNumber}
                      onChange={handleChange}
                      placeholder="123 456 789"
                      className={`${fieldCls} font-mono`}
                    />
                  </div>
                  <div>
                    <Label>Password AnyDesk (opsional)</Label>
                    <input
                      type="text"
                      name="anydeskPassword"
                      value={form.anydeskPassword}
                      onChange={handleChange}
                      placeholder="Password sementara"
                      className={`${fieldCls} font-mono`}
                    />
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <Label required>Deskripsi masalah</Label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Jelaskan gejala, apa yang sudah dicoba, pesan error..."
                    className="mt-1 w-full resize-none rounded-xl border-2 border-dashed border-white/40 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-slate-300 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </TicketShell>
          </form>
        )}

        {/* ==================== TAB: LACAK TIKET ==================== */}
        {activeTab === "track" && (
          <div className="space-y-5">
            <form onSubmit={handleTrack} className={panel}>
              <label className="mb-2 block text-sm font-medium text-gray-300">Kode Tiket</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  placeholder="Tempel kode tiket di sini..."
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="submit"
                  disabled={trackLoading}
                  aria-label="Cari tiket"
                  className="flex w-[48px] items-center justify-center rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {trackLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleTrack()}
                  disabled={trackLoading}
                  aria-label="Muat ulang"
                  className="flex w-[48px] items-center justify-center rounded-xl bg-green-600 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-60"
                >
                  {trackLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                </button>
              </div>
            </form>

            {trackLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-400" size={28} />
              </div>
            )}

            {!trackLoading && hasSearched && !trackedTicket && (
              <div className="rounded-2xl border border-dashed border-white/40 py-12 text-center text-gray-400">
                Tiket tidak ditemukan
              </div>
            )}

            {!trackLoading && trackedTicket && (
              <div className="space-y-4">
                {/* ===== TIKET ===== */}
                <TicketShell
                  stubWidth="16rem"
                  band={`#${String(trackedTicket._id).slice(-8).toUpperCase()}`}
                  stub={
                    <>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Status</p>
                        <span
                          className={`mt-1.5 inline-flex rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                            statusColor[trackedTicket.status] || statusColor.Baru
                          }`}
                        >
                          {trackedTicket.status}
                        </span>
                      </div>
                      <div>
                        <Barcode value={String(trackedTicket._id)} height={40} />
                        <p className="mt-2 select-all break-all font-mono text-[11px] text-blue-400">
                          {trackedTicket._id}
                        </p>
                      </div>
                    </>
                  }
                >
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">{trackedTicket.title}</h2>
                      <p className="mt-1 text-sm text-gray-400">{trackedTicket.category}</p>
                    </div>

                    {/* "Rute": pelapor -> lokasi */}
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500">Pelapor</p>
                        <p className="truncate text-xs font-medium">{trackedTicket.requesterName}</p>
                      </div>
                      <div className="flex flex-1 items-center gap-2 text-blue-400">
                        <span className="h-0 flex-1 border-t-2 border-dotted border-current opacity-50" />
                        <Monitor size={18} />
                        <span className="h-0 flex-1 border-t-2 border-dotted border-current opacity-50" />
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="text-xs font-semibold text-gray-500">Lokasi</p>
                        <p className="truncate text-xs font-medium">{trackedTicket.location}</p>
                      </div>
                    </div>

                    <div className="border-t-2 border-dashed border-white/40" />

                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                      {trackedTicket.description}
                    </p>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Pemilik PC</p>
                        <p className="mt-0.5">{trackedTicket.pcOwner}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Prioritas</p>
                        <p className="mt-0.5">{trackedTicket.priority}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Dibuat</p>
                        <p className="mt-0.5">
                          {new Date(trackedTicket.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                </TicketShell>

                {/* Progress Status */}
                {trackedTicket.statusHistory?.length > 0 && (
                  <div className={panel}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                      <Clock size={16} />
                      Progress Status
                    </h3>
                    <div className="space-y-3">
                      {[...trackedTicket.statusHistory].reverse().map((item, idx) => (
                        <div key={idx} className="flex gap-3 text-sm">
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                          <div>
                            <p className="font-medium">{item.status}</p>
                            {item.note && <p className="text-gray-400">{item.note}</p>}
                            <p className="text-xs text-gray-500">
                              {new Date(item.changedAt).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Komentar */}
                <div className={panel}>
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                    <MessageSquare size={16} />
                    Komentar / Update
                  </h3>

                  {!trackedTicket.comments?.length ? (
                    <p className="text-sm text-gray-500">Belum ada komentar</p>
                  ) : (
                    <div className="space-y-4">
                      {trackedTicket.comments.map((c, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
                            {c.user?.name?.[0]?.toUpperCase() || "A"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{c.user?.name || "Admin"}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(c.createdAt).toLocaleString("id-ID")}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-300">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* <p className="mt-8 text-center text-xs text-gray-600">TEXNet Support • Bantuan IT Internal</p> */}
      </div>

      {/* ===== SUCCESS MODAL (tiket dengan stub berisi kode) ===== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto">
            <TicketShell
              stubWidth="15rem"
              band="Tiket terkirim"
              stub={
                <>
                  <p className="text-xs font-semibold text-gray-500">Kode Tiket Anda</p>
                  <div>
                    <Barcode value={createdTicketId} height={40} />
                    <p className="mt-2 select-all break-all font-mono text-xs text-blue-300">
                      {createdTicketId}
                    </p>
                  </div>
                </>
              }
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-md font-semibold">Tiket Berhasil Dikirim!</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Simpan kode tiket pada stub untuk melacak progress.
                </p>

                <button
                  onClick={handleCopy}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 active:scale-[0.99]"
                >
                  {copied ? (
                    <>
                      <Check size={16} /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Salin Kode Tiket
                    </>
                  )}
                </button>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setTrackCode(createdTicketId);
                      setActiveTab("track");
                      setShowSuccessModal(false);
                      handleTrack(null, createdTicketId);
                    }}
                    className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-gray-300 hover:bg-white/5 active:scale-[0.99]"
                  >
                    Lacak Sekarang
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-gray-300 hover:bg-white/5 active:scale-[0.99]"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </TicketShell>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicketUserPage;