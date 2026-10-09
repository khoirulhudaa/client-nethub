import {
  AlertTriangle,
  Building2,
  Cake,
  Clock,
  Copy,
  Globe,
  Lock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/generateData.js";
import { timeAgo } from "../utils/timeAgo.js";
import { Avatar, CATEGORIES, CategoryBadge, LETTERS, primaryOf, telLink, waLink } from "./ContactShared.jsx";

// ===== Detail Drawer =====
const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex gap-3">
    <Icon size={16} className="mt-0.5 shrink-0 text-gray-500" />
    <div className="min-w-0 flex-1">
      <p className="text-[11px] text-gray-500">{label}</p>
      <div className="break-words text-sm text-gray-800 dark:text-gray-100">{children}</div>
    </div>
  </div>
);

const ContactDetail = ({ contact, onClose, onEdit, onDelete, onFavorite, onContacted }) => {
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Disalin");
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  const hasWork = contact.company || contact.department || contact.jobTitle || contact.employeeId || contact.location;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/15 dark:bg-[#12121b]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/15">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Detail kontak</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Avatar contact={contact} size={72} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">{contact.name}</h2>
                {contact.visibility === "private" && <Lock size={13} className="text-gray-500" title="Privat" />}
              </div>
              {contact.nickname && <p className="text-xs text-gray-500">“{contact.nickname}”</p>}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <CategoryBadge category={contact.category} />
                {contact.isEmergency && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-300">
                    <AlertTriangle size={11} /> Darurat
                  </span>
                )}
                {contact.relationship && <span className="text-xs text-gray-500">{contact.relationship}</span>}
              </div>
            </div>
            <button onClick={() => onFavorite(contact)} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-white/10" title="Favorit">
              <Star size={18} className={contact.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"} />
            </button>
          </div>

          {/* Telepon */}
          <div className="space-y-2">
            {contact.phones.map((p, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-3 dark:border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500">
                      {p.label}{p.isPrimary && " · Utama"}
                    </p>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {p.number}{p.extension && <span className="text-gray-500"> ext. {p.extension}</span>}
                    </p>
                    {p.note && <p className="mt-0.5 text-xs text-gray-500">{p.note}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => copy(p.number)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-white/10 dark:text-white" title="Salin">
                      <Copy size={14} />
                    </button>
                    <a href={telLink(p)} onClick={() => onContacted(contact)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700" title="Telepon">
                      <Phone size={14} />
                    </a>
                    {(p.isWhatsApp || p.label === "WhatsApp") && (
                      <a href={waLink(p)} target="_blank" rel="noopener noreferrer" onClick={() => onContacted(contact)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700" title="WhatsApp">
                        <MessageCircle size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="space-y-3.5">
            {contact.emails?.map((m, i) => (
              <InfoRow key={i} icon={Mail} label={`${m.label}${m.isPrimary ? " · Utama" : ""}`}>
                <a href={`mailto:${m.address}`} className="text-accent hover:underline">{m.address}</a>
              </InfoRow>
            ))}

            {hasWork && (
              <InfoRow icon={Building2} label="Pekerjaan">
                {[contact.jobTitle, contact.department, contact.company].filter(Boolean).join(" · ")}
                {contact.employeeId && <p className="text-xs text-gray-500">ID: {contact.employeeId}</p>}
                {contact.location && <p className="text-xs text-gray-500">{contact.location}</p>}
              </InfoRow>
            )}

            {contact.addresses?.map((a, i) => (
              <InfoRow key={i} icon={MapPin} label={a.label}>
                <p className="whitespace-pre-line">
                  {[a.street, a.district, a.city, a.province, a.postalCode, a.country].filter(Boolean).join(", ")}
                </p>
                {a.mapUrl && (
                  <a href={a.mapUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">Buka peta</a>
                )}
              </InfoRow>
            ))}

            {(contact.website || contact.socials?.length > 0) && (
              <InfoRow icon={Globe} label="Online">
                <div className="space-y-0.5">
                  {contact.website && (
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="block truncate text-accent hover:underline">{contact.website}</a>
                  )}
                  {contact.socials.map((s, i) => (
                    <p key={i}><span className="text-gray-500">{s.platform}:</span> {s.handle}</p>
                  ))}
                </div>
              </InfoRow>
            )}

            {contact.birthday && (
              <InfoRow icon={Cake} label="Tanggal lahir">{formatDate(contact.birthday)}</InfoRow>
            )}
            {contact.availability && (
              <InfoRow icon={Clock} label="Waktu tersedia">{contact.availability}</InfoRow>
            )}
            {contact.lastContactedAt && (
              <InfoRow icon={Phone} label="Terakhir dihubungi">{timeAgo(contact.lastContactedAt)}</InfoRow>
            )}
          </div>

          {contact.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((t) => (
                <span key={t} className="pill bg-gray-100 text-gray-500 dark:!bg-[#0c0c18] dark:text-white">#{t}</span>
              ))}
            </div>
          )}

          {contact.notes && (
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/5">
              <p className="mb-1 text-[11px] text-gray-500">Catatan</p>
              <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{contact.notes}</p>
            </div>
          )}

          <p className="text-[11px] text-gray-500">
            Dibuat oleh {contact.createdBy?.name || "—"} · {formatDate(contact.createdAt)}
            {contact.updatedBy?.name && ` · diubah oleh ${contact.updatedBy.name} ${timeAgo(contact.updatedAt)}`}
          </p>
        </div>

        {contact.canEdit && (
          <div className="flex shrink-0 gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/15">
            <button onClick={() => onEdit(contact)} className="btn-secondary flex-1"><Pencil size={14} /> Edit</button>
            <button onClick={() => onDelete(contact)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700">
              <Trash2 size={14} /> Hapus
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ===== Halaman utama =====
const Contacts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGuest = user?.isGuest || user?.role === "guest";

  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [letter, setLetter] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyEmergency, setOnlyEmergency] = useState(false);
  const [sort, setSort] = useState("name");

  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const reqRef = useRef(0);

  // Debounce pencarian
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [q, category, letter, onlyFav, onlyMine, onlyEmergency, sort]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/contacts/stats");
      setStats(data);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    const id = ++reqRef.current;
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (q) params.q = q;
      if (category) params.category = category;
      if (letter) params.letter = letter;
      if (onlyFav) params.favorite = 1;
      if (onlyMine) params.mine = 1;
      if (onlyEmergency) params.emergency = 1;

      const { data } = await api.get("/contacts", { params });
      if (id !== reqRef.current) return;
      setContacts(data.contacts);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      if (id !== reqRef.current) return;
      toast.error(err?.response?.data?.message || "Gagal memuat kontak");
    } finally {
      if (id === reqRef.current) setLoading(false);
    }
  }, [page, q, category, letter, onlyFav, onlyMine, onlyEmergency, sort]);

  useEffect(() => {
    if (!isGuest) fetchContacts();
  }, [fetchContacts, isGuest]);

  useEffect(() => {
    if (!isGuest) fetchStats();
  }, [fetchStats, isGuest]);

  const patchLocal = (id, patch) => {
    setContacts((list) => list.map((c) => (c._id === id ? { ...c, ...patch } : c)));
    setDetail((d) => (d && d._id === id ? { ...d, ...patch } : d));
  };

  const handleFavorite = async (c) => {
    const next = !c.isFavorite;
    patchLocal(c._id, { isFavorite: next }); // optimistic
    try {
      const { data } = await api.patch(`/contacts/${c._id}/favorite`);
      patchLocal(c._id, { isFavorite: data.isFavorite });
      fetchStats();
    } catch (err) {
      patchLocal(c._id, { isFavorite: !next });
      toast.error(err?.response?.data?.message || "Gagal mengubah favorit");
    }
  };

  const handleContacted = (c) => {
    api
      .patch(`/contacts/${c._id}/contacted`)
      .then(({ data }) => patchLocal(c._id, { lastContactedAt: data.lastContactedAt }))
      .catch(() => {});
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/contacts/${deleteTarget._id}`);
      toast.success("Kontak dihapus");
      setDeleteTarget(null);
      setDetail(null);
      fetchContacts();
      fetchStats();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menghapus kontak");
    } finally {
      setDeleting(false);
    }
  };

  const copyNumber = async (e, text) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Nomor disalin");
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  if (isGuest) {
    return (
      <div className="mx-auto flex max-w-full flex-col items-center gap-3 py-24 text-center text-white md:text-slate-900 dark:text-white">
        <Lock size={28} />
        <p className="font-medium">Buku telepon hanya untuk user yang sudah login.</p>
      </div>
    );
  }

  const chip = (active) =>
    `rounded-lg border px-3 py-1.5 text-xs font-medium transition active:scale-[0.98] ${
      active
        ? "border-blue-500 bg-blue-600 text-white"
        : "border-white/20 bg-slate-300 text-slate-700 hover:brightness-95 dark:bg-[#0c0c18] dark:text-gray-300"
    }`;

  return (
    <div className="mx-auto max-w-full space-y-4 border-white pb-16 dark:border-white/15 md:border-x md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/contacts/create")} className="btn-primary mb-3">
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {/* Search & sort */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, nomor, perusahaan, email, tags…"
            className="input-field !pl-9 dark:!bg-slate-100/10 dark:!text-white"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field sm:w-48 dark:!bg-slate-100/10 dark:!text-white">
          <option value="name" className="!text-black">Nama A–Z</option>
          <option value="-name" className="!text-black">Nama Z–A</option>
          <option value="recent" className="!text-black">Terakhir dihubungi</option>
          <option value="-createdAt" className="!text-black">Terbaru ditambah</option>
        </select>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button className={chip(!category)} onClick={() => setCategory("")}>Semua</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={chip(category === c)} onClick={() => setCategory(category === c ? "" : c)}>
            {c}{stats?.byCategory?.[c] ? ` (${stats.byCategory[c]})` : ""}
          </button>
        ))}
        <span className="mx-1 hidden h-7 w-px bg-white/20 md:block" />
        <button className={chip(onlyFav)} onClick={() => setOnlyFav((v) => !v)}>★ Favorit</button>
        <button className={chip(onlyEmergency)} onClick={() => setOnlyEmergency((v) => !v)}>Darurat</button>
        <button className={chip(onlyMine)} onClick={() => setOnlyMine((v) => !v)}>Punya saya</button>
      </div>

      {/* Huruf */}
      <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]">
        {LETTERS.map((l) => (
          <button
            key={l}
            onClick={() => setLetter(letter === l ? "" : l)}
            className={`h-7 w-7 shrink-0 rounded-md text-xs font-medium ${
              letter === l ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-700 dark:bg-[#0c0c18] dark:text-gray-300"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-300 dark:bg-white/10" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-2xl bg-slate-300 py-16 text-center dark:!bg-[#0c0c18]">
          <Phone size={28} className="mx-auto mb-2 text-gray-500" />
          <p className="font-medium text-gray-800 dark:text-white">
            {q || category || letter || onlyFav || onlyMine || onlyEmergency ? "Tidak ada kontak yang cocok" : "Belum ada kontak"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {q || category || letter || onlyFav || onlyMine || onlyEmergency
              ? "Ubah kata kunci atau reset filter."
              : "Klik “Tambah kontak” untuk menyimpan nomor pertama."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {contacts.map((c) => {
            const p = primaryOf(c.phones);
            return (
              <div
                key={c._id}
                onClick={() => setDetail(c)}
                className="group cursor-pointer rounded-2xl border border-gray-100 bg-slate-300 p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/5 dark:!bg-[#0c0c18]"
              >
                <div className="flex items-start gap-3">
                  <Avatar contact={c} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">{c.name}</p>
                      {c.visibility === "private" && <Lock size={11} className="shrink-0 text-gray-500" />}
                      {c.isEmergency && <AlertTriangle size={12} className="shrink-0 text-red-500" />}
                    </div>
                    <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                      {[c.jobTitle, c.company].filter(Boolean).join(" · ") || c.relationship || "—"}
                    </p>
                    <div className="mt-1.5"><CategoryBadge category={c.category} /></div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFavorite(c); }}
                    className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Star size={16} className={c.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-500"} />
                  </button>
                </div>

                {p && (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-white/60 px-3 py-2 dark:bg-white/5">
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500">{p.label}</p>
                      <p className="truncate font-mono text-sm text-gray-900 dark:text-white">{p.number}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => copyNumber(e, p.number)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-white/10 dark:text-white" title="Salin">
                        <Copy size={14} />
                      </button>
                      <a href={telLink(p)} onClick={() => handleContacted(c)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700" title="Telepon">
                        <Phone size={14} />
                      </a>
                      {(p.isWhatsApp || p.label === "WhatsApp") && (
                        <a href={waLink(p)} target="_blank" rel="noopener noreferrer" onClick={() => handleContacted(c)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700" title="WhatsApp">
                          <MessageCircle size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {c.phones.length > 1 && (
                  <p className="mt-1.5 text-[11px] text-gray-500">+{c.phones.length - 1} nomor lain</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 text-sm text-white md:text-slate-900 dark:text-white">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-40">Sebelumnya</button>
          <span>Hal. {page} / {pages} · {total} kontak</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-40">Berikutnya</button>
        </div>
      )}

      {/* Detail */}
      {detail && (
        <ContactDetail
          contact={detail}
          onClose={() => setDetail(null)}
          onEdit={(c) => navigate(`/contacts/edit/${c._id}`)}
          onDelete={(c) => setDeleteTarget(c)}
          onFavorite={handleFavorite}
          onContacted={handleContacted}
        />
      )}

      {/* Konfirmasi hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/15 dark:bg-gray-900">
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                <Trash2 size={22} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-center text-lg font-semibold">Hapus kontak?</h3>
              <p className="mt-2 text-center text-sm text-gray-500 dark:text-white">
                <span className="font-medium text-gray-700 dark:text-gray-200">{deleteTarget.name}</span> akan dihapus permanen dan tidak bisa dikembalikan.
              </p>
            </div>
            <div className="flex gap-3 border-t border-gray-100 bg-slate-300 px-6 py-4 dark:border-white/5 dark:!bg-[#0c0c18]">
              <button disabled={deleting} onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-slate-300 disabled:opacity-50 dark:border-white/15 dark:bg-gray-800 dark:text-gray-200">
                Batal
              </button>
              <button disabled={deleting} onClick={confirmDelete} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {deleting ? (
                  <span className="inline-flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Menghapus…</span>
                ) : (
                  "Ya, hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;