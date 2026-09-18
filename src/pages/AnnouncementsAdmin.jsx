import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const TYPE_OPTIONS = [
  { value: "info", label: "Info", color: "bg-blue-500" },
  { value: "warning", label: "Warning", color: "bg-amber-500" },
  { value: "success", label: "Success", color: "bg-emerald-500" },
  { value: "important", label: "Important", color: "bg-rose-500" },
];

const emptyForm = {
  title: "",
  content: "",
  type: "info",
  isActive: true,
  expiresAt: "",
};

const AnnouncementsAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [editing, setEditing] = useState(null); // null = create

  const [form, setForm] = useState(emptyForm);

  // Guard: hanya superAdmin
  useEffect(() => {
    if (user && user.role !== "superAdmin") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/announcements/admin");
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "superAdmin") fetchAnnouncements();
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
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
    });
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setEditing(null);
    setForm(emptyForm);
  };

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

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus pengumuman ini?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      // Jika sedang edit item yang dihapus, tutup panel
      if (editing?._id === id) closePanel();
      fetchAnnouncements();
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/announcements/${id}/toggle`);
      fetchAnnouncements();
    } catch (err) {
      alert("Gagal mengubah status");
    }
  };

  if (user?.role !== "superAdmin") {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <span className="text-xs font-medium uppercase tracking-wide">
              SuperAdmin
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Pengumuman</h1>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex active:scale-[0.98] items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          <Plus size={16} />
          Buat Pengumuman
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : announcements.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <Bell size={32} className="text-gray-400" />
          <p className="font-medium">Belum ada pengumuman</p>
          <p className="text-sm text-gray-500">
            Buat pengumuman pertama untuk pengguna
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 px-7 py-7 sm:px-4 w-full sm:py-4 relative bg-white/5 rounded-xl">
          {announcements.map((item) => {
            const typeInfo =
              TYPE_OPTIONS.find((t) => t.value === item.type) || TYPE_OPTIONS[0];
            const isExpired =
              item.expiresAt && new Date(item.expiresAt) < new Date();

            return (
              <div
                key={item._id}
                className={`flex flex-col gap-3 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-start sm:justify-between ${
                  !item.isActive || isExpired ? "opacity-60" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${typeInfo.color}`}
                    />
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {typeInfo.label}
                    </span>
                    {!item.isActive && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-white/10 dark:text-gray-300">
                        Nonaktif
                      </span>
                    )}
                    {isExpired && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                        Kadaluarsa
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                    {item.content}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span>Oleh {item.createdBy?.name || "Unknown"}</span>
                    <span>·</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {item.expiresAt && (
                      <>
                        <span>·</span>
                        <span>
                          Berlaku sampai{" "}
                          {new Date(item.expiresAt).toLocaleDateString("id-ID")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => handleToggle(item._id)}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-black/5 dark:hover:bg-white/10"
                    title={item.isActive ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {item.isActive ? (
                      <ToggleRight size={20} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={20} />
                    )}
                  </button>

                  <button
                    onClick={() => openEdit(item)}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-black/5 dark:hover:bg-white/10"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== RIGHT SIDEBAR PANEL ===== */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          showPanel ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closePanel}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#12121a] ${
          showPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-md font-semibold">
              {editing ? "Edit Pengumuman" : "Buat Pengumuman"}
            </h2>
          </div>
          <button
            onClick={closePanel}
            className="rounded-lg p-2 active:scale-[0.98] text-gray-500 transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-5 px-5 py-5">
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

            <div>
              <label className="mb-1.5 block text-sm font-medium">Isi</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="input-field w-full min-h-[140px] resize-y"
                placeholder="Tulis isi pengumuman..."
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Tipe</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-field w-full"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value} className="text-black">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

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

          {/* Footer actions */}
          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closePanel}
                className="flex-1 rounded-xl px-4 active:scale-[0.98] py-2.5 text-sm font-medium text-gray-600 transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex flex-1 active:scale-[0.98] items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editing ? "Simpan" : "Buat"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
};

export default AnnouncementsAdmin;