import { BookOpen, CheckCircle2, Loader2, MessageSquare, Monitor, Send, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast"; // <- adjust to the toast library you use
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const statusColor = {
  Baru: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Sedang Dikerjakan": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Menunggu Info": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Selesai: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Ditutup: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

// Display labels only. The keys stay as the values stored in the backend.
const statusLabel = {
  Baru: "New",
  "Sedang Dikerjakan": "In Progress",
  "Menunggu Info": "Waiting for Info",
  Selesai: "Completed",
  Ditutup: "Closed",
};

// Ticket notch at the boundary between the ticket body and the stub.
// Uses a mask so the cut-out is truly transparent, whatever the page background is.
const ticketCss = `
@media (min-width: 1024px) {
  .ticket-mask {
    -webkit-mask:
      radial-gradient(circle 14px at calc(100% - 18rem) 0, #0000 98%, #000),
      radial-gradient(circle 14px at calc(100% - 18rem) 100%, #0000 98%, #000);
    -webkit-mask-composite: source-in;
    mask:
      radial-gradient(circle 14px at calc(100% - 18rem) 0, #0000 98%, #000),
      radial-gradient(circle 14px at calc(100% - 18rem) 100%, #0000 98%, #000);
    mask-composite: intersect;
  }
}
`;

// Decorative barcode generated from the ticket ID (always the same for the same ticket)
const Barcode = ({ value = "" }) => {
  const bars = useMemo(() => {
    const out = [];
    for (let i = 0; i < 88; i++) {
      const c = value.charCodeAt(i % Math.max(value.length, 1)) || 7;
      out.push({ w: 1 + ((c + i) % 3), gap: 1 + ((c * (i + 1)) % 2) });
    }
    return out;
  }, [value]);

  return (
    <div className="flex h-12 items-stretch overflow-hidden" aria-hidden="true">
      {bars.map((b, i) => (
        <span
          key={i}
          className="bg-slate-800 dark:bg-white/80"
          style={{ width: b.w, marginRight: b.gap }}
        />
      ))}
    </div>
  );
};

const Field = ({ label, children, mono = false }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 dark:text-gray-500">{label}</p>
    <p className={`mt-0.5 text-sm dark:text-white ${mono ? "font-mono" : ""}`}>{children}</p>
  </div>
);

const TearLine = () => <div className="border-t-2 border-dashed border-slate-300 dark:border-white/15" />;

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "superAdmin" || user?.role === "admin";

  const [ticket, setTicket] = useState(null);
  const [bestGuide, setBestGuide] = useState(null);
  const [recommendedGuides, setRecommendedGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("Baru");
  const [statusNote, setStatusNote] = useState("");

  const fetchTicket = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data.ticket);
      setBestGuide(data.bestGuide);
      setRecommendedGuides(data.recommendedGuides || []);
    } catch (err) {
      console.error(err);
      toast.error("Ticket not found");
      navigate("/tickets");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  // The status select always follows the latest ticket status
  useEffect(() => {
    if (ticket?.status) setNewStatus(ticket.status);
  }, [ticket?.status]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      setSubmittingComment(true);
      await api.post(`/tickets/${id}/comments`, { content: comment });
      setComment("");
      await fetchTicket(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      setUpdatingStatus(true);
      const { data } = await api.patch(`/tickets/${id}/status`, {
        status: newStatus,
        note: statusNote.trim(),
      });
      if (data.ticket) {
        setTicket(data.ticket);
        setNewStatus(data.ticket.status);
      } else {
        await fetchTicket(true);
      }
      setStatusNote("");
      toast.success("Status updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (!ticket) return null;

  const reporterName = ticket.requesterName || ticket.createdBy?.name || "-";

  // Short month names (id-ID): Jan, Feb, Mar, Apr, Mei, Jun, Jul, Agu, Sep, Okt, Nov, Des
  const createdAt = new Date(ticket.createdAt).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const shortCode = String(ticket._id).slice(-8).toUpperCase();

  const card = "rounded-2xl border border-white/10 bg-white dark:bg-[#0c0c18] p-5";

  return (
    <div className="mx-auto min-h-screen max-w-7xl md:border-x border-white dark:border-white/10 md:p-6">
      <style>{ticketCss}</style>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 rounded-3xl">
        {/* Left */}
        <div className="lg:col-span-2 space-y-3">
          {/* ===== TICKET ===== */}
          <div className="drop-shadow-xl">
            <div className="ticket-mask flex flex-col lg:flex-row overflow-hidden rounded-3xl border border-white/10 bg-white dark:bg-[#0c0c18]">
              {/* Ticket body */}
              <div className="flex-1 min-w-0">
                {/* Top ribbon */}
                <div className="flex items-center justify-between gap-3 bg-accent/20 px-5 py-3">
                  <span className="text-sm font-semibold text-white">IT Helpdesk Ticket</span>
                  <span className="font-mono text-xs text-slate-500 dark:text-gray-400">#{shortCode}</span>
                </div>

                <div className="p-5 space-y-5">
                  {/* Category + priority */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-gray-500">Category</p>
                      <h2 className="text-xl font-semibold tracking-tight dark:text-white">
                        {ticket.category}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 dark:text-gray-500">Priority</p>
                      <p className="text-lg font-semibold dark:text-white">{ticket.priority}</p>
                    </div>
                  </div>

                  {/* "Route": reporter -> device/location */}
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-500 dark:text-gray-500">Reporter</p>
                      <p className="truncate text-base font-medium dark:text-white">{reporterName}</p>
                    </div>
                    <div className="flex flex-1 items-center gap-2 text-accent">
                      <span className="h-0 flex-1 border-t-2 border-dotted border-current opacity-50" />
                      <Monitor size={18} />
                      <span className="h-0 flex-1 border-t-2 border-dotted border-current opacity-50" />
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-xs font-semibold text-slate-500 dark:text-gray-500">Location</p>
                      <p className="truncate text-base font-medium dark:text-white">{ticket.location}</p>
                    </div>
                  </div>
                </div>

                <TearLine />

                {/* Details */}
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Field label="Reported at">{createdAt}</Field>
                    <Field label="Since when">{ticket.sinceWhen}</Field>
                    <Field label="PC owner">{ticket.pcOwner}</Field>
                    <Field label="Computer name / IP">{ticket.computerName || "-"}</Field>
                    {ticket.anydeskNumber && (
                      <>
                        <Field label="AnyDesk number" mono>{ticket.anydeskNumber}</Field>
                        <Field label="AnyDesk password" mono>{ticket.anydeskPassword || "-"}</Field>
                      </>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-gray-500">Problem description</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed dark:text-gray-300">
                      {ticket.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket stub (w-72 = 18rem, must match the number in the CSS mask) */}
              <div className="flex flex-col justify-between gap-6 border-t-2 border-dashed border-slate-300 dark:border-white/15 p-6 lg:w-72 lg:border-l-2 lg:border-t-0 bg-slate-50 dark:bg-white/[0.03]">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-gray-500">Status</p>
                    <span
                      className={`mt-1 inline-flex pb-[3px] text-sm font-semibold ${
                        statusColor[ticket.status] || statusColor.Ditutup
                      }`}
                    >
                      {statusLabel[ticket.status] || ticket.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-gray-500">Reported by</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-sm font-semibold text-accent">
                        {ticket.createdBy?.name?.[0]?.toUpperCase() || <User size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium dark:text-white">
                          {ticket.createdBy?.name || "-"}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-gray-500">
                          {ticket.createdBy?.title || "User"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Barcode value={String(ticket._id)} className="w-full" />
                  <p className="mt-2 select-all break-all font-mono text-[11px] text-blue-500 dark:text-blue-400">
                    {ticket._id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== DISCUSSION ===== */}
          <div className={card}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold dark:text-white">
              <MessageSquare size={16} />
              Discussion
            </h2>

            <div className="mb-5 space-y-3">
              {ticket.comments?.length === 0 && (
                <p className="text-sm text-gray-500">No comments yet</p>
              )}
              {ticket.comments?.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-xs font-semibold text-accent">
                    {c.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium dark:text-white">{c.user?.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(c.createdAt).toLocaleString("id-ID")}
                      </span>
                      {c.isInternal && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">
                          Internal
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm dark:text-gray-300">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !comment.trim()}
                className="rounded-xl bg-accent px-4 py-2.5 text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {submittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-3">
          {bestGuide && (
            <div className="rounded-2xl border border-accent/40 bg-accent/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-accent">
                <CheckCircle2 size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Top Recommended
                </span>
              </div>
              <Link to={`/posts/${bestGuide.slug}`} className="group block">
                <h3 className="font-medium text-white group-hover:underline">{bestGuide.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-400">{bestGuide.excerpt}</p>
                <span className="mt-2 inline-block text-xs text-accent">{bestGuide.category}</span>
              </Link>
            </div>
          )}

          <div className={card}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold dark:text-white">
              <BookOpen size={16} />
              Related Guides
            </h2>

            {recommendedGuides.length === 0 ? (
              <p className="text-sm text-gray-500">No recommendations at the moment</p>
            ) : (
              <div className="space-y-3">
                {recommendedGuides.map((guide) => (
                  <Link
                    key={guide._id}
                    to={`/posts/${guide.slug}`}
                    className="block rounded-xl border border-white/5 bg-black/20 p-3 transition hover:bg-black/40"
                  >
                    <h4 className="line-clamp-1 text-sm font-medium text-white">{guide.title}</h4>
                    <p className="mt-0.5 text-xs text-gray-500">{guide.category}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className={card}>
              <h2 className="mb-3 text-sm font-semibold dark:text-white">Update Status</h2>

              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mb-3 w-full cursor-pointer rounded-xl border border-white/10 bg-slate-200 px-3 py-2.5 text-sm hover:brightness-90 dark:bg-[#0c0c18] dark:text-white"
              >
                {Object.keys(statusColor).map((s) => (
                  <option key={s} value={s} className="bg-[#0c0c18] text-white">
                    {statusLabel[s]}
                  </option>
                ))}
              </select>

              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={2}
                placeholder="Progress note (optional)..."
                className="mb-3 w-full resize-none rounded-xl border border-white/10 bg-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-gray-500 dark:bg-[#0c0c18] dark:text-white"
              />

              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {updatingStatus ? "Saving..." : "Save Status"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;