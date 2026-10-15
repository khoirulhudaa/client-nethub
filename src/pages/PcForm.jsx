import { ArrowLeft, Eye, EyeOff, Loader2, Pin, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { OS_LIST } from "./PcShared.jsx";

const inputCls = "input-field dark:!bg-slate-100/10 dark:!text-white";

const emptyForm = () => ({
  name: "", location: "", os: "", ipAddress: "",
  anydeskId: "", anydeskPassword: "", vncAddress: "", vncPassword: "",
  notes: "", pinned: false,
});

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="mb-1 block text-xs font-medium">{label}</label>
    {children}
  </div>
);

const PwToggle = ({ shown, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:bg-black/10"
    title={shown ? "Sembunyikan" : "Tampilkan"}
  >
    {shown ? <EyeOff size={15} /> : <Eye size={15} />}
  </button>
);

const PcForm = () => {
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
  const [showAd, setShowAd] = useState(false);
  const [showVnc, setShowVnc] = useState(false);
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
      .get(`/pcs/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setForm({ ...emptyForm(), ...data.pc });
      })
      .catch((err) => !cancelled && setError(err?.response?.data?.message || "PC tidak ditemukan."))
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

      if (!form.name.trim()) return setError("Nama PC wajib diisi.");
      if (!form.anydeskId.trim() && !form.vncAddress.trim()) return setError("Isi minimal satu: ID AnyDesk atau alamat VNC.");

      const payload = {
        name: form.name,
        location: form.location,
        os: form.os,
        ipAddress: form.ipAddress,
        anydeskId: form.anydeskId,
        anydeskPassword: form.anydeskPassword,
        vncAddress: form.vncAddress,
        vncPassword: form.vncPassword,
        notes: form.notes,
        pinned: form.pinned,
      };

      setSaving(true);
      try {
        if (isEditing) await api.put(`/pcs/${id}`, payload);
        else await api.post("/pcs", payload);
        setDirty(false);
        toast.success(isEditing ? "PC disimpan" : "PC ditambahkan");
        navigate("/pcs");
      } catch (err) {
        setError(err?.response?.data?.message || "Gagal menyimpan PC.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setSaving(false);
      }
    },
    [form, id, isEditing, navigate]
  );

  const handleDelete = async () => {
    if (!confirm(`Hapus ${form.name || "PC ini"}? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.delete(`/pcs/${id}`);
      setDirty(false);
      toast.success("PC dihapus");
      navigate("/pcs");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menghapus PC");
    }
  };

  const goBack = () => {
    if (dirty && !confirm("Perubahan belum disimpan. Tetap keluar?")) return;
    navigate("/pcs");
  };

  if (isGuest) {
    return <div className="mx-auto max-w-full py-24 text-center text-white md:text-slate-900 dark:text-white">Guest tidak bisa memakai fitur ini.</div>;
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-full items-center justify-center gap-2 py-24 text-white md:text-slate-900 dark:text-white">
        <Loader2 size={18} className="animate-spin" /> Memuat data PC…
      </div>
    );
  }

  if (isEditing && error && !form.name) {
    return (
      <div className="mx-auto flex max-w-full flex-col items-center gap-3 py-24 text-center text-white md:text-slate-900 dark:text-white">
        <p className="font-medium">{error}</p>
        <button onClick={() => navigate("/pcs")} className="btn-primary">Kembali ke daftar PC</button>
      </div>
    );
  }

  return (
    <div className="mx-auto h-max min-h-screen max-w-full border-white pb-16 dark:border-white/10 md:border-x md:p-6">
      <button type="button" onClick={goBack} className="mb-3 flex items-center gap-1.5 text-sm text-white hover:brightness-75 md:text-slate-700 dark:text-gray-300">
        <ArrowLeft size={15} /> Daftar PC
      </button>

      {error && (
        <div className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 !mt-4">
        {/* Identitas PC */}
        <div className="surface-card rounded-lg p-3 dark:!bg-white/5 md:rounded-3xl md:p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <Field label="Nama PC *" className="md:col-span-4">
              <input
                className={inputCls}
                value={form.name}
                maxLength={80}
                onChange={(e) => set("name", e.target.value)}
                placeholder="PC-01 Kasir"
                autoFocus={!isEditing}
              />
            </Field>
            <Field label="Lokasi" className="md:col-span-3">
              <input className={inputCls} value={form.location} maxLength={80} onChange={(e) => set("location", e.target.value)} placeholder="Lab 1" />
            </Field>
            <Field label="IP lokal" className="md:col-span-3">
              <input className={inputCls} value={form.ipAddress} maxLength={60} onChange={(e) => set("ipAddress", e.target.value)} placeholder="192.168.1.10" />
            </Field>
            <Field label="OS" className="md:col-span-2">
              <select className={inputCls} value={form.os} onChange={(e) => set("os", e.target.value)}>
                <option value="" className="!text-black">—</option>
                {OS_LIST.map((o) => (
                  <option key={o.value} value={o.value} className="!text-black">{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* AnyDesk & VNC */}
        <div className="surface-card rounded-lg p-3 dark:!bg-white/5 md:rounded-3xl md:p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="ID AnyDesk">
              <input
                className={`${inputCls} font-mono`}
                value={form.anydeskId}
                onChange={(e) => set("anydeskId", e.target.value)}
                placeholder="123 456 789"
              />
            </Field>
            <Field label="Password AnyDesk (unattended)">
              <div className="relative">
                <input
                  type={showAd ? "text" : "password"}
                  className={`${inputCls} !pr-10`}
                  value={form.anydeskPassword}
                  maxLength={100}
                  onChange={(e) => set("anydeskPassword", e.target.value)}
                  autoComplete="new-password"
                />
                <PwToggle shown={showAd} onToggle={() => setShowAd((v) => !v)} />
              </div>
            </Field>

            <Field label="Alamat VNC (host:port)">
              <input
                className={`${inputCls} font-mono`}
                value={form.vncAddress}
                maxLength={100}
                onChange={(e) => set("vncAddress", e.target.value)}
                placeholder="192.168.1.10:5900"
              />
            </Field>
            <Field label="Password VNC">
              <div className="relative">
                <input
                  type={showVnc ? "text" : "password"}
                  className={`${inputCls} !pr-10`}
                  value={form.vncPassword}
                  maxLength={100}
                  onChange={(e) => set("vncPassword", e.target.value)}
                  autoComplete="new-password"
                />
                <PwToggle shown={showVnc} onToggle={() => setShowVnc((v) => !v)} />
              </div>
            </Field>
          </div>
          <p className="mt-3 text-[11px] text-gray-500">Isi minimal satu: ID AnyDesk atau alamat VNC.</p>
        </div>

        {/* Catatan & sematkan */}
        <div className="surface-card rounded-lg p-3 dark:!bg-white/5 md:rounded-3xl md:p-5">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
            <Field label="Catatan">
              <input className={inputCls} value={form.notes} maxLength={2000} onChange={(e) => set("notes", e.target.value)} placeholder="Server cetak, jangan dimatikan" />
            </Field>
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
              {isEditing ? "Simpan perubahan" : "Simpan PC"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PcForm;