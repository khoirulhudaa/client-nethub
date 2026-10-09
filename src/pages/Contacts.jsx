import {
  AlertTriangle,
  Building2,
  Cake,
  Camera,
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
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/generateData.js";
import { timeAgo } from "../utils/timeAgo.js";

// ===== Konstanta =====
const CATEGORIES = ["Internal", "Vendor", "Client", "Supplier", "Support", "Emergency", "Family", "Other"];
const PHONE_LABELS = ["Mobile", "Work", "Home", "WhatsApp", "Extension", "Fax", "Other"];
const PLATFORMS = ["WhatsApp", "Telegram", "Instagram", "Facebook", "LinkedIn", "X", "TikTok", "Website", "Other"];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CATEGORY_STYLE = {
  Internal: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  Vendor: "bg-purple-500/15 text-purple-600 dark:text-purple-300",
  Client: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  Supplier: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
  Support: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
  Emergency: "bg-red-500/15 text-red-600 dark:text-red-300",
  Family: "bg-pink-500/15 text-pink-600 dark:text-pink-300",
  Other: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
};

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

const waLink = (p) => `https://wa.me/${p.normalized || String(p.number).replace(/\D/g, "")}`;
const telLink = (p) => `tel:${p.normalized ? "+" + p.normalized : p.number}`;
const primaryOf = (list = []) => list.find((x) => x.isPrimary) || list[0];

// ===== UI kecil =====
const Avatar = ({ contact, size = 48 }) => (
  <div
    style={{ width: size, height: size }}
    className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-500 text-sm font-semibold text-white dark:!bg-[#111122] dark:text-accent border border-white/20"
  >
    {contact.photo ? (
      <img src={contact.photo} alt={contact.name} className="h-full w-full object-cover" />
    ) : (
      contact.name?.[0]?.toUpperCase() || "?"
    )}
  </div>
);

const CategoryBadge = ({ category }) => (
  <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${CATEGORY_STYLE[category] || CATEGORY_STYLE.Other}`}>
    {category}
  </span>
);

const FormSection = ({ title, hint, action, children }) => (
  <div className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
    <div className="mb-3 flex items-center justify-between gap-2">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h4>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
    {children}
  </div>
);

const inputCls = "input-field dark:!bg-slate-100/10 dark:!text-white";

// ===== Form Modal (Create / Edit) =====
const ContactFormModal = ({ initial, onClose, onSaved }) => {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(() => (initial ? fromContact(initial) : emptyForm()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    delete payload._id;
    delete payload.createdBy;
    delete payload.updatedBy;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.isFavorite;
    delete payload.canEdit;

    setSaving(true);
    try {
      const res = isEdit
        ? await api.put(`/contacts/${initial._id}`, payload)
        : await api.post("/contacts", payload);
      toast.success(isEdit ? "Kontak diperbarui" : "Kontak ditambahkan");
      onSaved(res.data.contact);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal menyimpan kontak.");
    } finally {
      setSaving(false);
    }
  };

  const addBtn = (label, onClick, disabled) => (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-secondary !px-3 !py-1 text-xs disabled:opacity-40">
      <Plus size={12} /> {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center md:items-center md:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && onClose()} />

      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/15 dark:bg-[#12121b] md:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/15">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Edit kontak" : "Tambah kontak"}
          </h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {error && (
            <div className="rounded-control bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
          )}

          {/* Identitas */}
          <FormSection title="Identitas">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Avatar contact={form} size={88} />
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
          </FormSection>

          {/* Pekerjaan */}
          <FormSection title="Pekerjaan">
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
          </FormSection>

          {/* Telepon */}
          <FormSection
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
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-700 dark:text-gray-300">
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
          </FormSection>

          {/* Email */}
          <FormSection title="Email" action={addBtn("Email", () => addItem("emails", emptyEmail, 5), form.emails.length >= 5)}>
            {form.emails.length === 0 && <p className="text-xs text-gray-500">Belum ada email.</p>}
            <div className="space-y-2">
              {form.emails.map((m, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-12">
                  <input className={`${inputCls} sm:col-span-3`} value={m.label} maxLength={20} onChange={(e) => setItem("emails", i, { label: e.target.value })} placeholder="Label" />
                  <input type="email" className={`${inputCls} col-span-2 sm:col-span-6`} value={m.address} onChange={(e) => setItem("emails", i, { address: e.target.value })} placeholder="nama@domain.com" />
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 sm:col-span-2">
                    <input type="radio" name="primaryEmail" checked={!!m.isPrimary} onChange={() => setPrimary("emails", i)} /> Utama
                  </label>
                  <button type="button" onClick={() => removeItem("emails", i)} className="flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 sm:col-span-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Alamat */}
          <FormSection title="Alamat" action={addBtn("Alamat", () => addItem("addresses", emptyAddress, 3), form.addresses.length >= 3)}>
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
          </FormSection>

          {/* Sosmed & web */}
          <FormSection title="Sosial media & website" action={addBtn("Akun", () => addItem("socials", emptySocial, 6), form.socials.length >= 6)}>
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
          </FormSection>

          {/* Klasifikasi */}
          <FormSection title="Klasifikasi">
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
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.isEmergency} onChange={(e) => set("isEmergency", e.target.checked)} />
              Tandai sebagai kontak darurat
            </label>
          </FormSection>

          {/* Catatan & akses */}
          <FormSection title="Catatan & akses">
            <Field label="Catatan">
              <textarea className={`${inputCls} min-h-[90px]`} value={form.notes} maxLength={2000} onChange={(e) => set("notes", e.target.value)} placeholder="Info tambahan, riwayat, nomor kontrak, dll." />
              <p className="mt-1 text-right text-[11px] text-gray-500">{form.notes.length}/2000</p>
            </Field>
            <Field label="Visibilitas" className="mt-2">
              <select className={inputCls} value={form.visibility} onChange={(e) => set("visibility", e.target.value)}>
                <option value="public" className="!text-black">Publik — semua user login bisa melihat</option>
                <option value="private" className="!text-black">Privat — hanya saya</option>
              </select>
            </Field>
          </FormSection>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/15">
          <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">Batal</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? "Simpan perubahan" : "Simpan kontak"}
          </button>
        </div>
      </form>
    </div>
  );
};

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

  const [formTarget, setFormTarget] = useState(null); // null | {} (baru) | contact (edit)
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

  const handleSaved = (saved) => {
    setFormTarget(null);
    setDetail((d) => (d && d._id === saved._id ? saved : d));
    fetchContacts();
    fetchStats();
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
        <button onClick={() => setFormTarget({})} className="btn-primary !mb-2">
          <Plus size={16} /> Tambah kontak
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
          onEdit={(c) => setFormTarget(c)}
          onDelete={(c) => setDeleteTarget(c)}
          onFavorite={handleFavorite}
          onContacted={handleContacted}
        />
      )}

      {/* Form */}
      {formTarget && (
        <ContactFormModal
          initial={formTarget._id ? formTarget : null}
          onClose={() => setFormTarget(null)}
          onSaved={handleSaved}
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