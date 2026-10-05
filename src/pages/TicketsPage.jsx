import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  Filter,
  Loader2,
  Plus,
  Search,
  Ticket,
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

const priorityColor = {
  Low: "text-gray-400",
  Medium: "text-blue-400",
  High: "text-orange-400",
  Critical: "text-red-400",
};

const TicketsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "superAdmin" || user?.role === "admin";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get("/tickets", { params });
      setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div className="mx-auto min-h-screen max-w-full md:border-x border-white dark:border-white/10 md:p-6 p-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <span className="text-xs font-semibold uppercase tracking-wider">Support</span>
          </div>
          <h1 className="text-xl font-medium tracking-tight text-white">
            {isAdmin ? "Semua Tiket" : "Tiket Saya"}
          </h1>
        </div>

        <Link
          to="/tickets/create"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={16} />
          Buat Tiket
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau deskripsi..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
        >
          <option value="" className="bg-[#0c0c18]">Semua Status</option>
          <option value="Baru" className="bg-[#0c0c18]">Baru</option>
          <option value="Sedang Dikerjakan" className="bg-[#0c0c18]">Sedang Dikerjakan</option>
          <option value="Menunggu Info" className="bg-[#0c0c18]">Menunggu Info</option>
          <option value="Selesai" className="bg-[#0c0c18]">Selesai</option>
          <option value="Ditutup" className="bg-[#0c0c18]">Ditutup</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <Ticket size={40} className="mb-3 text-gray-500" />
          <p className="font-medium text-white">Belum ada tiket</p>
          <p className="mt-1 text-sm text-gray-500">Buat tiket baru jika mengalami masalah</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              to={`/tickets/${ticket._id}`}
              className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/[0.07]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-white">{ticket.title}</h3>
                    <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${statusColor[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-gray-400">{ticket.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>{ticket.category}</span>
                    <span>•</span>
                    <span>{ticket.location}</span>
                    <span>•</span>
                    <span className={priorityColor[ticket.priority]}>{ticket.priority}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                  <Clock size={13} />
                  {new Date(ticket.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;