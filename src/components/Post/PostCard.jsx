import { Link } from "react-router-dom";
import { Eye, MessageSquare, Heart, Pin, BookPlus, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import CategoryPill from "../UI/CategoryPill.jsx";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

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

const PostCard = ({ post, featured = false }) => {
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
    <Link
      to={`/posts/${post.slug}`}
      className={`hover-lift surface-card border !border-white/20 group active:scale-[0.99] duration-100 relative flex flex-col overflow-hidden ${
        featured ? "h-full" : ""
      }`}
    >
      {post.isPinned && (
        <div className="absolute left-3 top-3 z-[9] flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
          <Pin size={11} />
          Pinned
        </div>
      )}

      <div className={`relative overflow-hidden bg-gray-100 dark:bg-white/5 ${featured ? "h-56" : "h-40"}`}>
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 ease-fluid scale-[1.03] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-white/10">
            <CategoryPill category={post.category} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <CategoryPill category={post.category} />
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>

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

        <h3 className={`font-semibold leading-snug tracking-tight ${featured ? "text-xl" : "text-base"}`}>
          {post.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
          {post.content
            ? post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
            : post.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              {post.author?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {post.author?.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <span className="flex items-center gap-1 text-xs">
              <Eye size={13} /> {post.views ?? 0}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Heart size={13} /> {post.likes?.length ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;