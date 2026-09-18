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

const AnnouncementsAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = create

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "info",
    isActive: true,
    expiresAt: "",
  });

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
    setForm({
      title: "",
      content: "",
      type: "info",
      isActive: true,
      expiresAt: "",
    });
    setShowModal(true);
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
    setShowModal(true);
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

      setShowModal(false);
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
    return null; // atau loading
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <span className="text-xs font-medium uppercase tracking-wide">
              SuperAdmin
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Pengumuman
          </h1>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
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
        <div className="space-y-3">
          {announcements.map((item) => {
            const typeInfo = TYPE_OPTIONS.find((t) => t.value === item.type) || TYPE_OPTIONS[0];
            const isExpired =
              item.expiresAt && new Date(item.expiresAt) < new Date();

            return (
              <div
                key={item._id}
                className={`surface-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between ${
                  !item.isActive || isExpired ? "opacity-60" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
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
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.content}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span>
                      Oleh {item.createdBy?.name || "Unknown"}
                    </span>
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
                <div className="flex items-center gap-1.5 shrink-0">
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

      {/* Modal Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white p-6 shadow-xl dark:bg-[#12121a]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Judul</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field w-full"
                  placeholder="Contoh: Maintenance terjadwal"
                  required
                  maxLength={150}
                />
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Tipe</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input-field w-full"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
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
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                Aktifkan pengumuman
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editing ? "Simpan Perubahan" : "Buat Pengumuman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsAdmin;