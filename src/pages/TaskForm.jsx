import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PRIORITIES, REPEATS, STATUSES, fromInputDate, toInputDate } from "./TaskShared.jsx";

const inputCls = "input-field dark:!bg-slate-100/10 dark:!text-white";

const Section = ({ title, hint, action, children }) => (
  <div className="surface-card rounded-lg p-3 dark:!bg-white/5 md:rounded-3xl md:p-5">
    <div className="mb-3 flex items-center justify-between gap-2">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="mb-1 block text-xs font-medium">{label}</label>
    {children}
  </div>
);

const emptyForm = () => ({
  title: "", description: "", status: "todo", priority: "medium",
  dueDate: "", repeat: "none", listName: "Umum", tags: "",
  checklist: [], pinned: false,
});

const TaskForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = user?.isGuest || user?.role === "guest";

  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lists, setLists] = useState([]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Daftar list yang sudah dipakai (untuk saran)
  useEffect(() => {
    if (isGuest) return;
    api.get("/tasks/stats").then(({ data }) => setLists(data.lists || [])).catch(() => {});
  }, [isGuest]);

  useEffect(() => {
    if (!isEditing || isGuest) return;
    let cancelled = false;
    setLoading(true);

    api
      .get(`/tasks/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        const t = data.task;
        setForm({
          ...emptyForm(),
          ...t,
          dueDate: toInputDate(t.dueDate),
          tags: (t.tags || []).join(", "),
          checklist: t.checklist || [],
        });
      })
      .catch((err) => !cancelled && setError(err?.response?.data?.message || "Tugas tidak ditemukan."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id, isEditing, isGuest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Judul tugas wajib diisi.");

    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length > 6) return setError("Maksimal 6 tags.");
    if (form.repeat !== "none" && !form.dueDate) return setError("Tugas berulang harus punya tenggat.");

    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      dueDate: fromInputDate(form.dueDate),
      repeat: form.repeat,
      listName: form.listName,
      tags,
      checklist: form.checklist,
      pinned: form.pinned,
    };

    setSaving(true);
    try {
      if (isEditing) await api.put(`/tasks/${id}`, payload);
      else await api.post("/tasks", payload);
      toast.success(isEditing ? "Tugas diperbarui" : "Tugas ditambahkan");
      navigate("/tasks");
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal menyimpan tugas.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus tugas ini? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Tugas dihapus");
      navigate("/tasks");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menghapus tugas");
    }
  };

  const setCheck = (idx, patch) =>
    setForm((f) => ({ ...f, checklist: f.checklist.map((c, i) => (i === idx ? { ...c, ...patch } : c)) }));

  if (isGuest) {
    return <div className="mx-auto max-w-full py-24 text-center text-white md:text-slate-900 dark:text-white">Guest tidak bisa memakai fitur ini.</div>;
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-full items-center justify-center gap-2 py-24 text-white md:text-slate-900 dark:text-white">
        <Loader2 size={18} className="animate-spin" /> Memuat tugas…
      </div>
    );
  }

  if (isEditing && error && !form.title) {
    return (
      <div className="mx-auto flex max-w-full flex-col items-center gap-3 py-24 text-center text-white md:text-slate-900 dark:text-white">
        <p className="font-medium">{error}</p>
        <button onClick={() => navigate("/tasks")} className="btn-primary">Kembali ke To-do</button>
      </div>
    );
  }

  return (
    <div className="mx-auto h-max min-h-screen max-w-full border-white pb-16 dark:border-white/10 md:border-x md:p-6">
      <button type="button" onClick={() => navigate("/tasks")} className="mb-3 flex items-center gap-1.5 text-sm text-white hover:brightness-75 md:text-slate-700 dark:text-gray-300">
        <ArrowLeft size={15} /> To-do List
      </button>
      <h1 className="mb-4 text-xl font-semibold tracking-tight text-white">{isEditing ? "Edit tugas" : "Tambah tugas"}</h1>

      {error && (
        <div className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 !mt-4 md:!mt-6">
        <Section title="Tugas">
          <div className="space-y-3">
            <Field label="Judul *">
              <input className={inputCls} value={form.title} maxLength={200} onChange={(e) => set("title", e.target.value)} placeholder="mis. Ganti kabel UTP ruang server" />
            </Field>
            <Field label="Deskripsi">
              <textarea className={`${inputCls} min-h-[100px]`} value={form.description} maxLength={2000} onChange={(e) => set("description", e.target.value)} placeholder="Detail, langkah, atau catatan tambahan" />
            </Field>
          </div>
        </Section>

        <Section title="Pengaturan">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {STATUSES.map((s) => <option key={s.value} value={s.value} className="!text-black">{s.label}</option>)}
              </select>
            </Field>
            <Field label="Prioritas">
              <select className={inputCls} value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                {PRIORITIES.map((p) => <option key={p.value} value={p.value} className="!text-black">{p.label}</option>)}
              </select>
            </Field>
            <Field label="Tenggat">
              <input type="date" className={inputCls} value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </Field>
            <Field label="Pengulangan">
              <select className={inputCls} value={form.repeat} onChange={(e) => set("repeat", e.target.value)}>
                {REPEATS.map((r) => <option key={r.value} value={r.value} className="!text-black">{r.label}</option>)}
              </select>
            </Field>
            <Field label="List / kelompok">
              <input className={inputCls} list="task-lists" value={form.listName} maxLength={40} onChange={(e) => set("listName", e.target.value)} placeholder="Umum, Pekerjaan, Pribadi…" />
              <datalist id="task-lists">{lists.map((l) => <option key={l} value={l} />)}</datalist>
            </Field>
            <Field label="Tags (pisahkan koma, maks 6)">
              <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="jaringan, urgent" />
            </Field>
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.pinned} onChange={(e) => set("pinned", e.target.checked)} />
            Sematkan di urutan teratas
          </label>
        </Section>

        <Section
          title="Sub-tugas"
          hint="Maksimal 30"
          action={
            <button type="button" disabled={form.checklist.length >= 30} onClick={() => set("checklist", [...form.checklist, { text: "", done: false }])} className="btn-secondary !px-3 !py-1 text-xs disabled:opacity-40">
              <Plus size={12} /> Sub-tugas
            </button>
          }
        >
          {form.checklist.length === 0 && <p className="text-xs text-gray-500">Belum ada sub-tugas.</p>}
          <div className="space-y-2">
            {form.checklist.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" checked={c.done} onChange={(e) => setCheck(i, { done: e.target.checked })} />
                <input className={inputCls} value={c.text} maxLength={200} onChange={(e) => setCheck(i, { text: e.target.value })} placeholder={`Sub-tugas ${i + 1}`} />
                <button type="button" onClick={() => set("checklist", form.checklist.filter((_, x) => x !== i))} className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-500/10">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        <div className="flex items-center justify-between gap-3">
          {isEditing ? (
            <button type="button" onClick={handleDelete} className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              <Trash2 size={14} /> Hapus
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/tasks")} disabled={saving} className="btn-secondary">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEditing ? "Simpan perubahan" : "Simpan tugas"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;