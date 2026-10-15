import { Copy, Monitor, Pin, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { OS_LIST, copyText, formatAnydesk, osOf } from "./PcShared.jsx";

// Baris ID / alamat dengan tombol salin
const CopyRow = ({ label, value, display }) =>
  value ? (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-black/5 px-2.5 py-1.5 dark:bg-white/5">
      <div className="min-w-0">
        <p className="text-[10px] text-gray-500">{label}</p>
        <p className="truncate font-mono text-sm font-semibold">{display || value}</p>
      </div>
      <button
        onClick={(e) => copyText(e, value, label)}
        className="shrink-0 rounded-md p-1.5 hover:bg-black/10 dark:hover:bg-white/10"
        title={`Salin ${label}`}
      >
        <Copy size={14} />
      </button>
    </div>
  ) : null;

const Pcs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGuest = user?.isGuest || user?.role === "guest";

  const [pcs, setPcs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [os, setOs] = useState("");
  const [location, setLocation] = useState("");
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [sort, setSort] = useState("name");

  const reqRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [q, os, location, onlyPinned, sort]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/pcs/stats");
      setStats(data);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchPcs = useCallback(async () => {
    const id = ++reqRef.current;
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (q) params.q = q;
      if (os) params.os = os;
      if (location) params.location = location;
      if (onlyPinned) params.pinned = 1;

      const { data } = await api.get("/pcs", { params });
      if (id !== reqRef.current) return;
      setPcs(data.pcs);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      if (id !== reqRef.current) return;
      toast.error(err?.response?.data?.message || "Gagal memuat daftar PC");
    } finally {
      if (id === reqRef.current) setLoading(false);
    }
  }, [page, q, os, location, onlyPinned, sort]);

  useEffect(() => {
    if (!isGuest) fetchPcs();
  }, [fetchPcs, isGuest]);

  useEffect(() => {
    if (!isGuest) fetchStats();
  }, [fetchStats, isGuest]);

  const handlePin = async (e, pc) => {
    e.stopPropagation();
    setPcs((l) => l.map((x) => (x._id === pc._id ? { ...x, pinned: !x.pinned } : x))); // optimistic
    try {
      await api.patch(`/pcs/${pc._id}/pin`);
      fetchPcs();
      fetchStats();
    } catch (err) {
      setPcs((l) => l.map((x) => (x._id === pc._id ? { ...x, pinned: pc.pinned } : x)));
      toast.error(err?.response?.data?.message || "Gagal menyematkan PC");
    }
  };

  if (isGuest) {
    return (
      <div className="mx-auto max-w-full py-24 text-center text-white md:text-slate-900 dark:text-white">
        Daftar PC hanya untuk user yang sudah login.
      </div>
    );
  }

  const chip = (active) =>
    `rounded-lg border px-3 py-1.5 text-xs font-medium transition active:scale-[0.98] ${
      active
        ? "border-blue-500 bg-blue-600 text-white"
        : "border-white/20 bg-slate-300 text-slate-700 hover:brightness-95 dark:bg-[#0c0c18] dark:text-gray-300"
    }`;

  const hasFilter = q || os || location || onlyPinned;
  const locations = Object.keys(stats?.byLocation || {});

  return (
    <div className="mx-auto max-w-full space-y-4 border-white pb-16 dark:border-white/15 md:border-x md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/remote/create")} className="btn-primary">
          <Plus size={16} /> Tambah PC
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama PC, ID AnyDesk, VNC, IP, lokasi…"
            className="input-field !pl-9 dark:!bg-slate-100/10 dark:!text-white"
          />
        </div>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input-field sm:w-44 dark:!bg-slate-100/10 dark:!text-white"
          title="Filter lokasi"
        >
          <option value="" className="!text-black">Semua lokasi</option>
          {locations.map((l) => (
            <option key={l} value={l} className="!text-black">{l} ({stats.byLocation[l]})</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field sm:w-40 dark:!bg-slate-100/10 dark:!text-white">
          <option value="name" className="!text-black">Nama A–Z</option>
          <option value="newest" className="!text-black">Terbaru</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={chip(!os)} onClick={() => setOs("")}>Semua OS</button>
        {OS_LIST.map((o) => (
          <button key={o.value} className={chip(os === o.value)} onClick={() => setOs(os === o.value ? "" : o.value)}>
            {o.label} {stats?.byOs?.[o.value] || 0}
          </button>
        ))}
        <span className="mx-1 hidden h-7 w-px bg-white/20 md:block" />
        <button className={chip(onlyPinned)} onClick={() => setOnlyPinned((v) => !v)}>Disematkan</button>
        {location && <button className={chip(false)} onClick={() => setLocation("")}>Reset lokasi</button>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-300 dark:bg-white/10" />
          ))}
        </div>
      ) : pcs.length === 0 ? (
        <div className="rounded-2xl bg-slate-300 py-16 text-center dark:!bg-[#0c0c18]">
          <Monitor size={28} className="mx-auto mb-2 text-gray-500" />
          <p className="font-medium text-gray-800 dark:text-white">{hasFilter ? "Tidak ada PC yang cocok" : "Belum ada PC"}</p>
          <p className="mt-1 text-sm text-gray-500">
            {hasFilter ? "Ubah kata kunci atau reset filter." : "Klik “Tambah PC” untuk menyimpan ID AnyDesk dan VNC pertamamu."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pcs.map((pc) => {
            const o = osOf(pc.os);
            return (
              <div
                key={pc._id}
                onClick={() => navigate(`/remote/edit/${pc._id}`)}
                className="group flex min-h-[11rem] cursor-pointer flex-col gap-2 rounded-2xl border border-gray-100 bg-slate-300 p-4 text-gray-900 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/5 dark:!bg-[#0c0c18] dark:text-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{pc.name}</h3>
                    <p className="truncate text-[11px] text-gray-600 dark:text-gray-400">
                      {[pc.location, o?.label].filter(Boolean).join(" · ") || "Tanpa lokasi"}
                    </p>
                  </div>
                  <button onClick={(e) => handlePin(e, pc)} className="rounded-md p-0.5 hover:bg-black/10 dark:hover:bg-white/10" title="Sematkan">
                    <Pin size={14} className={pc.pinned ? "fill-accent text-accent" : "text-gray-500"} />
                  </button>
                </div>

                <CopyRow label="AnyDesk" value={pc.anydeskId} display={formatAnydesk(pc.anydeskId)} />
                <CopyRow label="VNC" value={pc.vncAddress} />

                {(pc.ipAddress || pc.notes) && (
                  <p className="mt-auto line-clamp-2 text-[11px] text-gray-500">
                    {pc.ipAddress && <span className="font-mono">{pc.ipAddress}</span>}
                    {pc.ipAddress && pc.notes && " — "}
                    {pc.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 text-sm text-white md:text-slate-900 dark:text-white">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-40">Sebelumnya</button>
          <span>Hal. {page} / {pages} · {total} PC</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-40">Berikutnya</button>
        </div>
      )}
    </div>
  );
};

export default Pcs;