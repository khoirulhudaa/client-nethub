import { BookPlus, Check, ChevronRight, Link2, Link2Icon, Loader2, Pin } from "lucide-react";
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

const PostCard = ({ post, roundedNormal = false, featured = false, status = true, onPinChange }) => {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const isGuest = user?.isGuest || user?.role === "guest";
  const canPin = !!user && !isGuest;

  const [pinned, setPinned] = useState(!!post.isPinned);
  const [pinning, setPinning] = useState(false);


  const postUrl = `${window.location.origin}/posts/${post?.slug}`;

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
    if (excerpt) text += `\n${excerpt}\n`;
    if (tags) text += `\n${tags}\n`;
    text += `\n${postUrl}`;

    return text;
  };

  const shareText = encodeURIComponent(createShareText());

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post?.title || "")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
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

const handlePin = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!canPin) {
    toast.error("Login dulu untuk pin guide");
    return;
  }
  if (pinning) return;

  const previous = pinned;
  setPinned(!previous); // optimistic
  setPinning(true);
  
  try {
    const { data } = await api.patch(`/posts/${post._id}/pin`);
    setPinned(data.isPinned);
    onPinChange?.(post, data.isPinned);   
    toast.success(data.isPinned ? "Guide dipin" : "Guide di-unpin");
  } catch (err) {
    setPinned(previous);
    toast.error(err?.response?.data?.message || "Gagal mengubah status pin");
  } finally {
    setPinning(false);
  }
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
    <div
      className={`group relative h-[420px] p-3.5 bg-slate-300 rounded-[24px] dark:!bg-[#0c0c18] border dark:!border-white/20 group duration-100 flex flex-col overflow-hidden ${
        featured ? "h-full" : ""
      }`}
    >

      <div className={`relative bg-white/30
           dark:bg-slate-900/40  overflow-hidden ${featured ? "h-56" : `${roundedNormal ? 'rounded-[16px]' : 'rounded-[24px]'} h-[100%]`}`}>
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full brightness-[80%] object-cover border-none transition-transform duration-300 ease-fluid scale-[1.03] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-white/10">
            <CategoryPill category={post.category} />
          </div>
        )}
      </div>

      <div
        className={`absolute bottom-0 pt-7 left-0 w-full group-hover:h-[100%] ease-out animation-height duration-500 h-[35%] z-[33] flex flex-1 flex-col gap-3 p-3.5 py-4
          bg-white/30
           dark:bg-black/40
          backdrop-blur-lg
          border-white/20 dark:border-white/10
          shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
          transition-all
          group-hover:bg-white/40 dark:group-hover:bg-slate-900/50
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CategoryPill category={post.category} />
            {!isGuest && (
              <button
                onClick={handleAddToReadingList}
                disabled={adding || added}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                  added
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-600 hover:bg-accent hover:text-white dark:bg-white dark:text-slate-900 dark:hover:bg-accent"
                }`}
                title={added ? "Sudah di Reading List" : "Tambah ke Reading List"}
              >
                {adding ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : added ? (
                  <>
                    <Check size={12} />
                    Added
                  </>
                ) : (
                  <>
                    <BookPlus size={12} />
                    Add
                  </>
                )}
              </button>
            )}
            {pinned && status && (
              <div className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
                <Pin size={11} />
                Pinned
              </div>
            )}
          </div>
        </div>

        <h3
          className={`font-semibold text-slate-900 dark:text-white truncate max-w-[90%] overflow-x-hidden leading-snug tracking-tight ${
            featured ? "text-xl" : "text-base"
          }`}
        >
          {post.title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[11px] font-semibold text-slate-900 dark:text-slate-900">
            {post.author?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-xs max-w-[80%] overflow-hidden truncate font-medium text-gray-800 dark:text-gray-200">
            {post.author?.name}
          </span>
        </div>

        <div
          className={`absolute bottom-[25%] -translate-x-1/2 left-1/2 w-full flex items-center justify-center gap-3 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100 ${
            featured ? "mt-3" : "mt-2"
          }`}
        >

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowShare((v) => !v);
              }}
              className={`flex mt-auto hover:brightness-75 h-max w-max gap-x-2 hover:gap-x-5 active:scale-[0.98] duration-300 items-center px-2 py-1.5 pl-3 rounded-full border dark:!border-white bg-purple-600 text-sm font-medium text-white transition-all ease-in-out hover:bg-accent-dark ${
                featured ? "mt-3" : "mt-2"
              }`}
            >
              <p>Share</p>
              <div className="rounded-full active:scale-[0.98] duration-100 text-slate-900 flex items-center justify-center bg-white h-[30px] w-[30px]">
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
                        : "text-gray-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-slate-800"
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
              title={pinned ? "Unpin" : "Pin"}
              className={`group/btn flex h-max w-max items-center gap-x-2 rounded-full border px-2 py-1.5 pl-3 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:gap-x-5 hover:brightness-75 active:scale-[0.98] ${
                featured ? "mt-3" : "mt-2"
              } ${
                pinned
                  ? "bg-green-600 border-white"
                  : "bg-slate-700 border-slate-900 dark:border-white"
              }`}
            >
              <p className="text-white">{pinned ? "Unpin" : "Pin"}</p>
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-slate-900">
                {pinning ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Pin size={18} className={pinned ? "fill-slate-900" : ""} />
                )}
              </div>
            </button>
          )}

          <Link
            to={`/posts/${post.slug}`}
            className={`flex mt-auto hover:brightness-75 h-max w-max gap-x-2 hover:gap-x-5 active:scale-[0.98] duration-300 border dark:!border-white items-center px-2 py-1.5 pl-3 rounded-full bg-accent text-sm font-medium text-white transition-all ease-in-out hover:bg-accent-dark ${
              featured ? "mt-3" : "mt-2"
            }`}
          >
            <p>Read</p>
            <div className="rounded-full active:scale-[0.98] duration-100 text-slate-900 flex items-center justify-center bg-white h-[30px] w-[30px]">
              <ChevronRight />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;