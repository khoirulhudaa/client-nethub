import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Monitor,
  Send,
  User,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const statusColor = {
  Baru: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Sedang Dikerjakan": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Menunggu Info": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Selesai: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Ditutup: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "superAdmin" || user?.role === "admin";

  const [ticket, setTicket] = useState(null);
  const [bestGuide, setBestGuide] = useState(null);
  const [recommendedGuides, setRecommendedGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(ticket?.status || "Baru");
  const [statusNote, setStatusNote] = useState("");

const fetchTicket = async (silent = false) => {
try {
    if (!silent) setLoading(true);

    const { data } = await api.get(`/tickets/${id}`);
    setTicket(data.ticket);
    setBestGuide(data.bestGuide);
    setRecommendedGuides(data.recommendedGuides || []);

    // Sinkronkan select dengan status terbaru
    if (data.ticket?.status) {
    setNewStatus(data.ticket.status);
    }
} catch (err) {
    console.error(err);
    toast.error("Tiket tidak ditemukan");
    navigate("/tickets");
} finally {
    if (!silent) setLoading(false);
}
};

useEffect(() => {
fetchTicket();
}, [id]);

// Kalau ticket berubah, pastikan select selalu ikut
useEffect(() => {
  if (ticket?.status) {
    setNewStatus(ticket.status);
  }
}, [ticket?.status]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);
      await api.post(`/tickets/${id}/comments`, { content: comment });
      setComment("");
      await fetchTicket();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Update status dari form sidebar (dengan catatan)
    const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
        setUpdatingStatus(true);

        const { data } = await api.patch(`/tickets/${id}/status`, {
        status: newStatus,
        note: statusNote.trim(),
        });

        // Langsung update state lokal (tanpa loading penuh)
        if (data.ticket) {
        setTicket(data.ticket);
        setNewStatus(data.ticket.status);
        } else {
        // fallback: fetch diam-diam
        await fetchTicket(true);
        }

        setStatusNote("");
        toast.success("Status berhasil diubah");
    } catch (err) {
        toast.error(err.response?.data?.message || "Gagal ubah status");
    } finally {
        setUpdatingStatus(false);
    }
    };

    // Update status dari dropdown di header (opsional, bisa dihapus kalau pakai form saja)
    const handleStatusChange = async (status) => {
    try {
        setUpdatingStatus(true);

        const { data } = await api.patch(`/tickets/${id}/status`, { status });

        if (data.ticket) {
        setTicket(data.ticket);
        setNewStatus(data.ticket.status);
        } else {
        await fetchTicket(true);
        }

        toast.success("Status diubah");
    } catch (err) {
        toast.error("Gagal mengubah status");
    } finally {
        setUpdatingStatus(false);
    }
    };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="mx-auto min-h-screen max-w-7xl md:border-x border-white dark:border-white/10 md:p-6 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-accent">
          <span className="text-xs font-semibold uppercase tracking-wider">Ticket</span>
        </div>
        <h1 className="text-xl font-medium text-white tracking-tight">Detail Ticket</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 p-5 bg-white/5 rounded-3xl">
        {/* Left - Detail */}
        <div className="lg:col-span-2 space-y-3">
          
        {/* Info Laporan */}
        <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0c0c18] p-5">
            <h2 className="mb-3 text-sm font-semibold dark:text-white">Informasi Laporan</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            <div>
                <p className="font-semibold dark:text-gray-500">Nama Pelapor</p>
                <p className="dark:text-white">
                {ticket.requesterName || ticket.createdBy?.name || "-"}
                </p>
            </div>
            <div>
                <p className="font-semibold dark:text-gray-500">Waktu Laporan</p>
                <p className="dark:text-white">
                {new Date(ticket.createdAt).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                </p>
            </div>
            <div>
                <p className="font-semibold dark:text-gray-500">Kategori</p>
                <p className="dark:text-white">{ticket.category}</p>
            </div>
            <div>
                <p className="font-semibold dark:text-gray-500">Prioritas</p>
                <p className="dark:text-white">{ticket.priority}</p>
            </div>
            <div>
                <p className="font-semibold dark:text-gray-500">Status Saat Ini</p>
                <span
                className={`inline-flex rounded-md dark:text-blue-400`}
                >
                {ticket.status}
                </span>
            </div>
            <div>
                <p className="font-semibold dark:text-gray-500">Sejak Kapan Masalah</p>
                <p className="dark:text-white">{ticket.sinceWhen}</p>
            </div>
            </div>
        </div>

          {/* Deskripsi */}
          <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0c0c18] p-5">
            <h2 className="mb-3 text-sm font-semibold dark:text-white">Deskripsi Masalah</h2>
            <p className="whitespace-pre-wrap text-sm dark:text-gray-300 leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {/* Info Perangkat */}
          <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0c0c18] p-5">
            <h2 className="mb-3 text-sm font-semibold dark:text-white">Informasi Perangkat</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="font-semibold dark:text-gray-500">Lokasi / Ruangan</p>
                <p className="dark:text-white">{ticket.location}</p>
              </div>
              <div>
                <p className="font-semibold dark:text-gray-500">Pemilik PC</p>
                <p className="dark:text-white">{ticket.pcOwner}</p>
              </div>
              <div>
                <p className="font-semibold dark:text-gray-500">Nama Komputer / IP</p>
                <p className="dark:text-white">{ticket.computerName || "-"}</p>
              </div>
              <div>
                <p className="font-semibold dark:text-gray-500">Sejak Kapan</p>
                <p className="dark:text-white">{ticket.sinceWhen}</p>
              </div>
              {ticket.anydeskNumber && (
                <>
                  <div>
                    <p className="font-semibold dark:text-gray-500">Nomor AnyDesk</p>
                    <p className="text-white font-mono">{ticket.anydeskNumber}</p>
                  </div>
                  <div>
                    <p className="font-semibold dark:text-gray-500">Password AnyDesk</p>
                    <p className="text-white font-mono">{ticket.anydeskPassword || "-"}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
            {/* Komentar */}
            <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0c0c18] p-5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold dark:text-white">
                <MessageSquare size={16} />
                Diskusi
                </h2>

                <div className="space-y-3 mb-5">
                {ticket.comments?.length === 0 && (
                    <p className="text-sm text-gray-500">Belum ada komentar</p>
                )}
                {ticket.comments?.map((c) => (
                    <div key={c._id} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-xs font-semibold text-accent">
                        {c.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{c.user?.name}</span>
                        <span className="text-xs text-gray-500">
                            {new Date(c.createdAt).toLocaleString("id-ID")}
                        </span>
                        {c.isInternal && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">
                            Internal
                            </span>
                        )}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-300">{c.content}</p>
                    </div>
                    </div>
                ))}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tulis komentar..."
                    className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={submittingComment || !comment.trim()}
                    className="rounded-xl bg-accent px-4 py-2.5 text-white transition hover:opacity-90 disabled:opacity-50"
                >
                    {submittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
                </form>
            </div>
            {/* Info Pembuat */}
            <div className="w-full rounded-2xl h-max border border-white/10 bg-white dark:bg-[#0c0c18] p-5">
                <h2 className="mb-3 text-sm font-semibold dark:text-white">Dilaporkan Oleh</h2>
                <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-sm font-semibold text-accent">
                    {ticket.createdBy?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{ticket.createdBy?.name}</p>
                    <p className="text-xs text-gray-500">{ticket.createdBy?.title || "User"}</p>
                </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right - Rekomendasi Guides */}
        <div className="space-y-3">
          {/* Best Guide */}
          {bestGuide && (
            <div className="rounded-2xl border border-accent/40 bg-accent/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-accent">
                <CheckCircle2 size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Paling Direkomendasikan
                </span>
              </div>
              <Link
                to={`/posts/${bestGuide.slug}`}
                className="block group"
              >
                <h3 className="font-medium text-white group-hover:underline">
                  {bestGuide.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                  {bestGuide.excerpt}
                </p>
                <span className="mt-2 inline-block text-xs text-accent">
                  {bestGuide.category}
                </span>
              </Link>
            </div>
          )}

          {/* Other Recommendations */}
          <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0c0c18] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold dark:text-white">
              <BookOpen size={16} />
              Guides Terkait
            </h2>

            {recommendedGuides.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada rekomendasi saat ini</p>
            ) : (
              <div className="space-y-3">
                {recommendedGuides.map((guide) => (
                  <Link
                    key={guide._id}
                    to={`/posts/${guide.slug}`}
                    className="block rounded-xl border border-white/5 bg-black/20 p-3 transition hover:bg-black/40"
                  >
                    <h4 className="text-sm font-medium text-white line-clamp-1">
                      {guide.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-500">{guide.category}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0c0c18] p-5">
                <h2 className="mb-3 text-sm font-semibold dark:text-white">Update Status</h2>

                <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="cursor-pointer hover:brightness-90 mb-3 w-full rounded-xl border border-white/10 bg-slate-200 dark:bg-[#0c0c18] px-3 py-2.5 text-sm dark:text-white"
                >
                <option value="Baru" className="text-white bg-[#0c0c18]">Baru</option>
                <option value="Sedang Dikerjakan" className="text-white bg-[#0c0c18]">Sedang Dikerjakan</option>
                <option value="Menunggu Info" className="text-white bg-[#0c0c18]">Menunggu Info</option>
                <option value="Selesai" className="text-white bg-[#0c0c18]">Selesai</option>
                <option value="Ditutup" className="text-white bg-[#0c0c18]">Ditutup</option>
                </select>

                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={2}
                  placeholder="Catatan progress (opsional)..."
                  className="mb-3 w-full rounded-xl border border-white/10 bg-slate-200 dark:bg-[#0c0c18] px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-gray-500 resize-none"
                />

                <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
                >
                {updatingStatus ? "Menyimpan..." : "Simpan Status"}
                </button>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;