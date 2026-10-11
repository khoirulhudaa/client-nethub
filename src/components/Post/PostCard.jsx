import { BookPlus, Check, ChevronRight, Eye, Link2, Link2Icon, Loader2, Pin, PinOffIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import CategoryPill from "../UI/CategoryPill.jsx";

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return "just now";
};

const PostCard = ({ slug, post, roundedNormal = false, featured = false, status = true, onPinChange, hideImage = false }) => {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const isGuest = user?.isGuest || user?.role === "guest";
  const canPin = !!user && !isGuest;

  const [pinned, setPinned] = useState(!!post.isPinned);
  const [pinning, setPinning] = useState(false);


  const postUrl = `${window.location.origin}/posts/${post?.slug}?ref=share`;

  const createShareText = () => {
    const title = post?.title || "Guide";
    const category = post?.category || "";
    const author = post?.author?.name || "";
    const tags = post?.tags?.length
      ? post.tags.map((t) => `#${t}`).join(" ")
      : "";

    let excerpt = "";
    if (post?.content) {
      const plain = post.content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      excerpt = plain.length > 140 ? plain.slice(0, 140).trim() + "..." : plain;
    } else if (post?.excerpt) {
      excerpt = post.excerpt;
    }

    let text = `*${title}*\n`;
    if (category) text += `Kategori: ${category}\n`;
    if (author) text += `Oleh: ${author}\n`;
    if (tags) text += `\n${tags}\n`;
    text += `\n${postUrl}`;

    return text;
  };

  const shareText = encodeURIComponent(createShareText());

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${shareText}`,
  };

 const copyLink = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    await navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast.success("Link berhasil disalin");

    // Kembali normal setelah 2 detik
    setTimeout(() => {
      setCopied(false);
      setShowShare(false); // optional: otomatis tutup dropdown juga
    }, 2000);
  } catch {
    toast.error("Gagal menyalin link");
  }
};

  const requestPin = async (replace = false) => {
    setPinning(true);
    try {
      const { data } = await api.patch(`/posts/${post._id}/pin`, { replace });
      setPinned(data.isPinned);
      onPinChange?.(post, data.isPinned, data.unpinnedIds || []);
      toast.success(data.isPinned ? "Guide dipin" : "Guide di-unpin");
    } catch (err) {
      if (err?.response?.status === 409 && err.response.data?.code === "PIN_LIMIT") {
        confirmReplace(err.response.data.oldest);
      } else {
        toast.error(err?.response?.data?.message || "Gagal mengubah status pin");
      }
    } finally {
      setPinning(false);
    }
  };

 const confirmReplace = (oldest) => {
    toast(
      (t) => (
        <div className="flex w-full flex-col rounded-2xl gap-3 text-sm">
          <div>
            <p className="font-semibold">Pinned sudah penuh (maks. 4)</p>
            <p className="mt-1 text-slate-300 break-words">
              Lepas pin “{oldest.title}” dan ganti dengan “{post.title}”?
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                requestPin(true);
              }}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500"
            >
              Lanjutkan
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 rounded-lg bg-slate-600 px-4 py-2 text-xs font-medium text-white hover:bg-slate-500"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        icon: "📌",
        style: {
          maxWidth: "none",            // buang batas 350px bawaan
          width: "min(480px, 92vw)",   // lebar modal; di mobile maksimal 92% layar
          padding: "16px 18px",
          marginRight: "30px",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      }
    );
  };

  const handlePin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canPin) return toast.error("Login dulu untuk pin guide");
    if (pinning) return;
    requestPin(false);
  };

  const handleAddToReadingList = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isGuest) {
      toast.error("Login dulu untuk menambahkan ke Reading List");
      return;
    }

    try {
      setAdding(true);
      await api.post("/auth/me/reading-list", { postId: post._id });
      setAdded(true);
    } catch (err) {
      if (err.response?.status === 400) {
        setAdded(true);
      } else {
        console.error("Gagal menambahkan ke Reading List:", err);
        toast.error("Gagal menambahkan ke Reading List");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to={`/posts/${post.slug}`}
      className="
        block
        flex-1
        min-w-0
        transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        hover:flex-[2.2]
      "
    >
      <div
        className={`group cursor-pointer hover:dark:!border-blue-300/50 relative p-3.5 bg-slate-300 rounded-[24px] dark:!bg-[#0c0c18] border dark:!border-white/20 flex flex-col overflow-hidden ${
          hideImage ? "h-[132px]" : featured ? "h-full" : "h-[420px]"
        }`}
      >
        {/* Cover image — skip kalau hideImage */}
        {!hideImage && (
          <div
            className={`relative bg-white/30 dark:bg-slate-900/40 overflow-hidden ${
              featured
                ? "h-56"
                : `${roundedNormal ? "rounded-[16px]" : "rounded-[14px]"} h-[100%]`
            }`}
          >
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full brightness-[80%] object-cover border-none transition-transform ease-fluid scale-[1.03] group-hover:scale-[1.07]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-white/10">
                <CategoryPill category={post.category} />
              </div>
            )}
          </div>
        )}

        <div
          className={`${
            hideImage
              ? "relative flex flex-1 flex-col gap-3 pt-1"
              : `absolute bottom-0 pt-7 left-0 w-full group-hover:h-[100%] ease-out animation-height duration-500 h-[35%] z-[33] flex flex-1 flex-col gap-3 p-3.5 py-4
                bg-black/30 dark:!bg-black/40 backdrop-blur-lg
                border-white/20 dark:border-white/10
                shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
                transition-all group-hover:bg-black/40 group-hover:duration-700 group-hover:ease-out`
          }`}
        >
          <div className= "group-hover:hidden flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CategoryPill category={post.category} />
              {!isGuest && (
                <button
                  onClick={handleAddToReadingList}
                  disabled={adding || added}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                    added
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-600 dark:text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-accent hover:text-white dark:bg-white dark:text-slate-900 dark:hover:text-white dark:hover:bg-accent"
                  }`}
                  title={added ? "Sudah di Reading List" : "Tambah ke Reading List"}
                >
                  {adding ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : added ? (
                    <>
                      <Check size={11} />
                      Added
                    </>
                  ) : (
                    <>
                      <BookPlus size={11} />
                      Add
                    </>
                  )}
                </button>
              )}
              {/* {pinned && status && (
                <div className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
                  <Pin size={11} />
                  Pinned
                </div>
              )} */}
            </div>
          </div>

          {/* Title */}
          <h3
            className={`${
                hideImage ? "group-hover:hidden" : ""
              } font-semibold text-white bg-blue-900/90 truncate w-max max-w-[90%] leading-snug tracking-tight ${
              featured ? "text-xl" : "text-base"
            }`}
          >
            {post.title}
          </h3>

          {/* Tags — satu baris, overflow truncate */}
          <div className={`${
            hideImage ? "group-hover:hidden" : ""
          } flex items-center gap-1.5 min-w-0 overflow-hidden`}>
            {post.tags?.length > 0
              ? post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="shrink-0 text-xs font-medium text-gray-200 bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    #{tag}
                  </span>
                ))
              : null}
          </div>

          {/* Overlay khusus pinned card — muncul saat hover (bersama 3 tombol) */}
          {hideImage && (
            <div
              className="
                absolute inset-0 z-20
                bg-black/0
                transition-colors ease-out
                group-hover:bg-white/5 
                pointer-events-none
                rounded-2xl
              "
            />
          )}
          <div
            className={`
              absolute bottom-[30%] -translate-x-1/2 left-1/2 w-full
              flex items-center justify-center gap-3
              transition-opacity ease-in-out
              opacity-0 group-hover:opacity-100
              z-30
              ${featured ? "mt-3" : "mt-2"}
            `}
          >

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowShare((v) => !v);
                }}
                className={`flex mt-auto hover:brightness-75 h-max w-max gap-x-2 hover:gap-x-5 active:scale-[0.98] items-center px-2 py-1.5 rounded-full border dark:!border-white bg-white text-sm font-medium text-slate-950 transition-all ease-in-out hover:bg-accent-dark ${
                  featured ? "mt-3" : "mt-2"
                }`}
              >
                {/* <p>Share</p> */}
                <div className="rounded-full active:scale-[0.98] duration-100 text-slate-900 flex items-center justify-center bg-white h-[32px] w-[30px]">
                  <Link2Icon size={18} />
                </div>
              </button>

              {showShare && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowShare(false);
                    }}
                  />

                  <div className="absolute bottom-full left-[105%] md:left-[90%] -translate-x-1/2 mb-3 z-50 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/15 dark:bg-gray-900">
                    <button
                      onClick={copyLink}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                        copied
                          ? "bg-emerald-500 text-white"
                          : "text-gray-700 hover:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-800"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={16} />
                          Disalin!
                        </>
                      ) : (
                        <>
                          <Link2 size={16} />
                          Salin Link
                        </>
                      )}
                    </button>

                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShare(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-slate-800"
                    >
                      <span className="flex h-4 w-4 items-center justify-center text-[13px] font-bold text-green-600">
                        WA
                      </span>
                      WhatsApp
                    </a>
                  </div>
                </>
              )}
            </div>
            
            {/* ===== SHARE BUTTON (dengan dropdown seperti PostDetail) ===== */}
            {canPin && (
              <button
                type="button"
                onClick={handlePin}
                disabled={pinning}
                className={`group/btn flex h-max w-max items-center gap-x-2 rounded-full bg-white border px-2 py-1.5 text-sm font-medium text-slate-950 transition-all ease-in-out hover:gap-x-5 hover:brightness-75 active:scale-[0.98]`}
              >
                <div className="rounded-full active:scale-[0.98] duration-100 text-slate-900 flex items-center justify-center bg-white h-[32px] w-[30px]">
                  {pinning ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      {pinned ? <PinOffIcon size={18} className={pinned ? "fill-white" : ""} /> : <Pin size={18} className={pinned ? "fill-white" : ""} />}
                    </>
                  )}
                </div>
              </button>
            )}

            <Link
              to={`/posts/${post.slug}`}
              className={`flex mt-auto hover:brightness-75 h-max w-max gap-x-2 hover:gap-x-5 active:scale-[0.98] border dark:!border-white items-center px-2 py-1.5 rounded-full bg-white text-sm font-medium text-slate-950 transition-all ease-in-out hover:bg-accent-dark ${
                featured ? "mt-3" : "mt-2"
              }`}
            >
              {/* <p>Read</p> */}
              <div className="rounded-full active:scale-[0.98] duration-100 text-slate-900 flex items-center justify-center bg-white h-[32px] w-[30px]">
                <Eye size={21} />
                
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;