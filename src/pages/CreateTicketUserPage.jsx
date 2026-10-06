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

// Lekukan sobekan di sisi kiri & kanan, tepat di atas "stub" di bagian bawah tiket.
// Tinggi stub diatur lewat CSS variable --stub (harus sama dengan tinggi stub-nya).
const ticketCss = `
.ticket-cut {
  -webkit-mask:
    radial-gradient(circle 14px at 0 calc(100% - var(--stub)), #0000 98%, #000),
    radial-gradient(circle 14px at 100% calc(100% - var(--stub)), #0000 98%, #000);
  -webkit-mask-composite: source-in;
  mask:
    radial-gradient(circle 14px at 0 calc(100% - var(--stub)), #0000 98%, #000),
    radial-gradient(circle 14px at 100% calc(100% - var(--stub)), #0000 98%, #000);
  mask-composite: intersect;
}
`;

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none";

// Barcode dekoratif dari kode tiket
const Barcode = ({ value = "", height = 40 }) => {
  const bars = useMemo(() => {
    const out = [];
    for (let i = 0; i < 44; i++) {
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

// Pembungkus bentuk tiket: badan di atas, stub (tinggi tetap) di bawah
const TicketShell = ({ stubHeight = "6rem", band, children, stub }) => (
  <div className="drop-shadow-2xl">
    <div
      className="ticket-cut overflow-hidden rounded-3xl border border-white/10 bg-[#12121a]"
      style={{ "--stub": stubHeight }}
    >
      {band && (
        <div className="flex items-center justify-between gap-3 bg-blue-500/15 px-6 py-3">
          <span className="text-sm font-semibold text-blue-400">Tiket Helpdesk IT</span>
          <span className="font-mono text-xs text-gray-400">{band}</span>
        </div>
      )}
      <div className="p-6">{children}</div>
      <div
        className="border-t-2 border-dashed border-white/15 bg-white/[0.03] px-6 py-4"
        style={{ height: stubHeight }}
      >
        {stub}
      </div>
    </div>
  </div>
);

const Label = ({ children, required }) => (
  <label className="mb-1.5 block text-sm font-medium text-gray-300">
    {children} {required && <span className="text-red-400">*</span>}
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
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <style>{ticketCss}</style>
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-blue-950/90 via-transparent to-purple-800/20" />

      <div className="relative mx-auto w-[97vw] px-4 py-8 sm:py-12 md:!max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
            <LifeBuoy size={26} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">TEXNET TICKET</h1>
          <p className="mt-1 text-sm text-gray-400">
            Buat tiket baru atau lacak progress tiket Anda
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-x-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-2">
          {[
            { key: "create", label: "Buat Tiket" },
            { key: "track", label: "Lacak Tiket" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 rounded-lg py-3 text-sm font-medium transition ${
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
              stubHeight="6rem"
              band="Tiket baru"
              stub={
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-full w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Mengirim Tiket...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Kirim Tiket
                    </>
                  )}
                </button>
              }
            >
              <div className="space-y-5">
                {/* Pelapor */}
                <div>
                  <Label required>Nama & Jabatan Anda</Label>
                  <input
                    type="text"
                    name="requesterName"
                    value={form.requesterName}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso - Staff HRD"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <Label required>Judul Masalah</Label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Contoh: Tidak bisa konek WiFi di Ruang Meeting"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <Label required>Deskripsi Lengkap</Label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Jelaskan gejala, apa yang sudah dicoba, pesan error..."
                    className={`${inputCls} resize-none`}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label required>Kategori</Label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className={inputCls}
                    >
                      {options.categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#0c0c18]">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Prioritas</Label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className={inputCls}
                    >
                      {options.priorities.map((p) => (
                        <option key={p} value={p} className="bg-[#0c0c18]">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label required>Sejak Kapan</Label>
                  <select
                    name="sinceWhen"
                    value={form.sinceWhen}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    {sinceOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0c0c18]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Garis sobekan pemisah bagian perangkat */}
                <div className="flex items-center gap-3 pt-1 text-blue-400">
                  <Monitor size={16} />
                  <span className="text-sm font-medium">Perangkat</span>
                  <span className="flex-1 border-t-2 border-dashed border-white/15" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label required>Lokasi / Ruangan</Label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Contoh: Ruang IT Lantai 2"
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <Label required>Pemilik PC / User</Label>
                    <input
                      type="text"
                      name="pcOwner"
                      value={form.pcOwner}
                      onChange={handleChange}
                      className={inputCls}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Nama Komputer / IP</Label>
                  <input
                    type="text"
                    name="computerName"
                    value={form.computerName}
                    onChange={handleChange}
                    placeholder="Contoh: PC-HRD-01 atau 192.168.1.45"
                    className={inputCls}
                  />
                </div>

                {/* AnyDesk */}
                <div className="rounded-2xl border-2 border-dashed border-white/15 p-4">
                  <p className="mb-3 text-sm font-medium text-gray-300">
                    Remote Access <span className="text-gray-500">(Opsional)</span>
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs text-gray-500">Nomor AnyDesk</label>
                      <input
                        type="text"
                        name="anydeskNumber"
                        value={form.anydeskNumber}
                        onChange={handleChange}
                        placeholder="123 456 789"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs text-gray-500">Password AnyDesk</label>
                      <input
                        type="text"
                        name="anydeskPassword"
                        value={form.anydeskPassword}
                        onChange={handleChange}
                        placeholder="Password sementara"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
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
              <div className="rounded-2xl border border-dashed border-white/15 py-12 text-center text-gray-400">
                Tiket tidak ditemukan
              </div>
            )}

            {!trackLoading && trackedTicket && (
              <div className="space-y-4">
                {/* ===== TIKET ===== */}
                <TicketShell
                  stubHeight="8.5rem"
                  band={`#${String(trackedTicket._id).slice(-8).toUpperCase()}`}
                  stub={
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-gray-500">Status</span>
                        <span
                          className={`rounded-lg border px-3 py-1 text-sm font-semibold ${
                            statusColor[trackedTicket.status] || statusColor.Baru
                          }`}
                        >
                          {trackedTicket.status}
                        </span>
                      </div>
                      <div>
                        <Barcode value={String(trackedTicket._id)} height={32} />
                        <p className="mt-1.5 select-all break-all font-mono text-[11px] text-blue-400">
                          {trackedTicket._id}
                        </p>
                      </div>
                    </div>
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
                        <p className="truncate text-base font-medium">{trackedTicket.requesterName}</p>
                      </div>
                      <div className="flex flex-1 items-center gap-2 text-blue-400">
                        <span className="h-0 flex-1 border-t-2 border-dotted border-current opacity-50" />
                        <Monitor size={18} />
                        <span className="h-0 flex-1 border-t-2 border-dotted border-current opacity-50" />
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="text-xs font-semibold text-gray-500">Lokasi</p>
                        <p className="truncate text-base font-medium">{trackedTicket.location}</p>
                      </div>
                    </div>

                    <div className="border-t-2 border-dashed border-white/15" />

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

        <p className="mt-8 text-center text-xs text-gray-600">TEXNet Support • Bantuan IT Internal</p>
      </div>

      {/* ===== SUCCESS MODAL (tiket dengan stub berisi kode) ===== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative w-full max-w-md">
            <TicketShell
              stubHeight="8rem"
              band="Tiket terkirim"
              stub={
                <div className="flex h-full flex-col justify-between">
                  <p className="text-xs font-semibold text-gray-500">Kode Tiket Anda</p>
                  <div>
                    <Barcode value={createdTicketId} height={32} />
                    <p className="mt-1.5 select-all break-all font-mono text-xs text-blue-300">
                      {createdTicketId}
                    </p>
                  </div>
                </div>
              }
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold">Tiket Berhasil Dikirim!</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Simpan kode tiket di bawah ini untuk melacak progress.
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