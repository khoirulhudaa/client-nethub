import { useEffect, useState } from "react";
import {
  Loader2,
  LifeBuoy,
  Send,
  Copy,
  Check,
  Search,
  Clock,
  MessageSquare,
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

  const sinceOptions = [
    "Baru saja",
    "Hari ini",
    "Beberapa hari",
    "Minggu ini",
    "Lebih dari seminggu",
  ];

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

      // Reset form
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

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (trackLoading) return; // cegah double-click
    if (!trackCode.trim()) {
      toast.error("Masukkan kode tiket");
      return;
    }

    try {
      setTrackLoading(true);
      setHasSearched(true);
      const { data } = await api.get(`/tickets/public/${trackCode.trim()}`);
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

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/90 via-transparent to-purple-800/20 pointer-events-none" />

      <div className="relative mx-auto w-[97vw] md:!max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
            <LifeBuoy size={26} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            TEXNET TICKET
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Buat tiket baru atau lacak progress tiket Anda
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-xl gap-x-1.5 border border-white/10 bg-white/[0.03] p-2">
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex-1 rounded-lg py-3 text-sm font-medium transition ${
              activeTab === "create"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            Buat Tiket
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`flex-1 rounded-lg py-3 text-sm font-medium transition ${
              activeTab === "track"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            Lacak Tiket
          </button>
        </div>

        {/* ==================== TAB: BUAT TIKET ==================== */}
        {activeTab === "create" && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
          >
            <div className="space-y-5">
              {/* Nama Pelapor */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Nama & Jabatan Anda <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="requesterName"
                  value={form.requesterName}
                  onChange={handleChange}
                  placeholder="Contoh: Budi Santoso - Staff HRD"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Judul */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Judul Masalah <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Contoh: Tidak bisa konek WiFi di Ruang Meeting"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Deskripsi Lengkap <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Jelaskan gejala, apa yang sudah dicoba, pesan error..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Kategori & Prioritas */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Kategori <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {options.categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0c0c18]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Prioritas
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {options.priorities.map((p) => (
                      <option key={p} value={p} className="bg-[#0c0c18]">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sejak Kapan */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Sejak Kapan <span className="text-red-400">*</span>
                </label>
                <select
                  name="sinceWhen"
                  value={form.sinceWhen}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {sinceOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0c0c18]">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lokasi & Pemilik PC */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Lokasi / Ruangan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Contoh: Ruang IT Lantai 2"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Pemilik PC / User <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="pcOwner"
                    value={form.pcOwner}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Nama Komputer */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Nama Komputer / IP
                </label>
                <input
                  type="text"
                  name="computerName"
                  value={form.computerName}
                  onChange={handleChange}
                  placeholder="Contoh: PC-HRD-01 atau 192.168.1.45"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* AnyDesk */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="mb-3 text-sm font-medium text-gray-300">
                  Remote Access <span className="text-gray-500">(Opsional)</span>
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-500">
                      Nomor AnyDesk
                    </label>
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
                    <label className="mb-1.5 block text-xs text-gray-500">
                      Password AnyDesk
                    </label>
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

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
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
          </form>
        )}

        {/* ==================== TAB: LACAK TIKET ==================== */}
        {activeTab === "track" && (
          <div className="space-y-5">
            <form
              onSubmit={handleTrack}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Kode Tiket
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  placeholder="Tempel kode tiket di sini..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={trackLoading}
                  className="rounded-xl bg-blue-600 w-[48px] flex items-center justify-center text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {trackLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Search size={18} />
                  )}
                </button>
              <button
                type="button"
                onClick={handleTrack}
                disabled={trackLoading}
                className="rounded-xl bg-green-600 w-[48px] flex items-center justify-center text-sm font-medium text-white hover:bg-green-500 disabled:opacity-60"
              >
                {trackLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCcw size={18} />
                )}
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
                {/* Info Tiket */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {trackedTicket.title}
                      </h2>
                      <p className="mt-1 text-sm text-gray-400">
                        {trackedTicket.category} • {trackedTicket.requesterName}
                      </p>
                    </div>
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                        statusColor[trackedTicket.status] || statusColor.Baru
                      }`}
                    >
                      {trackedTicket.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-gray-300 whitespace-pre-wrap">
                    {trackedTicket.description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Lokasi</p>
                      <p>{trackedTicket.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pemilik PC</p>
                      <p>{trackedTicket.pcOwner}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prioritas</p>
                      <p>{trackedTicket.priority}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Dibuat</p>
                      <p>
                        {new Date(trackedTicket.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Status */}
                {trackedTicket.statusHistory?.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                      <Clock size={16} />
                      Progress Status
                    </h3>
                    <div className="space-y-3">
                      {[...trackedTicket.statusHistory]
                        .reverse()
                        .map((item, idx) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                            <div>
                              <p className="font-medium">{item.status}</p>
                              {item.note && (
                                <p className="text-gray-400">{item.note}</p>
                              )}
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
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                    <MessageSquare size={16} />
                    Komentar / Update
                  </h3>

                  {trackedTicket.comments?.length === 0 ? (
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
                              <span className="text-sm font-medium">
                                {c.user?.name || "Admin"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(c.createdAt).toLocaleString("id-ID")}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-300">
                              {c.content}
                            </p>
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

        <p className="mt-8 text-center text-xs text-gray-600">
          TEXNet Support • Bantuan IT Internal
        </p>
      </div>

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                <Check size={28} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold">Tiket Berhasil Dikirim!</h3>
              <p className="mt-2 text-sm text-gray-400">
                Simpan kode tiket di bawah ini untuk melacak progress.
              </p>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="mb-1 text-xs text-gray-500">Kode Tiket Anda</p>
                <p className="break-all font-mono text-sm text-blue-300 select-all">
                  {createdTicketId}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="mt-4 flex w-full active:scale-[0.99] items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
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
                    // Auto search
                    setTimeout(() => {
                      setTrackCode(createdTicketId);
                      handleTrack({ preventDefault: () => {} });
                    }, 100);
                  }}
                  className="flex-1 active:scale-[0.99] rounded-xl border border-white/10 py-2.5 text-sm text-gray-300 hover:bg-white/5"
                >
                  Lacak Sekarang
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 active:scale-[0.99] rounded-xl border border-white/10 py-2.5 text-sm text-gray-300 hover:bg-white/5"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicketUserPage;