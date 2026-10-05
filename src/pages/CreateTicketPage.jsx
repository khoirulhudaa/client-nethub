import {
    ArrowLeft,
    Loader2,
    Send
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const CreateTicketPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [options, setOptions] = useState({
    categories: [],
    priorities: [],
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    sinceWhen: "Baru saja",
    location: "",
    pcOwner: user?.name || "",
    computerName: "",
    requesterName: "",
    anydeskNumber: "",
    anydeskPassword: "",
    priority: "Medium",
    attachments: [],
  });

  const sinceOptions = [
    "Baru saja",
    "Hari ini",
    "Beberapa hari",
    "Minggu ini",
    "Lebih dari seminggu",
  ];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/tickets/options");
        setOptions(data);
        if (data.categories?.length) {
          setForm((prev) => ({ ...prev, category: data.categories[0] }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.location.trim() || !form.pcOwner.trim()) {
      alert("Mohon lengkapi field wajib");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post("/tickets", form);
      navigate(`/tickets/${data.ticket._id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal membuat tiket");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl md:border-x border-white dark:border-white/10 md:p-6 p-4">
        {/* Header */}
        <div className="mb-6">
            <div className="flex items-center gap-2 text-accent">
            <span className="text-xs font-semibold uppercase tracking-wider">Support</span>
            </div>
            <h1 className="text-xl font-medium tracking-tight text-white">Buat Tiket Bantuan</h1>
        </div>

        <div className="surface-card rounded-3xl border border-white/10 dark:!bg-white/5 p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-300">
                        Nama Pelapor <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        name="requesterName"
                        value={form.requesterName}
                        onChange={handleChange}
                        placeholder="Nama kamu yang sedang lapor"
                        className="..."
                        required
                    />
                    </div>
                {/* Judul */}
                <div>
                <label className="mb-1.5 block text-sm font-medium text-white/90">
                    Judul Masalah <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Contoh: Tidak bisa konek WiFi di Ruang Meeting"
                    className="w-full rounded-xl border border-white/10 bg-slate-100/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                    required
                />
                </div>

                {/* Deskripsi */}
                <div>
                <label className="mb-1.5 block text-sm font-medium text-white/90">
                    Deskripsi Lengkap <span className="text-red-400">*</span>
                </label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Jelaskan gejala, apa yang sudah dicoba, pesan error (jika ada)..."
                    className="w-full rounded-xl border border-white/10 bg-slate-100/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none resize-none"
                    required
                />
                </div>

                {/* Kategori & Prioritas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/90">
                    Kategori <span className="text-red-400">*</span>
                    </label>
                    <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-100/10 px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
                    >
                    {options.categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#0c0c18]">
                        {cat}
                        </option>
                    ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/90">Prioritas</label>
                    <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-100/10 px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
                    >
                    {options.priorities.map((p) => (
                        <option key={p} value={p} className="bg-[#0c0c18]">
                        {p}
                        </option>
                    ))}
                    </select>
                </div>
                </div>

                {/* Sejak Kapan */}
                <div>
                <label className="mb-1.5 block text-sm font-medium text-white/90">
                    Sejak Kapan Masalah Terjadi <span className="text-red-400">*</span>
                </label>
                <select
                    name="sinceWhen"
                    value={form.sinceWhen}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-100/10 px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
                >
                    {sinceOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0c0c18]">
                        {opt}
                    </option>
                    ))}
                </select>
                </div>

                {/* Lokasi & Pemilik */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/90">
                    Lokasi / Ruangan <span className="text-red-400">*</span>
                    </label>
                    <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Contoh: Ruang IT, Lantai 2"
                    className="w-full rounded-xl border border-white/10 bg-slate-100/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                    required
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/90">
                    Pemilik PC / User <span className="text-red-400">*</span>
                    </label>
                    <input
                    type="text"
                    name="pcOwner"
                    value={form.pcOwner}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-100/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                    required
                    />
                </div>
                </div>

                {/* Nama Komputer */}
                <div>
                <label className="mb-1.5 block text-sm font-medium text-white/90">
                    Nama Komputer / IP Address
                </label>
                <input
                    type="text"
                    name="computerName"
                    value={form.computerName}
                    onChange={handleChange}
                    placeholder="Contoh: PC-HRD-01 atau 192.168.1.45"
                    className="w-full rounded-xl border border-white/10 bg-slate-100/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                />
                </div>

                {/* AnyDesk */}
                <div className="rounded-2xl border border-white/10 bg-slate-100/10 p-4">
                <p className="mb-3 text-sm font-medium text-white/90">Remote Access (Opsional)</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                    <label className="mb-1.5 block text-xs text-gray-400">Nomor AnyDesk</label>
                    <input
                        type="text"
                        name="anydeskNumber"
                        value={form.anydeskNumber}
                        onChange={handleChange}
                        placeholder="Contoh: 123 456 789"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                    />
                    </div>
                    <div>
                    <label className="mb-1.5 block text-xs text-gray-400">Password AnyDesk</label>
                    <input
                        type="text"
                        name="anydeskPassword"
                        value={form.anydeskPassword}
                        onChange={handleChange}
                        placeholder="Password sementara"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                    />
                    </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    Data ini akan otomatis dihapus setelah tiket selesai.
                </p>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >
                    {submitting ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Mengirim...
                    </>
                    ) : (
                    <>
                        <Send size={16} />
                        Kirim Tiket
                    </>
                    )}
                </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default CreateTicketPage;