import { ArrowLeft, Loader2, Pin, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { COLORS, COLOR_BG, COLOR_DOT, MOODS, fromInputDate, toInputDate } from "./noteShared.js";

const inputCls = "input-field dark:!bg-slate-100/10 dark:!text-white";

const emptyForm = () => ({
  title: "", content: "", entryDate: toInputDate(), mood: "", color: "default", tags: "", pinned: false,
});

const NoteForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = user?.isGuest || user?.role === "guest";

  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const formRef = useRef(null);

  const set = (k, v) => {
    setDirty(true);
    setForm((f) => ({ ...f, [k]: v }));
  };

  useEffect(() => {
    if (!isEditing || isGuest) return;
    let cancelled = false;
    setLoading(true);

    api
      .get(`/notes/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        const n = data.note;
        setForm({
          ...emptyForm(),
          ...n,
          entryDate: toInputDate(n.entryDate),
          tags: (n.tags || []).join(", "),
        });
      })
      .catch((err) => !cancelled && setError(err?.response?.data?.message || "Catatan tidak ditemukan."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id, isEditing, isGuest]);

  // Peringatan jika menutup tab dengan perubahan belum tersimpan
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Ctrl/Cmd + S untuk menyimpan
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      if (!form.title.trim() && !form.content.trim()) return setError("Tulis judul atau isi catatan dulu.");
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tags.length > 6) return setError("Maksimal 6 tags.");

      const payload = {
        title: form.title,
        content: form.content,
        entryDate: fromInputDate(form.entryDate || toInputDate()),
        mood: form.mood,
        color: form.color,
        tags,
        pinned: form.pinned,
      };

      setSaving(true);
      try {
        if (isEditing) await api.put(`/notes/${id}`, payload);
        else await api.post("/notes", payload);
        setDirty(false);
        toast.success(isEditing ? "Catatan disimpan" : "Catatan ditambahkan");
        navigate("/notes");
      } catch (err) {
        setError(err?.response?.data?.message || "Gagal menyimpan catatan.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setSaving(false);
      }
    },
    [form, id, isEditing, navigate]
  );

  const handleDelete = async () => {
    if (!confirm("Hapus catatan ini? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      await api.delete(`/notes/${id}`);
      setDirty(false);
      toast.success("Catatan dihapus");
      navigate("/notes");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menghapus catatan");
    }
  };

  const goBack = () => {
    if (dirty && !confirm("Perubahan belum disimpan. Tetap keluar?")) return;
    navigate("/notes");
  };

  if (isGuest) {
    return <div className="mx-auto max-w-full py-24 text-center text-white md:text-slate-900 dark:text-white">Guest tidak bisa memakai fitur ini.</div>;
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-full items-center justify-center gap-2 py-24 text-white md:text-slate-900 dark:text-white">
        <Loader2 size={18} className="animate-spin" /> Memuat catatan…
      </div>
    );
  }

  if (isEditing && error && !form.title && !form.content) {
    return (
      <div className="mx-auto flex max-w-full flex-col items-center gap-3 py-24 text-center text-white md:text-slate-900 dark:text-white">
        <p className="font-medium">{error}</p>
        <button onClick={() => navigate("/notes")} className="btn-primary">Kembali ke Diary</button>
      </div>
    );
  }

  const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <div className="mx-auto h-max min-h-screen max-w-full border-white pb-16 dark:border-white/10 md:border-x md:p-6">
      <button type="button" onClick={goBack} className="mb-3 flex items-center gap-1.5 text-sm text-white hover:brightness-75 md:text-slate-700 dark:text-gray-300">
        <ArrowLeft size={15} /> Diary
      </button>

      {error && (
        <div className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 !mt-4">
        {/* Tanggal, mood, warna */}
        <div className="surface-card rounded-lg p-3 dark:!bg-white/5 md:rounded-3xl md:p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-3">
              <label className="mb-1 block text-xs font-medium">Tanggal</label>
              <input type="date" className={inputCls} value={form.entryDate} onChange={(e) => set("entryDate", e.target.value)} />
            </div>

            <div className="md:col-span-6">
              <label className="mb-1 block text-xs font-medium">Perasaanmu hari ini</label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => set("mood", form.mood === m.value ? "" : m.value)}
                    title={m.label}
                    className={`flex h-10 items-center gap-1.5 rounded-xl border px-2.5 text-sm transition active:scale-95 ${
                      form.mood === m.value ? "border-blue-500 bg-blue-500/15" : "border-gray-200 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="text-lg leading-none">{m.emoji}</span>
                    {form.mood === m.value && <span className="text-xs">{m.label}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="mb-1 block text-xs font-medium">Warna</label>
              <div className="flex h-10 items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("color", c)}
                    aria-label={c}
                    className={`h-7 w-7 rounded-full border-2 transition hover:scale-110 ${COLOR_DOT[c]} ${form.color === c ? "border-blue-500" : "border-white"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Area tulis */}
        <div className={`rounded-lg border border-gray-100 p-3 text-gray-900 dark:border-white/10 dark:text-white md:rounded-3xl md:p-6 ${COLOR_BG[form.color] || COLOR_BG.default}`}>
          <input
            value={form.title}
            maxLength={150}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Judul (boleh dikosongkan)"
            className="mb-3 w-full border-0 bg-transparent text-xl font-semibold outline-none placeholder:text-gray-500"
          />
          <textarea
            value={form.content}
            maxLength={20000}
            onChange={(e) => set("content", e.target.value)}
            placeholder="Tulis apa saja yang ada di pikiranmu…"
            autoFocus={!isEditing}
            className="min-h-[55vh] w-full resize-y border-0 bg-transparent text-[15px] leading-7 outline-none placeholder:text-gray-500"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>{words} kata · {form.content.length}/20000 karakter</span>
            <span className="hidden md:inline">Ctrl + S untuk menyimpan</span>
          </div>
        </div>

        {/* Tags & sematkan */}
        <div className="surface-card rounded-lg p-3 dark:!bg-white/5 md:rounded-3xl md:p-5">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Tags (pisahkan koma, maks 6)</label>
              <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="kerja, ide, refleksi" />
            </div>
            <button
              type="button"
              onClick={() => set("pinned", !form.pinned)}
              className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-sm transition ${
                form.pinned ? "border-blue-500 bg-blue-500/15" : "border-gray-200 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              }`}
            >
              <Pin size={14} className={form.pinned ? "fill-accent text-accent" : ""} />
              {form.pinned ? "Disematkan" : "Sematkan di atas"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {isEditing ? (
            <button type="button" onClick={handleDelete} className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              <Trash2 size={14} /> Hapus
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <button type="button" onClick={goBack} disabled={saving} className="btn-secondary">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEditing ? "Simpan perubahan" : "Simpan catatan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;