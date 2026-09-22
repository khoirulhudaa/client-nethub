import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Hash,
  ImagePlus,
  Info,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const TYPE_OPTIONS = [
  {
    value: "info",
    label: "Info",
    color: "bg-blue-500",
    soft: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    icon: Info,
  },
  {
    value: "warning",
    label: "Warning",
    color: "bg-amber-500",
    soft: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    icon: AlertTriangle,
  },
  {
    value: "success",
    label: "Success",
    color: "bg-emerald-500",
    soft: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  {
    value: "important",
    label: "Important",
    color: "bg-rose-500",
    soft: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    icon: Megaphone,
  },
];

const emptyForm = {
  title: "",
  content: "",
  type: "info",
  isActive: true,
  expiresAt: "",
  thumbnail: "",
  hashtags: [],
};

const AnnouncementsAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [hashtagInput, setHashtagInput] = useState("");

  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // simpan item yang mau dihapus
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const LIMIT = 9;

  useEffect(() => {
    if (user && user.role !== "superAdmin") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const fetchAnnouncements = async (targetPage = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get("/announcements/admin", {
        params: { page: targetPage, limit: LIMIT, search: search.trim() },
      });

      setAnnouncements((prev) =>
        isLoadMore ? [...prev, ...(data.announcements || [])] : data.announcements || []
      );
      setTotalPages(data.pages || 1);
      setPage(targetPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user?.role === "superAdmin") fetchAnnouncements();
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setHashtagInput("");
    setShowPanel(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      type: item.type || "info",
      isActive: item.isActive,
      expiresAt: item.expiresAt
        ? new Date(item.expiresAt).toISOString().slice(0, 16)
        : "",
      thumbnail: item.thumbnail || "",
      hashtags: item.hashtags || [],
    });
    setHashtagInput("");
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setEditing(null);
    setForm(emptyForm);
    setHashtagInput("");
  };

  // ——— Thumbnail (base64, sama seperti coverImage di Post) ———
  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      // hasilnya: "data:image/jpeg;base64,/9j/4AAQ..."
      setForm((prev) => ({ ...prev, thumbnail: reader.result }));
    };
    reader.onerror = () => {
      alert("Gagal membaca file");
    };
    reader.readAsDataURL(file);

    // reset input supaya bisa pilih file yang sama lagi
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeThumbnail = () => {
    setForm((prev) => ({ ...prev, thumbnail: "" }));
  };

  // ——— Hashtag ———
  const addHashtag = () => {
    const raw = hashtagInput.trim().replace(/^#/, "").toLowerCase();
    if (!raw) return;
    if (form.hashtags.length >= 4) {
      alert("Maksimal 4 hashtag");
      return;
    }
    if (form.hashtags.includes(raw)) {
      setHashtagInput("");
      return;
    }
    setForm((prev) => ({
      ...prev,
      hashtags: [...prev.hashtags, raw],
    }));
    setHashtagInput("");
  };

  const removeHashtag = (tag) => {
    setForm((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((t) => t !== tag),
    }));
  };

  const handleHashtagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addHashtag();
    }
  };

  const handleLoadMore = () => {
    fetchAnnouncements(page + 1, true);
  };

  const hasMore = page < totalPages;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        isActive: form.isActive,
        expiresAt: form.expiresAt || null,
        thumbnail: form.thumbnail || null,
        hashtags: form.hashtags,
      };

      if (editing) {
        await api.put(`/announcements/${editing._id}`, payload);
      } else {
        await api.post("/announcements", payload);
      }

      closePanel();
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = (item) => {
    setDeleteTarget(item);
  };

  const closeDeleteConfirm = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/announcements/${deleteTarget._id}`);
      if (editing?._id === deleteTarget._id) closePanel();
      setAnnouncements((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      alert("Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (id) => {
    // Simpan state lama buat rollback kalau gagal
    const prevAnnouncements = announcements;

    // Optimistic update — langsung ubah tampilan
    setAnnouncements((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, isActive: !item.isActive } : item
      )
    );

    try {
      await api.patch(`/announcements/${id}/toggle`);
      // Sukses — tidak perlu fetch ulang, state lokal sudah benar
    } catch {
      // Gagal — rollback ke state sebelumnya
      setAnnouncements(prevAnnouncements);
      alert("Gagal mengubah status");
    }
  };

  if (user?.role !== "superAdmin") return null;

  return (
    <div className="relative mx-auto max-w-full md:py-6 md:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <span className="text-xs font-medium uppercase tracking-wide">
              SuperAdmin
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Pengumuman</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/5 sm:w-64">
            <Search size={16} className="text-gray-400" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari judul..."
              className="w-full bg-transparent text-sm outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch("")}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            <Plus size={16} />
            Buat Pengumuman
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex surface-card justify-center flex-col h-full items-center text-center py-20">
          <img src="/cloud.png" alt="icon-cloud" className="w-20" />
          <p className="mt-2">Load content ...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
            <Bell size={24} className="text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Belum ada pengumuman
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Buat pengumuman pertama untuk pengguna
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 z-[99]">
          {announcements.map((item) => {
            const typeInfo =
              TYPE_OPTIONS.find((t) => t.value === item.type) || TYPE_OPTIONS[0];
            const TypeIcon = typeInfo.icon;
            const isExpired =
              item.expiresAt && new Date(item.expiresAt) < new Date();
            const isDimmed = !item.isActive || isExpired;

            return (
              <div
                key={item._id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] dark:border-white/[0.06] dark:bg-[#12121a] dark:shadow-none dark:hover:bg-slate-900 ${
                  isDimmed ? "opacity-55" : ""
                }`}
              >

                {/* Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus
                        size={28}
                        className="text-gray-300 dark:text-gray-600"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {/* Top: type + actions */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${typeInfo.soft}`}
                      >
                        <TypeIcon size={12} strokeWidth={2.5} />
                        {typeInfo.label}
                      </span>

                      {!item.isActive && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                          Nonaktif
                        </span>
                      )}
                      {isExpired && (
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
                          Kadaluarsa
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleToggle(item._id)}
                        className="rounded-xl p-2 text-white transition-colors hover:bg-black/[0.04] hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
                        title={item.isActive ? "Nonaktifkan" : "Aktifkan"}
                      >
                        {item.isActive ? (
                          <ToggleRight size={18} className="text-emerald-500" />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-xl p-2 text-white transition-colors hover:bg-black/[0.04] hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(item)}
                        className="rounded-xl p-2 text-white transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                        title="Hapus"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
                      {item.content}
                    </p>
                  </div>

                  {/* Hashtags */}
                  {item.hashtags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300"
                        >
                          <Hash size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer meta */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/[0.04] pt-3 text-[11px] text-gray-400 dark:border-white/[0.06]">
                    <span className="font-medium text-gray-500 dark:text-gray-400">
                      {item.createdBy?.name || "Unknown"}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {item.expiresAt && (
                      <>
                        {/* <span className="text-gray-300 dark:text-gray-600">·</span> */}
                        s/d{" "}
                        <span>
                          {new Date(item.expiresAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== SIDEBAR PANEL ===== */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          showPanel ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closePanel}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#12121a] ${
          showPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-md font-semibold">
            {editing ? "Edit Pengumuman" : "Buat Pengumuman"}
          </h2>
          <button
            onClick={closePanel}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-black/5 active:scale-[0.98] dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-5 px-5 py-5">
            {/* Thumbnail */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Thumbnail</label>

              {form.thumbnail ? (
                <div className="relative overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/10">
                  <img
                    src={form.thumbnail}
                    alt="Preview"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/80 py-8 text-gray-500 transition hover:border-gray-400 hover:bg-gray-100 dark:border-white/15 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                >
                  <ImagePlus size={22} />
                  <span className="text-sm">Upload gambar</span>
                  <span className="text-xs text-gray-400">Max 2MB</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailUpload}
              />
            </div>

            {/* Judul */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Judul</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field w-full"
                placeholder="Contoh: Maintenance terjadwal"
                required
                maxLength={150}
                autoFocus
              />
            </div>

            {/* Isi */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Isi</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="input-field w-full min-h-[120px] resize-y"
                placeholder="Tulis isi pengumuman..."
                required
              />
            </div>

            {/* Tipe */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tipe</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPE_OPTIONS.map((t) => {
                  const Icon = t.icon;
                  const selected = form.type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: t.value })}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        selected
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-black/[0.06] text-gray-600 hover:bg-black/[0.03] dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon size={16} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Hashtag{" "}
                <span className="font-normal text-gray-400">
                  ({form.hashtags.length}/4)
                </span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={handleHashtagKeyDown}
                    className="input-field w-full pl-8"
                    placeholder="Ketik lalu Enter"
                    disabled={form.hashtags.length >= 4}
                  />
                </div>
                <button
                  type="button"
                  onClick={addHashtag}
                  disabled={!hashtagInput.trim() || form.hashtags.length >= 4}
                  className="rounded-xl bg-gray-100 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-40 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15"
                >
                  Tambah
                </button>
              </div>
              {form.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(tag)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Kadaluarsa */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Kadaluarsa (opsional)
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
                className="input-field w-full"
              />
            </div>

            {/* Aktif */}
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded"
              />
              Aktifkan pengumuman
            </label>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closePanel}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-black/5 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editing ? "Simpan" : "Buat"}
              </button>
            </div>
          </div>
        </form>
      </aside>

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] w-full md:w-[81vw] right-0 ml-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeDeleteConfirm}
          />

          {/* Modal box */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                <Trash2 size={22} className="text-red-600 dark:text-red-400" />
              </div>

              <h3 className="text-center text-lg font-semibold">
                Hapus pengumuman?
              </h3>
              <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                "{deleteTarget.title}" akan dihapus secara permanen dan tidak dapat dikembalikan.
              </p>
            </div>

            <div className="flex gap-3 border-t border-white bg-gray-50 px-6 py-4 dark:border-white/5 dark:bg-white/5">
              <button
                type="button"
                disabled={deleting}
                onClick={closeDeleteConfirm}
                className="flex-1 active:scale-[0.99] duration-100 rounded-xl border border-white bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:hover:bg-gray-900 dark:text-gray-200"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 active:scale-[0.99] duration-100 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Menghapus...
                  </span>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsAdmin;