import { ArrowLeft, Camera, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Avatar, CATEGORIES, PHONE_LABELS, PLATFORMS } from "./ContactShared.jsx";

const emptyPhone = () => ({ label: "Mobile", number: "", extension: "", isPrimary: false, isWhatsApp: false, note: "" });
const emptyEmail = () => ({ label: "Work", address: "", isPrimary: false });
const emptyAddress = () => ({ label: "Office", street: "", district: "", city: "", province: "", postalCode: "", country: "Indonesia", mapUrl: "" });
const emptySocial = () => ({ platform: "Instagram", handle: "" });

const emptyForm = () => ({
  name: "", nickname: "", photo: "", gender: "", birthday: "",
  company: "", department: "", jobTitle: "", employeeId: "", location: "",
  phones: [{ ...emptyPhone(), isPrimary: true }],
  emails: [], addresses: [], socials: [], website: "",
  category: "Internal", relationship: "", tags: "",
  availability: "", notes: "", isEmergency: false, visibility: "public",
});

const fromContact = (c) => ({
  ...emptyForm(),
  ...c,
  birthday: c.birthday ? String(c.birthday).slice(0, 10) : "",
  tags: (c.tags || []).join(", "),
  phones: c.phones?.length ? c.phones : [{ ...emptyPhone(), isPrimary: true }],
  emails: c.emails || [],
  addresses: c.addresses || [],
  socials: c.socials || [],
});

// Kompres foto jadi thumbnail 256px agar payload kecil
const compressImage = (file, size = 256) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, size / Math.min(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

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

const ContactForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = user?.isGuest || user?.role === "guest";

  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load data saat edit
  useEffect(() => {
    if (!isEditing || isGuest) return;
    let cancelled = false;
    setLoading(true);

    api
      .get(`/contacts/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        if (!data.contact.canEdit) {
          setError("Kamu tidak punya akses mengubah kontak ini.");
          return;
        }
        setForm(fromContact(data.contact));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Kontak tidak ditemukan.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEditing, isGuest]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setItem = (key, idx, patch) =>
    setForm((f) => ({ ...f, [key]: f[key].map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  const addItem = (key, tpl, max) =>
    setForm((f) => (f[key].length >= max ? f : { ...f, [key]: [...f[key], tpl()] }));
  const removeItem = (key, idx) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));
  const setPrimary = (key, idx) =>
    setForm((f) => ({ ...f, [key]: f[key].map((it, i) => ({ ...it, isPrimary: i === idx })) }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    try {
      set("photo", await compressImage(file));
    } catch {
      toast.error("Gagal memproses foto");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Nama wajib diisi.");
    if (!form.phones.some((p) => p.number.trim())) return setError("Minimal 1 nomor telepon wajib diisi.");

    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length > 6) return setError("Maksimal 6 tags.");

    const payload = { ...form, tags };
    ["_id", "createdBy", "updatedBy", "createdAt", "updatedAt", "isFavorite", "canEdit", "__v"].forEach(
      (k) => delete payload[k]
    );

    setSaving(true);
    try {
      if (isEditing) await api.put(`/contacts/${id}`, payload);
      else await api.post("/contacts", payload);
      toast.success(isEditing ? "Kontak diperbarui" : "Kontak ditambahkan");
      navigate("/contacts");
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal menyimpan kontak.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const addBtn = (label, onClick, disabled) => (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-secondary !rounded-lg !px-3 !py-1 text-xs disabled:opacity-40">
      <Plus size={12} /> {label}
    </button>
  );

  if (isGuest) {
    return (
      <div className="mx-auto max-w-full py-24 text-center text-white md:text-slate-900 dark:text-white">
        Guest tidak bisa menambah atau mengubah kontak.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-full items-center justify-center gap-2 py-24 text-white md:text-slate-900 dark:text-white">
        <Loader2 size={18} className="animate-spin" /> Memuat kontak…
      </div>
    );
  }

  // Gagal load saat edit (tidak ada akses / tidak ditemukan)
  if (isEditing && error && !form.name) {
    return (
      <div className="mx-auto flex max-w-full flex-col items-center gap-3 py-24 text-center text-white md:text-slate-900 dark:text-white">
        <p className="font-medium">{error}</p>
        <button onClick={() => navigate("/contacts")} className="btn-primary">Kembali ke Phone Book</button>
      </div>
    );
  }

  return (
    <div className="mx-auto h-max min-h-screen max-w-full border-white pb-16 dark:border-white/10 md:border-x md:p-6">
      <button
        type="button"
        onClick={() => navigate("/contacts")}
        className="mb-3 flex items-center gap-1.5 text-sm text-white hover:brightness-75 md:text-slate-700 dark:text-gray-300"
      >
        <ArrowLeft size={15} /> Phone Book
      </button>

      <h1 className="text-xl font-semibold tracking-tight text-white">
        {isEditing ? "Edit kontak" : "Tambah kontak"}
      </h1>
      <p className="mb-4 hidden text-sm text-gray-400 dark:text-gray-500 md:block">
        Isi sedetail mungkin. Hanya nama dan satu nomor telepon yang wajib.
      </p>

      {error && (
        <div className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative !mt-4 space-y-6 md:!mt-6">
        {/* Identitas */}
        <Section title="Identitas">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <Avatar contact={form} size={96} />
                <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700">
                  <Camera size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
              </div>
              {form.photo && (
                <button type="button" onClick={() => set("photo", "")} className="text-xs text-red-500 hover:underline">Hapus foto</button>
              )}
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nama lengkap *" className="sm:col-span-2">
                <input className={inputCls} value={form.name} maxLength={120} onChange={(e) => set("name", e.target.value)} placeholder="mis. Budi Santoso" />
              </Field>
              <Field label="Nama panggilan">
                <input className={inputCls} value={form.nickname} maxLength={60} onChange={(e) => set("nickname", e.target.value)} />
              </Field>
              <Field label="Jenis kelamin">
                <select className={inputCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="" className="!text-black">—</option>
                  <option value="male" className="!text-black">Laki-laki</option>
                  <option value="female" className="!text-black">Perempuan</option>
                </select>
              </Field>
              <Field label="Tanggal lahir">
                <input type="date" className={inputCls} value={form.birthday} onChange={(e) => set("birthday", e.target.value)} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Pekerjaan */}
        <Section title="Pekerjaan">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Perusahaan / instansi">
              <input className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} />
            </Field>
            <Field label="Departemen / divisi">
              <input className={inputCls} value={form.department} onChange={(e) => set("department", e.target.value)} />
            </Field>
            <Field label="Jabatan">
              <input className={inputCls} value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
            </Field>
            <Field label="NIP / ID karyawan">
              <input className={inputCls} value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} />
            </Field>
            <Field label="Lokasi / cabang / gedung" className="sm:col-span-2">
              <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="mis. Gedung A lantai 3, Cabang Bandung" />
            </Field>
          </div>
        </Section>

        {/* Telepon */}
        <Section
          title="Nomor telepon *"
          hint="Maksimal 8. Pilih satu sebagai nomor utama."
          action={addBtn("Nomor", () => addItem("phones", emptyPhone, 8), form.phones.length >= 8)}
        >
          <div className="space-y-3">
            {form.phones.map((p, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-3 dark:border-white/10">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-12">
                  <select className={`${inputCls} sm:col-span-3`} value={p.label} onChange={(e) => setItem("phones", i, { label: e.target.value })}>
                    {PHONE_LABELS.map((l) => <option key={l} value={l} className="!text-black">{l}</option>)}
                  </select>
                  <input className={`${inputCls} col-span-2 sm:col-span-5`} value={p.number} maxLength={30} onChange={(e) => setItem("phones", i, { number: e.target.value })} placeholder="0812 3456 7890" inputMode="tel" />
                  <input className={`${inputCls} sm:col-span-2`} value={p.extension} maxLength={10} onChange={(e) => setItem("phones", i, { extension: e.target.value })} placeholder="Ext." />
                  <button type="button" onClick={() => removeItem("phones", i)} disabled={form.phones.length === 1} className="flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 disabled:opacity-30 sm:col-span-2">
                    <Trash2 size={15} />
                  </button>
                </div>
                <input className={`${inputCls} mt-2`} value={p.note} maxLength={100} onChange={(e) => setItem("phones", i, { note: e.target.value })} placeholder="Catatan nomor (mis. hanya jam kerja)" />
                <div className="mt-2 flex flex-wrap gap-4 text-xs">
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input type="radio" name="primaryPhone" checked={!!p.isPrimary} onChange={() => setPrimary("phones", i)} /> Nomor utama
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input type="checkbox" checked={!!p.isWhatsApp || p.label === "WhatsApp"} onChange={(e) => setItem("phones", i, { isWhatsApp: e.target.checked })} /> Aktif WhatsApp
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Email */}
        <Section title="Email" action={addBtn("Email", () => addItem("emails", emptyEmail, 5), form.emails.length >= 5)}>
          {form.emails.length === 0 && <p className="text-xs text-gray-500">Belum ada email.</p>}
          <div className="space-y-2">
            {form.emails.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-12">
                <input className={`${inputCls} sm:col-span-3`} value={m.label} maxLength={20} onChange={(e) => setItem("emails", i, { label: e.target.value })} placeholder="Label" />
                <input type="email" className={`${inputCls} col-span-2 sm:col-span-6`} value={m.address} onChange={(e) => setItem("emails", i, { address: e.target.value })} placeholder="nama@domain.com" />
                <label className="flex items-center gap-1.5 text-xs sm:col-span-2">
                  <input type="radio" name="primaryEmail" checked={!!m.isPrimary} onChange={() => setPrimary("emails", i)} /> Utama
                </label>
                <button type="button" onClick={() => removeItem("emails", i)} className="flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 sm:col-span-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Alamat */}
        <Section title="Alamat" action={addBtn("Alamat", () => addItem("addresses", emptyAddress, 3), form.addresses.length >= 3)}>
          {form.addresses.length === 0 && <p className="text-xs text-gray-500">Belum ada alamat.</p>}
          <div className="space-y-3">
            {form.addresses.map((a, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-3 dark:border-white/10">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <input className={`${inputCls} max-w-[160px]`} value={a.label} maxLength={20} onChange={(e) => setItem("addresses", i, { label: e.target.value })} placeholder="Label (Office)" />
                  <button type="button" onClick={() => removeItem("addresses", i)} className="text-red-500"><Trash2 size={15} /></button>
                </div>
                <textarea className={`${inputCls} min-h-[60px]`} value={a.street} maxLength={200} onChange={(e) => setItem("addresses", i, { street: e.target.value })} placeholder="Jalan, nomor, RT/RW" />
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <input className={inputCls} value={a.district} onChange={(e) => setItem("addresses", i, { district: e.target.value })} placeholder="Kecamatan" />
                  <input className={inputCls} value={a.city} onChange={(e) => setItem("addresses", i, { city: e.target.value })} placeholder="Kota / kabupaten" />
                  <input className={inputCls} value={a.province} onChange={(e) => setItem("addresses", i, { province: e.target.value })} placeholder="Provinsi" />
                  <input className={inputCls} value={a.postalCode} maxLength={10} onChange={(e) => setItem("addresses", i, { postalCode: e.target.value })} placeholder="Kode pos" />
                  <input className={inputCls} value={a.country} onChange={(e) => setItem("addresses", i, { country: e.target.value })} placeholder="Negara" />
                  <input className={inputCls} value={a.mapUrl} onChange={(e) => setItem("addresses", i, { mapUrl: e.target.value })} placeholder="Link Google Maps" />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Sosmed & web */}
        <Section title="Sosial media & website" action={addBtn("Akun", () => addItem("socials", emptySocial, 6), form.socials.length >= 6)}>
          <div className="space-y-2">
            {form.socials.map((s, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-12">
                <select className={`${inputCls} sm:col-span-4`} value={s.platform} onChange={(e) => setItem("socials", i, { platform: e.target.value })}>
                  {PLATFORMS.map((p) => <option key={p} value={p} className="!text-black">{p}</option>)}
                </select>
                <input className={`${inputCls} col-span-2 sm:col-span-7`} value={s.handle} onChange={(e) => setItem("socials", i, { handle: e.target.value })} placeholder="@username atau URL" />
                <button type="button" onClick={() => removeItem("socials", i)} className="flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 sm:col-span-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <Field label="Website" className="mt-3">
            <input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
          </Field>
        </Section>

        {/* Klasifikasi */}
        <Section title="Klasifikasi">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Kategori">
              <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="!text-black">{c}</option>)}
              </select>
            </Field>
            <Field label="Hubungan / peran">
              <input className={inputCls} value={form.relationship} onChange={(e) => set("relationship", e.target.value)} placeholder="mis. Teknisi ISP, Atasan" />
            </Field>
            <Field label="Tags (pisahkan koma, maks 6)">
              <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="isp, mikrotik, vendor-cctv" />
            </Field>
            <Field label="Jam / waktu tersedia">
              <input className={inputCls} value={form.availability} maxLength={100} onChange={(e) => set("availability", e.target.value)} placeholder="Senin–Jumat 08.00–17.00" />
            </Field>
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isEmergency} onChange={(e) => set("isEmergency", e.target.checked)} />
            Tandai sebagai kontak darurat
          </label>
        </Section>

        {/* Catatan & akses */}
        <Section title="Catatan & akses">
          <Field label="Catatan">
            <textarea className={`${inputCls} min-h-[100px]`} value={form.notes} maxLength={2000} onChange={(e) => set("notes", e.target.value)} placeholder="Info tambahan, riwayat, nomor kontrak, dll." />
            <p className="mt-1 text-right text-[11px] text-gray-500">{form.notes.length}/2000</p>
          </Field>
          <Field label="Visibilitas" className="mt-2">
            <select className={inputCls} value={form.visibility} onChange={(e) => set("visibility", e.target.value)}>
              <option value="public" className="!text-black">Publik — semua user login bisa melihat</option>
              <option value="private" className="!text-black">Privat — hanya saya</option>
            </select>
          </Field>
        </Section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/contacts")} disabled={saving} className="btn-secondary">
            Batal
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEditing ? "Simpan perubahan" : "Simpan kontak"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;