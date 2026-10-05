import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  LifeBuoy,
  Send,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const CreateTicketUserPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [options, setOptions] = useState({
    categories: [],
    priorities: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    sinceWhen: "Baru saja",
    location: "",
    pcOwner: user?.name || "",
    computerName: "",
    anydeskNumber: "",
    anydeskPassword: "",
    requesterName: "",
    priority: "Medium",
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
    if (!form.title.trim() || !form.description.trim() || !form.location.trim() || !form.pcOwner.trim() || !form.requesterName.trim()) {
      alert("Mohon lengkapi semua field yang wajib diisi");
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
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">

      {/* Background subtle */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/90 via-transparent to-purple-800/20 pointer-events-none" />

      <div className="relative mx-auto w-[97vw] md:!max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">

          <div className="flex flex-col text-center items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
              <LifeBuoy size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Create a Support Ticket</h1>
              <p className="text-sm text-gray-400">
                Describe your issue, we will help you as soon as possible
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-sm"
        >
          <div className="space-y-5">
             <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Your Name and Position <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    name="requesterName"
                    value={form.requesterName}
                    onChange={handleChange}
                    placeholder="Example: John Doe - IT Staff"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition"
                    required
                />
            </div>
            {/* Judul */}
            <div></div>
            {/* Judul */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Issue Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: Cannot connect to WiFi in Meeting Room"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Complete Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the symptoms, what you've already tried, and any error messages..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition resize-none"
                required
              />
            </div>

            {/* Kategori & Prioritas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {options.categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0c0c18]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Priority <span className="text-red-400">*</span>
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {options.priorities.map((p) => (
                    <option key={p} value={p} className="bg-[#0c0c18]">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Since When */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                When Did the Issue Occur <span className="text-red-400">*</span>
              </label>
              <select
                name="sinceWhen"
                value={form.sinceWhen}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
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
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Location / Room <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Example: IT Room 2nd Floor"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  PC Owner / User <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="pcOwner"
                  value={form.pcOwner}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Nama Komputer */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Computer Name / IP Address
              </label>
              <input
                type="text"
                name="computerName"
                value={form.computerName}
                onChange={handleChange}
                placeholder="Example: PC-HRD-01 or 192.168.1.45"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* AnyDesk Section */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-4 text-sm font-medium text-gray-300">
                Remote Access <span className="text-gray-500">(Opsional)</span>
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-gray-500">
                    AnyDesk Number
                  </label>
                  <input
                    type="text"
                    name="anydeskNumber"
                    value={form.anydeskNumber}
                    onChange={handleChange}
                    placeholder="123 456 789"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-gray-500">
                    AnyDesk Password
                  </label>
                  <input
                    type="text"
                    name="anydeskPassword"
                    value={form.anydeskPassword}
                    onChange={handleChange}
                    placeholder="Temporary Password"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                This data will be automatically deleted after the ticket is resolved.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 gap-3 grid grid-cols-2 sm:justify-end">
            <Link
              to="/tickets"
              className="w-full inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending Ticket...
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

        {/* Footer kecil */}
        <p className="mt-8 text-center text-xs text-gray-600">
          TEXNet Support • Bantuan IT Internal
        </p>
      </div>
    </div>
  );
};

export default CreateTicketUserPage;