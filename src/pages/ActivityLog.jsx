import { useEffect, useState } from "react";
import {
  Activity,
  ChevronDown,
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
  login: { label: "Login", icon: LogIn, color: "text-emerald-500" },
  logout: { label: "Logout", icon: LogOut, color: "text-slate-400" },
  create_post: { label: "Create Guide", icon: Plus, color: "text-blue-500" },
  update_post: { label: "Update Guide", icon: Pencil, color: "text-amber-500" },
  delete_post: { label: "Delete Guide", icon: Trash2, color: "text-red-500" },
  like: { label: "Like", icon: ThumbsUp, color: "text-pink-500" },
  unlike: { label: "Unlike", icon: ThumbsUp, color: "text-gray-400" },
  comment: { label: "Comment", icon: MessageSquare, color: "text-indigo-500" },
  delete_comment: { label: "Delete Comment", icon: Trash2, color: "text-red-400" },
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
      <div className="flex h-64 items-center justify-center text-gray-500">
        Akses ditolak
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-[3px] md:py-6 md:px-6">
      {/* Header */}
      <div className="mb-6 flex justify-between w-full items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <div className="flex items-center gap-2 text-accent">
            <span className="text-xs font-medium uppercase tracking-wide">
                SuperAdmin
            </span>
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Activity-log</h1>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-900"
          >
            <option value="">Semua aksi</option>
            {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={28} />
        </div>
      ) : data.activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-gray-500 dark:border-white/10">
          Belum ada aktivitas
        </div>
      ) : (
        <div className="surface-card rounded-2xl border border-gray-200 bg-slate-200 p-3 md:p-5 dark:border-white/10 dark:bg-white/5">
          {data.activities.map((act) => {
            const meta = ACTION_LABELS[act.action] || {
              label: act.action,
              icon: Activity,
              color: "text-gray-400",
            };
            const Icon = meta.icon;

            return (
              <div
                key={act._id}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0c0c18]"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 white`}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {act.user?.name || "Unknown"}
                    </span>
                    <span className="text-sm text-gray-500 dark:!text-white/50">
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs dark:text-white/50 text-gray-500">
                    <span>
                      {new Date(act.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    {/* {act.ip && <span>IP: {act.ip}</span>} */}
                    {act.user?.role && (
                      <span className="rounded bg-blue-600 px-1.5 py-0.5 text-white">
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
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-500">
            {page} / {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;