import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Info,
  ArrowLeft,
  Loader2,
  Hash,
  ImagePlus,
  Megaphone,
} from "lucide-react";
import api from "../api/axios.js";

const TYPE_META = {
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    label: "Warning",
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    label: "Success",
  },
  important: {
    icon: Megaphone,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
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

  // if (loading) {
  //   return (
  //     <div className="md:p-6 md:border-x border-white dark:border-white/10 min-h-screen">
  //       <div className="flex surface-card justify-center flex-col h-full items-center text-center py-20">
  //         <img src="/cloud.png" alt="icon-cloud" className="w-20" />
  //         <p className="mt-2">Load content ...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error || !announcement) {
    return (
      <div className="md:p-6 md:border-x border-white dark:border-white/10 min-h-screen">
       <div className="flex surface-card justify-center flex-col h-full items-center text-center py-20">
          <p className="mb-3 text-lg font-medium text-slate-900 dark:text-gray-300">
            {error || "Pengumuman tidak ditemukan"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-md font-medium !text-white"
          >
            <ArrowLeft size={16} />
            Back now
          </button>
        </div>
      </div>
    );
  }

  const meta = TYPE_META[announcement.type] || TYPE_META.info;
  const Icon = meta.icon;

  return (
    <div className="mx-auto max-w-full min-h-screen md:border-x border-white dark:border-white/10 px-0 py-0 md:p-6">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-2 text-accent">
          <span className="text-xs font-medium uppercase tracking-wide">
            Detail Guide
          </span>
        </div>
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Start Reading
        </h1>
      </div>

      {/* Card */}
      <article className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none">
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] h-[280px] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
          {announcement.thumbnail ? (
            <img
              src={announcement.thumbnail}
              alt={announcement.title}
              className="h-full w-full object-cover hover:scale-[1.1] duration-300 ease-out grayscale-[60%] hover:grayscale-[0%]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImagePlus
                size={36}
                className="text-gray-300 dark:text-gray-600"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        <div className="p-4 md:p-4 md:py-5">
          {/* Type badge */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${meta.bg} ${meta.color}`}
            >
              <Icon size={12} strokeWidth={2.5} />
              {meta.label}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-xl">
            {announcement.title}
          </h1>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-900 dark:text-gray-400">
            {announcement.createdBy?.name && (
              <>
                <span className="font-medium text-slate-900 dark:text-gray-400">
                  {announcement.createdBy.name}
                </span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
              </>
            )}
            <span>
              {new Date(announcement.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            {announcement.expiresAt && (
              <>
                <span className="text-slate-900 dark:text-gray-600">·</span>
                <span>
                  Berlaku sampai{" "}
                  {new Date(announcement.expiresAt).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              </>
            )}
          </div>

          {/* Hashtags */}
          {announcement.hashtags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {announcement.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 rounded-md bg-gray-100 px-2.5 py-1 text-[12px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300"
                >
                  <Hash size={11} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="my-6 border-t border-slate-200 dark:border-white/[0.06]" />

          {/* Content */}
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
            {announcement.content}
          </div>
        </div>
      </article>
    </div>
  );
};

export default AnnouncementDetail;