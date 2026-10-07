import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Search,
  Ticket,
  X,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUSES = [
  { value: "", label: "All" },
  { value: "Baru", label: "New" },
  { value: "Sedang Dikerjakan", label: "In Progress" },
  { value: "Menunggu Info", label: "Waiting" },
  { value: "Selesai", label: "Completed" },
  { value: "Ditutup", label: "Closed" },
];

const statusStyle = {
  Baru: { dot: "bg-blue-400", badge: "text-blue-300" },
  "Sedang Dikerjakan": { dot: "bg-amber-400", badge: "text-amber-300" },
  "Menunggu Info": { dot: "bg-purple-400", badge: "text-purple-300" },
  Selesai: { dot: "bg-emerald-400", badge: "text-emerald-300" },
  Ditutup: { dot: "bg-gray-400", badge: "text-gray-300" },
};

const priorityStyle = {
  Low: { bar: "bg-gray-500", text: "text-gray-400" },
  Medium: { bar: "bg-blue-500", text: "text-blue-400" },
  High: { bar: "bg-orange-500", text: "text-orange-400" },
  Critical: { bar: "bg-red-500", text: "text-red-400" },
};

const statusLabel = (value) =>
  STATUSES.find((s) => s.value === value)?.label || value;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const TicketCard = ({ ticket }) => {
  const status = statusStyle[ticket.status] || statusStyle.Ditutup;
  const priority = priorityStyle[ticket.priority] || priorityStyle.Low;

  return (
    <Link
      to={`/tickets/${ticket._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-gray-200 bg-white border dark:border-white/10 dark:bg-[#0c0c18] p-5 pl-6 transition duration-200 hover:border-white/20 hover:brightness-[80%] hover:shadow-xl hover:shadow-black/20 active:scale-[0.99]"
    >
      {/* Priority accent */}
      <span className={`absolute inset-y-0 left-0 w-1 ${priority.bar}`} />

      {/* Top: category + status */}
      <div className="flex items-center justify-start">
        <span className="truncate text-xs text-white">
          {ticket.category}
        </span>
        ,
        <span
          className={`inline-flex shrink-0 items-center ml-1 gap-1.5 text-xs ${status.badge}`}
        >
          {statusLabel(ticket.status)}
        </span>
      </div>

      {/* Body */}
      <div className="mt-4 flex-1">
        <h3 className="line-clamp-1 text-base font-medium text-white">
          {ticket.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-400">
          {ticket.description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-gray-500">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`inline-flex items-center text-xs gap-1.5 font-medium ${priority.text}`}>
            {ticket.priority}
          </span>
          {ticket.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{ticket.location}</span>
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Clock size={12} />
          {formatDate(ticket.createdAt)}
          <ArrowUpRight
            size={14}
            className="ml-1 text-gray-600 transition group-hover:text-accent"
          />
        </div>
      </div>
    </Link>
  );
};

const TicketsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "superAdmin" || user?.role === "admin";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Fetch all tickets (filtered by search only) so status counts stay accurate.
  // Search is debounced so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = {};
        if (search.trim()) params.search = search.trim();
        const { data } = await api.get("/tickets", { params });
        setTickets(data.tickets || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const counts = useMemo(() => {
    const result = { "": tickets.length };
    tickets.forEach((t) => {
      result[t.status] = (result[t.status] || 0) + 1;
    });
    return result;
  }, [tickets]);

  const visibleTickets = useMemo(
    () => (statusFilter ? tickets.filter((t) => t.status === statusFilter) : tickets),
    [tickets, statusFilter]
  );

  return (
    <div className="mx-auto min-h-screen max-w-full border-white md:border-x md:p-6 dark:border-white/10">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:p-4 lg:flex-row lg:items-center">
       {/* Status selector (mobile) */}
        <div className="relative md:hidden">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="w-full appearance-none rounded-xl border border-transparent bg-white/5 py-2.5 pl-4 pr-10 text-sm text-white focus:border-accent focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#0c0c18]">
                {s.label} ({counts[s.value] || 0})
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>

        {/* Status tabs (tablet & desktop) */}
        <div className="-mx-1 hidden gap-x-2 overflow-x-auto p-1 [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden">
          {STATUSES.map((s) => {
            const active = statusFilter === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatusFilter(s.value)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                {s.label}
                <span
                  className={`rounded-md w-[21px] text-[11px] tabular-nums ${
                    active ? "bg-accent text-white" : "bg-white/5 text-gray-500"
                  }`}
                >
                  {counts[s.value] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative lg:ml-auto lg:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full rounded-xl border border-transparent bg-white/5 py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : visibleTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <Ticket size={26} className="text-gray-400" />
          </div>
          <p className="font-medium text-white">No tickets found</p>
          <p className="mt-1 max-w-xs text-sm text-gray-500">
            {search || statusFilter
              ? "Try a different keyword or status filter."
              : "Create a new ticket if you're experiencing issues."}
          </p>
          {!search && !statusFilter && (
            <Link
              to="/tickets/create"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Plus size={16} />
              Create Ticket
            </Link>
          )}
        </div>
      ) : (
        <div className="surface-card dark:!bg-white/5 rounded-3xl border border-white/10 p-3 md:p-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleTickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;