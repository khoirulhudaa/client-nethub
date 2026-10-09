import { Pin, Plus, Search, StickyNote } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { COLOR_BG, MOODS, formatLong, moodOf } from "./noteShared.jsx";

const Notes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGuest = user?.isGuest || user?.role === "guest";

  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [mood, setMood] = useState("");
  const [month, setMonth] = useState("");
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [sort, setSort] = useState("newest");

  const reqRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [q, mood, month, onlyPinned, sort]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/notes/stats");
      setStats(data);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    const id = ++reqRef.current;
    setLoading(true);
    try {
      const params = { page, limit: 12, sort, tzOffset: new Date().getTimezoneOffset() };
      if (q) params.q = q;
      if (mood) params.mood = mood;
      if (month) params.month = month;
      if (onlyPinned) params.pinned = 1;

      const { data } = await api.get("/notes", { params });
      if (id !== reqRef.current) return;
      setNotes(data.notes);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      if (id !== reqRef.current) return;
      toast.error(err?.response?.data?.message || "Gagal memuat catatan");
    } finally {
      if (id === reqRef.current) setLoading(false);
    }
  }, [page, q, mood, month, onlyPinned, sort]);

  useEffect(() => {
    if (!isGuest) fetchNotes();
  }, [fetchNotes, isGuest]);

  useEffect(() => {
    if (!isGuest) fetchStats();
  }, [fetchStats, isGuest]);

  const handlePin = async (e, n) => {
    e.stopPropagation();
    setNotes((l) => l.map((x) => (x._id === n._id ? { ...x, pinned: !x.pinned } : x))); // optimistic
    try {
      await api.patch(`/notes/${n._id}/pin`);
      fetchNotes();
      fetchStats();
    } catch (err) {
      setNotes((l) => l.map((x) => (x._id === n._id ? { ...x, pinned: n.pinned } : x)));
      toast.error(err?.response?.data?.message || "Gagal menyematkan catatan");
    }
  };

  if (isGuest) {
    return (
      <div className="mx-auto max-w-full py-24 text-center text-white md:text-slate-900 dark:text-white">
        Catatan hanya untuk user yang sudah login.
      </div>
    );
  }

  const chip = (active) =>
    `rounded-lg border px-3 py-1.5 text-xs font-medium transition active:scale-[0.98] ${
      active
        ? "border-blue-500 bg-blue-600 text-white"
        : "border-white/20 bg-slate-300 text-slate-700 hover:brightness-95 dark:bg-[#0c0c18] dark:text-gray-300"
    }`;

  const hasFilter = q || mood || month || onlyPinned;

  return (
    <div className="mx-auto max-w-full space-y-4 border-white pb-16 dark:border-white/15 md:border-x md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white md:text-slate-900 dark:text-white">Diary</h1>
          <p className="text-sm text-gray-300 md:text-gray-500">
            {stats ? `${stats.total} catatan · ${stats.pinned} disematkan · hanya kamu yang bisa membaca` : "Catatan pribadi"}
          </p>
        </div>
        <button onClick={() => navigate("/notes/create")} className="btn-primary">
          <Plus size={16} /> Tulis catatan
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, isi, atau tags…"
            className="input-field !pl-9 dark:!bg-slate-100/10 dark:!text-white"
          />
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="input-field sm:w-44 dark:!bg-slate-100/10 dark:!text-white"
          title="Filter bulan"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field sm:w-40 dark:!bg-slate-100/10 dark:!text-white">
          <option value="newest" className="!text-black">Terbaru</option>
          <option value="oldest" className="!text-black">Terlama</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={chip(!mood)} onClick={() => setMood("")}>Semua mood</button>
        {MOODS.map((m) => (
          <button key={m.value} className={chip(mood === m.value)} onClick={() => setMood(mood === m.value ? "" : m.value)} title={m.label}>
            {m.emoji} {stats?.byMood?.[m.value] || 0}
          </button>
        ))}
        <span className="mx-1 hidden h-7 w-px bg-white/20 md:block" />
        <button className={chip(onlyPinned)} onClick={() => setOnlyPinned((v) => !v)}>Disematkan</button>
        {month && <button className={chip(false)} onClick={() => setMonth("")}>Reset bulan</button>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-300 dark:bg-white/10" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl bg-slate-300 py-16 text-center dark:!bg-[#0c0c18]">
          <StickyNote size={28} className="mx-auto mb-2 text-gray-500" />
          <p className="font-medium text-gray-800 dark:text-white">{hasFilter ? "Tidak ada catatan yang cocok" : "Belum ada catatan"}</p>
          <p className="mt-1 text-sm text-gray-500">
            {hasFilter ? "Ubah kata kunci atau reset filter." : "Klik “Tulis catatan” untuk memulai halaman pertamamu."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((n) => {
            const m = moodOf(n.mood);
            return (
              <div
                key={n._id}
                onClick={() => navigate(`/notes/edit/${n._id}`)}
                className={`group flex min-h-[11rem] cursor-pointer flex-col rounded-2xl border border-gray-100 p-4 text-gray-900 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/5 dark:text-white ${COLOR_BG[n.color] || COLOR_BG.default}`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-[11px] text-gray-600 dark:text-gray-400">{formatLong(n.entryDate)}</p>
                  <div className="flex items-center gap-1.5">
                    {m && <span title={m.label} className="text-base leading-none">{m.emoji}</span>}
                    <button onClick={(e) => handlePin(e, n)} className="rounded-md p-0.5 hover:bg-black/10 dark:hover:bg-white/10" title="Sematkan">
                      <Pin size={14} className={n.pinned ? "fill-accent text-accent" : "text-gray-500"} />
                    </button>
                  </div>
                </div>

                {n.title && <h3 className="mb-1 line-clamp-2 font-semibold">{n.title}</h3>}
                <p className="line-clamp-5 flex-1 whitespace-pre-line break-words text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {n.preview || <span className="italic text-gray-500">Tanpa isi</span>}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
                  <span>{n.wordCount} kata</span>
                  {n.tags?.map((t) => <span key={t}>#{t}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 text-sm text-white md:text-slate-900 dark:text-white">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-40">Sebelumnya</button>
          <span>Hal. {page} / {pages} · {total} catatan</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-40">Berikutnya</button>
        </div>
      )}
    </div>
  );
};

export default Notes;