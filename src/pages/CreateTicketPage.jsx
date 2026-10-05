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
            <h1 className="text-xl font-medium tracking-tight text-white">Create Support Ticket</h1>
        </div>

        <div className="surface-card rounded-3xl border border-white/10 dark:!bg-white/5 p-5">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="mb-1.5 block text-sm font-medium">
                        Your Name and Position <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        name="requesterName"
                        value={form.requesterName}
                        onChange={handleChange}
                        placeholder="Example: John Doe - IT Staff"
                        className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm dark:!bg-slate-100/10 dark:!text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition"
                        required
                    />
                </div>
                {/* Judul */}
                <div>
                <label className="mb-1.5 block text-sm font-medium">
                    Issue Title <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Example: Cannot connect to WiFi in Meeting Room"
                    className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm dark:!bg-slate-100/10 dark:!text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                    required
                />
                </div>

                {/* Deskripsi */}
                <div>
                <label className="mb-1.5 block text-sm font-medium">
                    Complete Description <span className="text-red-400">*</span>
                </label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe the symptoms, what you've already tried, and any error messages..."
                    className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm dark:!bg-slate-100/10 dark:!text-white placeholder:text-gray-500 focus:border-accent focus:outline-none resize-none"
                    required
                />
                </div>

                {/* Kategori & Prioritas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-medium">
                    Category <span className="text-red-400">*</span>
                    </label>
                    <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm dark:!bg-slate-100/10 dark:!text-white focus:border-accent focus:outline-none"
                    >
                    {options.categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#0c0c18]">
                        {cat}
                        </option>
                    ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium">
                        Priority <span className="text-red-400">*</span>
                    </label>
                    <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm dark:!bg-slate-100/10 dark:!text-white focus:border-accent focus:outline-none"
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
                <label className="mb-1.5 block text-sm font-medium">
                    Since When Did the Issue Occur <span className="text-red-400">*</span>
                </label>
                <select
                    name="sinceWhen"
                    value={form.sinceWhen}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm dark:!bg-slate-100/10 dark:!text-white focus:border-accent focus:outline-none"
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
                    <label className="mb-1.5 block text-sm font-medium">
                    Location / Room <span className="text-red-400">*</span>
                    </label>
                    <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Example: IT Room, Floor 2"
                    className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm dark:!bg-slate-100/10 dark:!text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                    required
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium">
                    PC Owner / User <span className="text-red-400">*</span>
                    </label>
                    <input
                    type="text"
                    name="pcOwner"
                    value={form.pcOwner}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm dark:!bg-slate-100/10 dark:!text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                    required
                    />
                </div>
                </div>

                {/* Nama Komputer */}
                <div>
                <label className="mb-1.5 block text-sm font-medium">
                    Computer Name / IP Address
                </label>
                <input
                    type="text"
                    name="computerName"
                    value={form.computerName}
                    onChange={handleChange}
                    placeholder="Example: PC-HRD-01 or 192.168.1.45"
                    className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm dark:!bg-slate-100/10 dark:!text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
                />
                </div>

                {/* AnyDesk */}
                <div className="rounded-2xl border border-white/10 p-4">
                <p className="mb-3 text-sm font-medium">Remote Access (Opsional)</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                    <label className="mb-1.5 block text-xs text-gray-400">Number AnyDesk</label>
                    <input
                        type="text"
                        name="anydeskNumber"
                        value={form.anydeskNumber}
                        onChange={handleChange}
                        placeholder="Example: 123 456 789"
                        className="w-full rounded-xl border border-white/10 dark:!bg-slate-100/10 dark:!text-white px-4 py-2.5 text-sm placeholder:text-gray-500 focus:border-accent focus:outline-none"
                    />
                    </div>
                    <div>
                    <label className="mb-1.5 block text-xs text-gray-400">Password AnyDesk</label>
                    <input
                        type="text"
                        name="anydeskPassword"
                        value={form.anydeskPassword}
                        onChange={handleChange}
                        placeholder="Temporary Password"
                        className="w-full rounded-xl border border-white/10 dark:!bg-slate-100/10 dark:!text-white px-4 py-2.5 text-sm placeholder:text-gray-500 focus:border-accent focus:outline-none"
                    />
                    </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    This data will be automatically deleted once the ticket is closed.
                </p>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/5"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >
                    {submitting ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                    </>
                    ) : (
                    <>
                        <Send size={16} />
                        Send Ticket
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