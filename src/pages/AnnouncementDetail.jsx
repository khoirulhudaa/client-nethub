import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Info,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import api from "../api/axios.js"; // sesuaikan path

const TYPE_META = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", label: "Info" },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Warning",
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Success",
  },
  important: {
    icon: Ban,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    label: "Important",
  },
};

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/announcements/${id}`);
        setAnnouncement(data.announcement || data);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Pengumuman tidak ditemukan"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="mb-4 text-lg font-medium text-gray-600 dark:text-gray-300">
          {error || "Pengumuman tidak ditemukan"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium !text-white"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      </div>
    );
  }

  const meta = TYPE_META[announcement.type] || TYPE_META.info;
  const Icon = meta.icon;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-white transition hover:text-gray-800 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      {/* Card */}
      <div className="surface-card bg-white dark:bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-4">
        {/* Type badge */}
        <div className="mb-4 flex items-center gap-2">
          <div
            className={`flex h-9 w-9 border-white/10 border items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}
          >
            <Icon size={18} />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {meta.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-xl">
          {announcement.title}
        </h1>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span>
            {new Date(announcement.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          {announcement.expiresAt && (
            <>
              <span>·</span>
              <span>
                Berlaku sampai{" "}
                {new Date(announcement.expiresAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </>
          )}
        </div>

        {/* Content */}
        <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {announcement.content}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;