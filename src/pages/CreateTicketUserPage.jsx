import {
  Check,
  Clock,
  Copy,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Share2,
  Monitor,
  RefreshCcw,
  Search,
  Send,
  TicketPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const SITE_URL = "https://texnet-hub.vercel.app";
const LOCALE = "en-US";

// Keys must match the status values stored in the backend; only the labels are translated.
const statusColor = {
  Baru: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Sedang Dikerjakan": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Menunggu Info": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Selesai: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Ditutup: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const statusLabel = {
  Baru: "New",
  "Sedang Dikerjakan": "In Progress",
  "Menunggu Info": "Waiting for Info",
  Selesai: "Resolved",
  Ditutup: "Closed",
};

// `value` is what gets saved in the backend (unchanged); `label` is what the user sees.
const sinceOptions = [
  { value: "Baru saja", label: "Just now" },
  { value: "Hari ini", label: "Today" },
  { value: "Beberapa hari", label: "A few days" },
  { value: "Minggu ini", label: "This week" },
  { value: "Lebih dari seminggu", label: "More than a week" },
];

// Notches on the top & bottom edges, exactly on the divider between the ticket body and the stub (right).
// Stub width is set via the --stub CSS variable. On small screens the stub moves below, without notches.
const ticketCss = `
@media (min-width: 1024px) {
  .ticket-cut {
    -webkit-mask:
      radial-gradient(circle 14px at calc(100% - var(--stub)) 0, #0000 98%, #000),
      radial-gradient(circle 14px at calc(100% - var(--stub)) 100%, #0000 98%, #000);
    -webkit-mask-composite: source-in;
    mask:
      radial-gradient(circle 14px at calc(100% - var(--stub)) 0, #0000 98%, #000),
      radial-gradient(circle 14px at calc(100% - var(--stub)) 100%, #0000 98%, #000);
    mask-composite: intersect;
  }
}
`;

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none";

// Decorative barcode generated from the ticket code
const Barcode = ({ value = "", height = 40 }) => {
  const bars = useMemo(() => {
    const out = [];
    for (let i = 0; i < 70; i++) {
      const c = value.charCodeAt(i % Math.max(value.length, 1)) || 7;
      out.push({ w: 1 + ((c + i) % 3), gap: 1 + ((c * (i + 1)) % 2) });
    }
    return out;
  }, [value]);

  return (
    <div className="flex items-stretch overflow-hidden" style={{ height }} aria-hidden="true">
      {bars.map((b, i) => (
        <span key={i} className="bg-white/80" style={{ width: b.w, marginRight: b.gap }} />
      ))}
    </div>
  );
};

// Landscape ticket wrapper: body on the left, stub on the right (stub goes below on mobile)
const TicketShell = ({ stubWidth = "16rem", band, children, stub }) => (
  <div className="drop-shadow-2xl w-full mb-6">
    <div
      className="ticket-cut w-[92vw] md:w-[70vw] flex flex-col overflow-hidden rounded-lg md:rounded-2xl border border-white/40 bg-[#12121a9a] lg:flex-row"
      style={{ "--stub": stubWidth }}
    >
      <div className="min-w-0 flex-1">
        {band && (
          <div className="flex items-center justify-between gap-3 bg-blue-500/15 px-2.5 md:px-6 py-3">
            <span className="text-xs font-mono text-white">IT Helpdesk Ticket</span>
            <span className="font-mono text-xs text-white">{band}</span>
          </div>
        )}
        <div className="p-3 md:p-6">{children}</div>
      </div>
      <div className="flex flex-col justify-between gap-6 border-t-2 border-dashed border-white/40 bg-white/[0.03] p-3 md:p-6 lg:w-[var(--stub)] lg:shrink-0 lg:border-l-2 lg:border-t-0">
        {stub}
      </div>
    </div>
  </div>
);

// Ticket-style field: small label + input with a dashed underline
const fieldCls =
  "w-full border-x-0 border-t-0 border-b-2 border-dashed border-white/40 bg-transparent px-0 py-1.5 text-xs text-slate-300 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none";

const Label = ({ children, required }) => (
  <label className="mb-0.5 block text-sm font-semibold text-white">
    {children}
    {required && <span className="ml-0.5 text-red-400">*</span>}
  </label>
);

const CreateTicketUserPage = () => {
  const { user } = useAuth();

  // Tab: "create" | "track"
  const [activeTab, setActiveTab] = useState("create");

  const [options, setOptions] = useState({ categories: [], priorities: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState("");
  const [copied, setCopied] = useState(false);

  // Track Ticket
  const [trackCode, setTrackCode] = useState("");
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(createdTicketId);
      setCopied(true);
      toast.success("Ticket code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      !form.pcOwner.trim() ||
      !form.requesterName.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post("/tickets", form);

      setCreatedTicketId(data.ticket._id);
      setShowSuccessModal(true);

      setForm({
        title: "",
        description: "",
        category: options.categories[0] || "",
        sinceWhen: "Baru saja",
        location: "",
        pcOwner: "",
        computerName: "",
        anydeskNumber: "",
        anydeskPassword: "",
        requesterName: "",
        priority: "Medium",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  // codeOverride is used by the "Track Now" button so it doesn't depend on state that hasn't updated yet
  const handleTrack = async (e, codeOverride) => {
    e?.preventDefault?.();
    if (trackLoading) return;

    const code = (codeOverride ?? trackCode).trim();
    if (!code) {
      toast.error("Enter a ticket code");
      return;
    }

    try {
      setTrackLoading(true);
      setHasSearched(true);
      const { data } = await api.get(`/tickets/public/${code}`);
      setTrackedTicket(data.ticket);
    } catch (err) {
      setTrackedTicket(null);
      toast.error(err.response?.data?.message || "Ticket not found");
    } finally {
      setTrackLoading(false);
    }
  };

  // Opened via a shared link: /user/tickets/create?code=<code>
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;
    setActiveTab("track");
    setTrackCode(code);
    handleTrack(null, code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  // Link that works on anyone's PC/phone: opens the "Track Ticket" tab and loads the ticket
  const buildTrackUrl = (id) => `${SITE_URL}/user/tickets/create?code=${encodeURIComponent(id)}`;

  const openWhatsApp = (text) =>
    // wa.me without a number = WhatsApp lets the user pick a contact/group
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");

  const shareToWhatsApp = ({ id, title }) => {
    openWhatsApp(
      [
        `*IT Helpdesk Ticket*${title ? ` - ${title}` : ""}`,
        `Ticket code: ${id}`,
        "",
        "View / track the ticket here:",
        buildTrackUrl(id),
        "",
        "Install the TEXNet app:",
        `${SITE_URL}/install`,
      ].join("\n")
    );
  };

  const sharePageToWhatsApp = () => {
    openWhatsApp(
      [
        "TEXNet - IT Helpdesk:",
        `${SITE_URL}/ticket`,
        "",
        "Install the TEXNet app:",
        `${SITE_URL}/install`,
      ].join("\n")
    );
  };

  const panel = "rounded-2xl border border-white/10 bg-white/[0.03] p-5";

  return (
    <div className="relative h-max md:h-max bg-[#0a0a12] md:overflow-hidden overflow-x-hidden text-white">
      <style>{ticketCss}</style>
      <img
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        src="/sidebar.png" alt="wallpaper-sidebar" className={`rotate-[14deg] scale-[2] w-full h-screen dark:flex hidden object-cover absolute z-0 top-0 opacity-10 left-0`} 
      />
      
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-blue-950/90 via-transparent to-purple-800/20" />

      <div className="relative mx-auto w-full h-max overflow-hidden flex flex-col items-center md:justify-center px-2 md:!px-4 py-4 md:py-6 md:!max-w-7xl">
        {/* Tabs */}
        <div className="w-[92vw] md:w-[70vw] mb-6 flex gap-x-1.5 rounded-xl md:rounded-[20px] border border-white/40 bg-white/[0.03] p-2">
          {[
            { key: "create", label: "Create Ticket", icon: TicketPlus },
            { key: "track", label: "Track Ticket", icon: Search },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex items-center gap-2 justify-center border border-white/20 rounded-lg md:rounded-[16px] py-2 md:py-3 text-sm font-medium transition ${
                activeTab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {t.icon && <t.icon size={16} />}
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={sharePageToWhatsApp}
            aria-label="Share this page on WhatsApp"
            className="flex items-center justify-center gap-2 rounded-lg md:rounded-[16px] border border-white/20 bg-emerald-600 px-4 py-2 md:py-3 text-sm font-medium text-white transition hover:bg-emerald-500 active:scale-[0.99]"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* ==================== TAB: CREATE TICKET ==================== */}
        {activeTab === "create" && (
          <form onSubmit={handleSubmit}>
            <TicketShell
              stubWidth="19rem"
              band="New ticket"
              stub={
                <>
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                      <LifeBuoy size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Ready to send?</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-400">
                        The ticket code is generated automatically once the ticket is sent. Keep
                        the code to track its progress.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 relative top-[-7.2px]">
                    <div className="w-full flex items-center justify-center">
                      <Barcode value="TEXNET" height={40} />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-500 border border-white/40 disabled:opacity-60"
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
                </>
              }
            >
              <div className="space-y-6">
                {/* Title (like a ticket heading) */}
                <div>
                  <Label required>Problem title</Label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Example: Can't connect to WiFi in the Meeting Room"
                    className={`${fieldCls} font-semibold tracking-tight`}
                    required
                  />
                </div>

                {/* Category (left) + priority (right) */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label required>Category</Label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className={`${fieldCls} text-md font-semibold`}
                    >
                      {options.categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#0c0c18] text-xs">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-40">
                    <Label>Priority</Label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className={`${fieldCls} text-md font-semibold sm:text-left`}
                    >
                      {options.priorities.map((p) => (
                        <option key={p} value={p} className="bg-[#0c0c18] text-xs">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* "Route": reporter -> location */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <Label required>Reporter</Label>
                    <input
                      type="text"
                      name="requesterName"
                      value={form.requesterName}
                      onChange={handleChange}
                      placeholder="Name - Position"
                      className={`${fieldCls} text-xs font-medium`}
                      required
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label required>Location / room</Label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Example: IT Room, 2nd Floor"
                      className={`${fieldCls} text-xs font-medium sm:text-left`}
                      required
                    />
                  </div>
                </div>

                {/* Device details, laid out like the grid on the ticket */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                  <div>
                    <Label required>PC owner</Label>
                    <input
                      type="text"
                      name="pcOwner"
                      value={form.pcOwner}
                      onChange={handleChange}
                      className={fieldCls}
                      required
                    />
                  </div>
                  <div>
                    <Label required>Since when</Label>
                    <select
                      name="sinceWhen"
                      value={form.sinceWhen}
                      onChange={handleChange}
                      className={fieldCls}
                    >
                      {sinceOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#0c0c18]">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-4 gap-y-5">
                  <div>
                    <Label>Computer name / IP</Label>
                    <input
                      type="text"
                      name="computerName"
                      value={form.computerName}
                      onChange={handleChange}
                      placeholder="PC-HRD-01 / 192.168.1.45"
                      className={fieldCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:space-y-0 space-y-6 md:grid-cols-2 gap-x-4">
                  <div>
                    <Label>AnyDesk number (optional)</Label>
                    <input
                      type="text"
                      name="anydeskNumber"
                      value={form.anydeskNumber}
                      onChange={handleChange}
                      placeholder="123 456 789"
                      className={`${fieldCls} font-mono`}
                    />
                  </div>
                  <div>
                    <Label>AnyDesk password (optional)</Label>
                    <input
                      type="text"
                      name="anydeskPassword"
                      value={form.anydeskPassword}
                      onChange={handleChange}
                      placeholder="Temporary password"
                      className={`${fieldCls} font-mono`}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label required>Problem description</Label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the symptoms, what you've tried, any error messages..."
                    className="mt-1 w-full resize-none rounded-xl border-2 border-dashed border-white/40 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-slate-300 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </TicketShell>
          </form>
        )}

        {/* ==================== TAB: TRACK TICKET ==================== */}
        {activeTab === "track" && (
          <div className="w-[92vw] md:w-[70vw] min-h-screen space-y-5">
            <form onSubmit={handleTrack} className={panel}>
              <label className="mb-2 block text-sm font-medium text-white">Ticket Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  placeholder="Paste your ticket code here..."
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="submit"
                  disabled={trackLoading}
                  aria-label="Search ticket"
                  className="flex w-[48px] items-center justify-center rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {trackLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleTrack()}
                  disabled={trackLoading}
                  aria-label="Refresh"
                  className="flex w-[48px] items-center justify-center rounded-xl bg-green-600 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-60"
                >
                  {trackLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                </button>
              </div>
            </form>

            {trackLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-400" size={28} />
              </div>
            )}

            {!trackLoading && hasSearched && !trackedTicket && (
              <div className="rounded-2xl border border-dashed border-white/40 py-12 text-center text-gray-400">
                Ticket not found
              </div>
            )}

            {!trackLoading && trackedTicket && (
              <div className="space-y-4">
                {/* ===== TICKET ===== */}
                <TicketShell
                  stubWidth="16rem"
                  band={`#${String(trackedTicket._id).slice(-8).toUpperCase()}`}
                  stub={
                    <>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Status</p>
                        <span
                          className={`mt-1.5 inline-flex text-sm font-semibold ${
                            statusColor[trackedTicket.status] || statusColor.Baru
                          }`}
                        >
                          {statusLabel[trackedTicket.status] || trackedTicket.status}
                        </span>
                      </div>
                      <div>
                        <Barcode value={String(trackedTicket._id)} height={40} />
                        <p className="mt-2 select-all break-all font-mono text-[11px] text-blue-400">
                          {trackedTicket._id}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            shareToWhatsApp({ id: trackedTicket._id, title: trackedTicket.title })
                          }
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 active:scale-[0.99]"
                        >
                          <Share2 size={16} /> Share on WhatsApp
                        </button>
                      </div>
                    </>
                  }
                >
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">{trackedTicket.title}</h2>
                      <p className="mt-1 text-sm text-gray-400">{trackedTicket.category}</p>
                    </div>

                    {/* "Route": reporter -> location */}
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500">Reporter</p>
                        <p className="truncate text-xs font-medium">{trackedTicket.requesterName}</p>
                      </div>
                      <div className="flex flex-1 items-center gap-2 text-blue-400">
                        <span className="h-0 flex-1 border-t-2 border-dotted border-current opacity-50" />
                        <Monitor size={18} />
                        <span className="h-0 flex-1 border-t-2 border-dotted border-current opacity-50" />
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="text-xs font-semibold text-gray-500">Location</p>
                        <p className="truncate text-xs font-medium">{trackedTicket.location}</p>
                      </div>
                    </div>

                    <div className="border-t-2 border-dashed border-white/40" />

                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                      {trackedTicket.description}
                    </p>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-500">PC owner</p>
                        <p className="mt-0.5">{trackedTicket.pcOwner}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Priority</p>
                        <p className="mt-0.5">{trackedTicket.priority}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Created</p>
                        <p className="mt-0.5">
                          {new Date(trackedTicket.createdAt).toLocaleString(LOCALE)}
                        </p>
                      </div>
                    </div>
                  </div>
                </TicketShell>

                {/* Comments */}
                <div className={panel}>
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                    <MessageSquare size={16} />
                    Comments / Updates
                  </h3>

                  {!trackedTicket.comments?.length ? (
                    <p className="text-sm text-gray-500">No comments yet</p>
                  ) : (
                    <div className="space-y-4">
                      {trackedTicket.comments.map((c, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
                            {c.user?.name?.[0]?.toUpperCase() || "A"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{c.user?.name || "Admin"}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(c.createdAt).toLocaleString(LOCALE)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-300">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== SUCCESS MODAL (ticket with the code on the stub) ===== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative max-h-[92vh] flex items-center justify-center overflow-y-auto">
            <TicketShell
              stubWidth="15rem"
              band="Ticket Sent"
              stub={
                <>
                  {/* <p className="text-xs font-semibold text-white">Your Ticket Code</p> */}
                  <div className="w-full md:pt-0 pt-1 h-full flex items-center justify-center flex-col">
                    <Barcode value={createdTicketId} height={40} />
                    <p className="mt-2 select-all break-all font-mono text-xs text-blue-300">
                      {createdTicketId}
                    </p>
                  </div>
                </>
              }
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-md font-semibold">Ticket Sent Successfully!</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Keep the ticket code on the stub to track its progress.
                </p>

                <div className="mt-5 w-full grid grid-cols-2 md:grid-cols-4 items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm text-white hover:bg-blue-500/60 active:scale-[0.99]"
                  >
                    {copied ? (
                      <>
                        <Check size={16} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Copy Ticket
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setTrackCode(createdTicketId);
                      setActiveTab("track");
                      setShowSuccessModal(false);
                      handleTrack(null, createdTicketId);
                    }}
                    className="w-full rounded-xl border border-white/10 py-2.5 text-sm text-gray-300 hover:bg-slate-600/10 active:scale-[0.99]"
                  >
                    Track Now
                  </button>

                  <button
                    onClick={() => shareToWhatsApp({ id: createdTicketId })}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm text-white hover:bg-emerald-500/60 active:scale-[0.99]"
                  >
                    <Share2 size={16} /> Share WA
                  </button>
                 
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full rounded-xl bg-red-600 border border-white/10 py-2.5 text-sm text-white hover:bg-red-600/80 active:scale-[0.99]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </TicketShell>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicketUserPage;