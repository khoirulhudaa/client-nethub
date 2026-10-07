import { useEffect, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  LogIn,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const ACTION_LABELS = {
  login: { label: "Login", icon: LogIn, color: "text-emerald-400", bg: "bg-emerald-500/15", ring: "ring-emerald-500/30" },
  logout: { label: "Logout", icon: LogOut, color: "text-slate-400", bg: "bg-slate-500/15", ring: "ring-slate-500/30" },
  create_post: { label: "Create Guide", icon: Plus, color: "text-blue-400", bg: "bg-blue-500/15", ring: "ring-blue-500/30" },
  update_post: { label: "Update Guide", icon: Pencil, color: "text-amber-400", bg: "bg-amber-500/15", ring: "ring-amber-500/30" },
  delete_post: { label: "Delete Guide", icon: Trash2, color: "text-red-400", bg: "bg-red-500/15", ring: "ring-red-500/30" },
  like: { label: "Like", icon: ThumbsUp, color: "text-pink-400", bg: "bg-pink-500/15", ring: "ring-pink-500/30" },
  unlike: { label: "Unlike", icon: ThumbsUp, color: "text-gray-400", bg: "bg-gray-500/15", ring: "ring-gray-500/30" },
  comment: { label: "Comment", icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/15", ring: "ring-indigo-500/30" },
  delete_comment: { label: "Delete Comment", icon: Trash2, color: "text-red-400", bg: "bg-red-500/15", ring: "ring-red-500/30" },
};

const ActivityLog = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ activities: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (actionFilter) params.action = actionFilter;

      const { data: res } = await api.get("/activities", { params });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, actionFilter]);

  if (user?.role !== "superAdmin") {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
          <User size={20} className="opacity-50" />
        </div>
        <p className="text-sm font-medium">Akses ditolak</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* <div>
            <div className="flex items-center gap-2 text-accent">
              <span className="text-xs font-medium uppercase tracking-wide">
                  SuperAdmin
              </span>
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Activity-log</h1>
        </div> */}

        {/* Filter */}
        <div className="relative">
          <Filter
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-10 text-sm text-white outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="" className="bg-slate-900">
              Semua aksi
            </option>
            {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
              <option key={key} value={key} className="bg-slate-900">
                {label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Loader2 className="animate-spin text-violet-400" size={32} />
          <p className="text-sm text-slate-500">Memuat aktivitas…</p>
        </div>
      ) : data.activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <Activity size={24} className="text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-400">Belum ada aktivitas</p>
          <p className="text-xs text-slate-600">Aktivitas akan muncul di sini</p>
        </div>
      ) : (
        <div className="relative space-y-3">
          {/* Timeline line */}
          <div className="absolute left-[40px] top-4 bottom-4 w-px bg-white/30" />

          {data.activities.map((act, idx) => {
            const meta = ACTION_LABELS[act.action] || {
              label: act.action,
              icon: Activity,
              color: "text-slate-400",
              bg: "bg-slate-500/15",
              ring: "ring-slate-500/30",
            };
            const Icon = meta.icon;

            return (
              <div
                key={act._id}
                className="group relative flex gap-4 rounded-3xl bg-white/[0.03] p-4 backdrop-blur-sm transition-all duration-200 hover:border-white/10 hover:bg-white/[0.05]"
              >
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.bg} ring-1 ${meta.ring} transition group-hover:scale-105`}
                >
                  <Icon size={18} className={meta.color} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-white">
                      {act.user?.name || "Unknown"}
                    </span>
                    <span className={`text-sm font-medium ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <time dateTime={act.createdAt}>
                      {new Date(act.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                    {act.user?.role && (
                      <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-medium text-slate-400 ring-1 ring-white/10">
                        {act.user.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[4.5rem] text-center text-sm tabular-nums text-slate-400">
            {page} <span className="text-slate-600">/</span> {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;