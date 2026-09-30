import { ArrowRight, BookPlus, Check, Eye, Heart, Loader2, Pin } from "lucide-react";
import { useState } from "react";
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

const PostCard = ({ post, featured = false, status=true }) => {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isGuest = user?.isGuest || user?.role === "guest";

  const handleAddToReadingList = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // biar tidak trigger Link

    if (isGuest) {
      toast.error("Login dulu untuk menambahkan ke Reading List");
      // atau bisa buka modal login
      return;
    }

    try {
      setAdding(true);
      await api.post("/auth/me/reading-list", { postId: post._id });
      setAdded(true);
    } catch (err) {
      // Kalau sudah ada di list, backend biasanya return 400
      if (err.response?.status === 400) {
        setAdded(true);
      } else {
        console.error("Gagal menambahkan ke Reading List:", err);
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className={`group relative h-[380px] bg-slate-300 rounded-[34px] dark:!bg-[#0c0c18] border dark:!border-white/20 group duration-100 flex flex-col overflow-hidden ${
        featured ? "h-full" : ""
      }`}
    >
      {post.isPinned && status && (
        <div className="absolute left-3 top-3 z-[9] flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
          <Pin size={11} />
          Pinned
        </div>
      )}

      <div className={`relative overflow-hidden bg-gray-100 dark:bg-slate-200 ${featured ? "h-56" : "h-[64%]"}`}>
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full brightness-[80%] object-cover transition-transform duration-300 ease-fluid scale-[1.03] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-white/10">
            <CategoryPill category={post.category} />
          </div>
        )}
      </div>

      <div className={`absolute bottom-0 left-0 w-full group-hover:h-[100%] ease-out animation-height duration-500 h-[50%] z-[33] flex flex-1 flex-col gap-3 p-3.5 py-4
          bg-white/30 dark:bg-slate-900/40 
          backdrop-blur-md 
          border-t border-white/20 dark:border-white/10
          shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
          transition-all
          group-hover:bg-white/40 dark:group-hover:bg-slate-900/50
        `}>        
        <div className="flex items-center justify-between gap-2">
          <CategoryPill category={post.category} />
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-900 dark:text-gray-400">{timeAgo(post.createdAt)}</span>

            {/* Tombol Add to Reading List */}
            {!isGuest && (
              <button
                onClick={handleAddToReadingList}
                disabled={adding || added}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                  added
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-600 hover:bg-accent hover:text-white dark:bg-white/10 dark:text-gray-300 dark:hover:bg-accent"
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
          </div>
        </div>

        <h3 className={`font-semibold text-slate-900 dark:text-white truncate max-w-[90%] overflow-x-hidden leading-snug tracking-tight ${featured ? "text-xl" : "text-base"}`}>
          {post.title}
        </h3>

        <p className="mt-2 group-hover:hidden text-sm leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-1">
          {post.content
            ? post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
            : post.excerpt}
        </p>

        <Link
        to={`/posts/${post.slug}`}
        // className="active:scale-[0.98]"
        >
          <div className={`absolute -translate-x-1/2 bottom-[25%] left-1/2 w-[70px] h-[70px] rounded-full group-hover:flex hidden items-center justify-center hover:bg-blue-700 cursor-pointer active:scale-[0.97] bg-blue-500 text-white`}>
            <ArrowRight />
          </div>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-accent-soft text-[11px] font-semibold text-slate-900 dark:text-accent">
              {post.author?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-400">
              {post.author?.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-900 dark:text-gray-400">
            <span className="flex items-center gap-1 text-xs">
              <Eye size={13} /> {post.views ?? 0}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Heart size={13} /> {post.likes?.length ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;