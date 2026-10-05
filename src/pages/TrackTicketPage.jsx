import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Loader2,
  Clock,
  MessageSquare,
  ArrowLeft,
  LifeBuoy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios.js";

const statusColor = {
  Baru: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Sedang Dikerjakan": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Menunggu Info": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Selesai: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Ditutup: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const TrackTicketPage = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!code.trim()) {
      toast.error("Masukkan kode tiket");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const { data } = await api.get(`/tickets/public/${code.trim()}`);
      setTicket(data.ticket);
    } catch (err) {
      setTicket(null);
      toast.error(err.response?.data?.message || "Tiket tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  // Auto search kalau ada query param
  useEffect(() => {
    if (searchParams.get("code")) {
      handleSearch();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/90 via-transparent to-purple-800/20 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 py-7">
        {/* <Link
          to="/user/tickets/create"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={16} />
          Buat Tiket Baru
        </Link> */}

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
            <Search size={26} />
          </div>
          <h1 className="text-2xl font-semibold">Lacak Tiket</h1>
          <p className="mt-1 text-sm text-gray-400">
            Masukkan kode tiket untuk melihat status dan progress
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Tempel kode tiket di sini..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Cari"}
          </button>
        </form>

        {/* Hasil */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-400" size={28} />
          </div>
        )}

        {!loading && searched && !ticket && (
          <div className="rounded-2xl border border-dashed border-white/15 py-14 text-center">
            <p className="text-gray-400">Tiket tidak ditemukan</p>
          </div>
        )}

        {!loading && ticket && (
          <div className="space-y-5">
            {/* Header Tiket */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{ticket.title}</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    {ticket.category} • {ticket.requesterName}
                  </p>
                </div>
                <span
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                    statusColor[ticket.status] || statusColor.Baru
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-300 whitespace-pre-wrap">
                {ticket.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Lokasi</p>
                  <p>{ticket.location}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pemilik PC</p>
                  <p>{ticket.pcOwner}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prioritas</p>
                  <p>{ticket.priority}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dibuat</p>
                  <p>
                    {new Date(ticket.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>

            {/* Status History */}
            {ticket.statusHistory?.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Clock size={16} />
                  Progress Status
                </h3>
                <div className="space-y-3">
                  {[...ticket.statusHistory].reverse().map((item, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                      <div>
                        <p className="font-medium">{item.status}</p>
                        {item.note && (
                          <p className="text-gray-400">{item.note}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(item.changedAt).toLocaleString("id-ID")}
                          {item.changedBy?.name && ` • ${item.changedBy.name}`}
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

              {ticket.comments?.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada komentar</p>
              ) : (
                <div className="space-y-4">
                  {ticket.comments.map((c, idx) => (
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
    </div>
  );
};

export default TrackTicketPage;