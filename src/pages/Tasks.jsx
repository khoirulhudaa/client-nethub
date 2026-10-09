import {
  CalendarDays,
  Check,
  ChevronDown,
  Circle,
  CheckCircle2,
  ListChecks,
  Loader2,
  Pencil,
  Pin,
  Plus,
  Repeat,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PRIORITIES, PriorityBadge, dueState, formatShort, fromInputDate } from "./TaskShared.jsx";

const tzOffset = () => new Date().getTimezoneOffset();

const Tasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGuest = user?.isGuest || user?.role === "guest";

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("active"); // active | done | all
  const [due, setDue] = useState(""); // today | overdue | week
  const [priority, setPriority] = useState("");
  const [list, setList] = useState("");
  const [sort, setSort] = useState("smart");

  const [quick, setQuick] = useState({ title: "", priority: "medium", dueDate: "" });
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const reqRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [q, status, due, priority, list, sort]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/tasks/stats", { params: { tzOffset: tzOffset() } });
      setStats(data);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    const id = ++reqRef.current;
    setLoading(true);
    try {
      const params = { page, limit: 30, status, sort, tzOffset: tzOffset() };
      if (q) params.q = q;
      if (due) params.due = due;
      if (priority) params.priority = priority;
      if (list) params.list = list;

      const { data } = await api.get("/tasks", { params });
      if (id !== reqRef.current) return;
      setTasks(data.tasks);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      if (id !== reqRef.current) return;
      toast.error(err?.response?.data?.message || "Gagal memuat tugas");
    } finally {
      if (id === reqRef.current) setLoading(false);
    }
  }, [page, q, status, due, priority, list, sort]);

  useEffect(() => {
    if (!isGuest) fetchTasks();
  }, [fetchTasks, isGuest]);

  useEffect(() => {
    if (!isGuest) fetchStats();
  }, [fetchStats, isGuest]);

  const refresh = () => {
    fetchTasks();
    fetchStats();
  };

  const patchLocal = (id, patch) =>
    setTasks((l) => l.map((t) => (t._id === id ? { ...t, ...patch } : t)));

  // ===== Aksi =====
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quick.title.trim()) return;
    setAdding(true);
    try {
      await api.post("/tasks", {
        title: quick.title.trim(),
        priority: quick.priority,
        dueDate: fromInputDate(quick.dueDate),
      });
      setQuick((s) => ({ ...s, title: "", dueDate: "" }));
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menambah tugas");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (task) => {
    patchLocal(task._id, { status: task.status === "done" ? "todo" : "done" }); // optimistic
    try {
      const { data } = await api.patch(`/tasks/${task._id}/toggle`, null, { params: { tzOffset: tzOffset() } });
      if (data.recurred) toast.success("Selesai. Jadwal dimajukan ke periode berikutnya");
      refresh();
    } catch (err) {
      patchLocal(task._id, { status: task.status });
      toast.error(err?.response?.data?.message || "Gagal mengubah status");
    }
  };

  const handleChecklist = async (task, idx) => {
    try {
      const { data } = await api.patch(`/tasks/${task._id}/checklist/${idx}`);
      patchLocal(task._id, { checklist: data.task.checklist });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal mengubah sub-tugas");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteTarget._id}`);
      toast.success("Tugas dihapus");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menghapus tugas");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearCompleted = async () => {
    setDeleting(true);
    try {
      const { data } = await api.delete("/tasks/completed");
      toast.success(`${data.deleted} tugas selesai dihapus`);
      setConfirmClear(false);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal membersihkan");
    } finally {
      setDeleting(false);
    }
  };

  if (isGuest) {
    return (
      <div className="mx-auto max-w-full py-24 text-center text-white md:text-slate-900 dark:text-white">
        To-do list hanya untuk user yang sudah login.
      </div>
    );
  }

  const chip = (active) =>
    `rounded-lg border px-3 py-1.5 text-xs font-medium transition active:scale-[0.98] ${
      active
        ? "border-blue-500 bg-blue-600 text-white"
        : "border-white/20 bg-slate-300 text-slate-700 hover:brightness-95 dark:bg-[#0c0c18] dark:text-gray-300"
    }`;

  const hasFilter = q || due || priority || list;

  return (
    <div className="mx-auto max-w-full space-y-4 border-white pb-16 dark:border-white/15 md:border-x md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white md:text-slate-900 dark:text-white">To-do List</h1>
          <p className="text-sm text-gray-300 md:text-gray-500">
            {stats ? `${stats.active} aktif · ${stats.done} selesai` : "Daftar tugas pribadi"}
          </p>
        </div>
        <button onClick={() => navigate("/tasks/create")} className="btn-primary">
          <Plus size={16} /> Tugas detail
        </button>
      </div>

      {/* Ringkasan */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Aktif", value: stats.active, on: () => { setStatus("active"); setDue(""); } },
            { label: "Hari ini", value: stats.today, on: () => { setStatus("active"); setDue("today"); } },
            { label: "Terlambat", value: stats.overdue, on: () => { setStatus("active"); setDue("overdue"); }, warn: stats.overdue > 0 },
            { label: "Selesai", value: stats.done, on: () => { setStatus("done"); setDue(""); } },
          ].map((s) => (
            <button
              key={s.label}
              onClick={s.on}
              className="rounded-2xl border border-gray-100 bg-slate-300 p-3 text-left transition hover:brightness-95 active:scale-[0.99] dark:border-white/5 dark:!bg-[#0c0c18]"
            >
              <p className="text-[11px] text-gray-600 dark:text-gray-400">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.warn ? "text-red-500" : "text-gray-900 dark:text-white"}`}>{s.value}</p>
            </button>
          ))}
        </div>
      )}

      {/* Tambah cepat */}
      <form
        onSubmit={handleQuickAdd}
        className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-slate-300 p-3 dark:border-white/5 dark:!bg-[#0c0c18] md:flex-row"
      >
        <input
          value={quick.title}
          onChange={(e) => setQuick((s) => ({ ...s, title: e.target.value }))}
          maxLength={200}
          placeholder="Tulis tugas baru lalu tekan Enter…"
          className="input-field flex-1 dark:!bg-slate-100/10 dark:!text-white"
        />
        <select
          value={quick.priority}
          onChange={(e) => setQuick((s) => ({ ...s, priority: e.target.value }))}
          className="input-field md:w-36 dark:!bg-slate-100/10 dark:!text-white"
        >
          {PRIORITIES.map((p) => <option key={p.value} value={p.value} className="!text-black">{p.label}</option>)}
        </select>
        <input
          type="date"
          value={quick.dueDate}
          onChange={(e) => setQuick((s) => ({ ...s, dueDate: e.target.value }))}
          className="input-field md:w-44 dark:!bg-slate-100/10 dark:!text-white"
        />
        <button type="submit" disabled={adding || !quick.title.trim()} className="btn-primary disabled:opacity-50">
          {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Tambah
        </button>
      </form>

      {/* Filter */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tugas, deskripsi, tags…"
            className="input-field !pl-9 dark:!bg-slate-100/10 dark:!text-white"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field sm:w-48 dark:!bg-slate-100/10 dark:!text-white">
          <option value="smart" className="!text-black">Urutan cerdas</option>
          <option value="due" className="!text-black">Tenggat terdekat</option>
          <option value="priority" className="!text-black">Prioritas tertinggi</option>
          <option value="newest" className="!text-black">Terbaru dibuat</option>
          <option value="completed" className="!text-black">Terakhir selesai</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={chip(status === "active")} onClick={() => setStatus("active")}>Aktif</button>
        <button className={chip(status === "done")} onClick={() => setStatus("done")}>Selesai</button>
        <button className={chip(status === "all")} onClick={() => setStatus("all")}>Semua</button>
        <span className="mx-1 hidden h-7 w-px bg-white/20 md:block" />
        <button className={chip(due === "today")} onClick={() => setDue(due === "today" ? "" : "today")}>Hari ini</button>
        <button className={chip(due === "week")} onClick={() => setDue(due === "week" ? "" : "week")}>7 hari</button>
        <button className={chip(due === "overdue")} onClick={() => setDue(due === "overdue" ? "" : "overdue")}>Terlambat</button>
        <span className="mx-1 hidden h-7 w-px bg-white/20 md:block" />
        {PRIORITIES.map((p) => (
          <button key={p.value} className={chip(priority === p.value)} onClick={() => setPriority(priority === p.value ? "" : p.value)}>
            {p.label}
          </button>
        ))}
        {stats?.lists?.length > 1 && (
          <select value={list} onChange={(e) => setList(e.target.value)} className="input-field !h-auto !w-auto !py-1.5 text-xs dark:!bg-slate-100/10 dark:!text-white">
            <option value="" className="!text-black">Semua list</option>
            {stats.lists.map((l) => <option key={l} value={l} className="!text-black">{l}</option>)}
          </select>
        )}
        {status === "done" && stats?.done > 0 && (
          <button onClick={() => setConfirmClear(true)} className="ml-auto rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
            Hapus semua yang selesai
          </button>
        )}
      </div>

      {/* Daftar */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-300 dark:bg-white/10" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl bg-slate-300 py-16 text-center dark:!bg-[#0c0c18]">
          <ListChecks size={28} className="mx-auto mb-2 text-gray-500" />
          <p className="font-medium text-gray-800 dark:text-white">
            {hasFilter ? "Tidak ada tugas yang cocok" : status === "done" ? "Belum ada tugas selesai" : "Tidak ada tugas aktif"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {hasFilter ? "Ubah kata kunci atau reset filter." : "Tulis tugas pertamamu di kolom di atas."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => {
            const done = t.status === "done";
            const ds = dueState(t);
            const doneCount = t.checklist?.filter((c) => c.done).length || 0;
            const isOpen = !!expanded[t._id];
            const hasDetail = t.description || t.checklist?.length > 0;

            return (
              <div
                key={t._id}
                className={`rounded-2xl border border-gray-100 bg-slate-300 p-3 transition dark:border-white/5 dark:!bg-[#0c0c18] md:p-4 ${done ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(t)}
                    className="mt-0.5 shrink-0 text-gray-500 transition hover:text-emerald-500 active:scale-90"
                    title={done ? "Tandai belum selesai" : "Tandai selesai"}
                  >
                    {done ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {t.pinned && <Pin size={12} className="fill-accent text-accent" />}
                      <p className={`break-words font-medium text-gray-900 dark:text-white ${done ? "line-through" : ""}`}>{t.title}</p>
                      {t.status === "in_progress" && (
                        <span className="rounded-md bg-yellow-500/20 px-2 py-0.5 text-[11px] font-medium text-yellow-700 dark:text-yellow-300">Dikerjakan</span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <PriorityBadge priority={t.priority} />
                      {t.dueDate && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                            ds === "overdue"
                              ? "bg-red-500/15 text-red-600 dark:text-red-300"
                              : ds === "today"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "bg-slate-500/15 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <CalendarDays size={11} />
                          {ds === "today" ? "Hari ini" : ds === "overdue" ? `Terlambat · ${formatShort(t.dueDate)}` : formatShort(t.dueDate)}
                        </span>
                      )}
                      {t.repeat !== "none" && (
                        <span className="inline-flex items-center gap-1 text-gray-500"><Repeat size={11} />{t.repeat === "daily" ? "Harian" : t.repeat === "weekly" ? "Mingguan" : "Bulanan"}</span>
                      )}
                      {t.listName && t.listName !== "Umum" && <span className="text-gray-500">{t.listName}</span>}
                      {t.checklist?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-gray-500"><Check size={11} />{doneCount}/{t.checklist.length}</span>
                      )}
                      {t.tags?.map((tag) => <span key={tag} className="text-gray-500">#{tag}</span>)}
                    </div>

                    {isOpen && (
                      <div className="mt-3 space-y-2">
                        {t.description && <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">{t.description}</p>}
                        {t.checklist?.map((c, i) => (
                          <label key={i} className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                            <input type="checkbox" checked={c.done} onChange={() => handleChecklist(t, i)} />
                            <span className={c.done ? "text-gray-500 line-through" : ""}>{c.text}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {hasDetail && (
                      <button onClick={() => setExpanded((s) => ({ ...s, [t._id]: !s[t._id] }))} className="rounded-lg p-1.5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10" title="Detail">
                        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    )}
                    <button onClick={() => navigate(`/tasks/edit/${t._id}`)} className="rounded-lg p-1.5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteTarget(t)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10" title="Hapus">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 text-sm text-white md:text-slate-900 dark:text-white">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-40">Sebelumnya</button>
          <span>Hal. {page} / {pages} · {total} tugas</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-40">Berikutnya</button>
        </div>
      )}

      {/* Modal konfirmasi (hapus satu / bersihkan selesai) */}
      {(deleteTarget || confirmClear) && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !deleting && (setDeleteTarget(null), setConfirmClear(false))} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/15 dark:bg-gray-900">
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                <Trash2 size={22} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-center text-lg font-semibold">{confirmClear ? "Hapus semua tugas selesai?" : "Hapus tugas?"}</h3>
              <p className="mt-2 text-center text-sm text-gray-500 dark:text-white">
                {confirmClear ? (
                  `${stats?.done || 0} tugas selesai akan dihapus permanen.`
                ) : (
                  <><span className="font-medium text-gray-700 dark:text-gray-200">{deleteTarget.title}</span> akan dihapus permanen.</>
                )}
              </p>
            </div>
            <div className="flex gap-3 border-t border-gray-100 bg-slate-300 px-6 py-4 dark:border-white/5 dark:!bg-[#0c0c18]">
              <button disabled={deleting} onClick={() => { setDeleteTarget(null); setConfirmClear(false); }} className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-slate-300 disabled:opacity-50 dark:border-white/15 dark:bg-gray-800 dark:text-gray-200">
                Batal
              </button>
              <button disabled={deleting} onClick={confirmClear ? handleClearCompleted : confirmDelete} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {deleting ? <span className="inline-flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Menghapus…</span> : "Ya, hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;