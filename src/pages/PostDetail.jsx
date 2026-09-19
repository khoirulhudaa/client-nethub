import { Bookmark, CheckCircle2, Circle, Clipboard, Heart, Link2, Linkedin, Loader2, Highlighter, Pencil, Pin, Share2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import CommentThread from "../components/Post/CommentThread.jsx";
import PostCard from "../components/Post/PostCard.jsx";
import CategoryPill from "../components/UI/CategoryPill.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import FlowchartCanvas from "./FlowchartCanvas.jsx";
import TopologyCanvas from "./TopologyCanvas.jsx";

const CodeBlockItem = ({ block }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      toast.success("Code berhasil disalin");

      // Kembali ke "Copy" setelah 2 detik
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin code");
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white dark:border-white/5 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium tracking-widest text-gray-400">
            {block.language?.toUpperCase() || "CODE"}
          </span>
          {block.title && (
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {block.title}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            copied
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-gray-600 hover:bg-accent hover:text-white dark:bg-white/5 dark:text-gray-300"
          }`}
        >
          {copied ? (
            <>
              {/* Check icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              {/* Copy icon */}
              <Clipboard size={12} className="relative top-[-1px]" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-gray-800 dark:text-gray-200">
        <code className="font-mono whitespace-pre">{block.code}</code>
      </pre>
    </div>
  );
};

const PostDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sidebarType, setSidebarType] = useState(null); 
  const [selectedStep, setSelectedStep] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [highlightLoading, setHighlightLoading] = useState(false);

  const [showShare, setShowShare] = useState(false);
  // ===== STATE BARU =====
  const [inReadingList, setInReadingList] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [readingListLoading, setReadingListLoading] = useState(false);

  // Highlight
  const [highlights, setHighlights] = useState([]); // array of { text, color }
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Warna stabilo
  const HIGHLIGHT_COLORS = [
    { name: "Kuning", value: "#fef08a" },
    { name: "Hijau", value: "#bbf7d0" },
    { name: "Biru", value: "#bae6fd" },
    { name: "Pink", value: "#fbcfe8" },
    { name: "Orange", value: "#fed7aa" },
  ];

  const isGuest = user?.isGuest || user?.role === "guest";

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get(`/posts/${slug}`);
    setPost(data.post);
    setRelated(data.related);
    setLikesCount(data.post.likes?.length || 0);
    setLiked(data.post.likes?.some((l) => l === user?.id || l?._id === user?.id));

    // Status saved sekarang langsung dibaca dari Post.savedBy (sisi post dari
    // relasi bookmark), jadi tidak perlu request terpisah ke /users/me/bookmarks.
    setBookmarked(data.post.savedBy?.some((b) => b === user?.id || b?._id === user?.id));

    const commentsRes = await api.get(`/posts/${data.post._id}/comments`);
    setComments(commentsRes.data.comments);
    setLoading(false);
  }, [slug, user?.id]);

  useEffect(() => {
    load();
  }, [load])

  useEffect(() => {
    if (user && post?.author?._id) {
      // Cek apakah user sudah follow author ini
      // Cara sederhana: cek dari user.following (kalau AuthContext menyimpan data lengkap)
      // Atau buat request ke /auth/me/following
      const checkFollow = async () => {
        try {
          const { data } = await api.get("/auth/me/following");
          const followingIds = data.following.map((u) => u._id);
          setIsFollowing(followingIds.includes(post.author._id));
        } catch {
          // ignore
        }
      };
      if (user) checkFollow();
    }
}, [user, post?.author?._id]);

const handleFollow = async () => {
  if (!user) {
    toast.error("Login dulu untuk follow author");
    return;
  }
  if (user.id === post.author._id) return;

  setFollowLoading(true);
  try {
    const { data } = await api.post(`/auth/follow/${post.author._id}`);
    setIsFollowing(data.following);
    toast.success(data.following ? "Berhasil follow" : "Unfollow berhasil");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Gagal follow");
  } finally {
    setFollowLoading(false);
  }
};

// Cek apakah guide ini ada di Reading List user
const checkReadingListStatus = async () => {
  if (!user || isGuest || !post?._id) return;
  try {
    const { data } = await api.get("/auth/me/reading-list");
    const item = data.readingList?.find(
      (i) => String(i.post?._id || i.post) === String(post._id)
    );
    if (item) {
      setInReadingList(true);
      setIsCompleted(!!item.completed);
    } else {
      setInReadingList(false);
      setIsCompleted(false);
    }
  } catch (err) {
    // ignore
  }
};

// Panggil setelah post berhasil di-load
useEffect(() => {
  if (post?._id) {
    checkReadingListStatus();
  }
}, [post?._id, user]);

// Toggle Mark as Read / Completed
const handleToggleCompleted = async () => {
  if (!post?._id) return;
  setReadingListLoading(true);
  try {
    if (!inReadingList) {
      // Kalau belum ada di list, tambahkan dulu lalu tandai completed
      await api.post("/auth/me/reading-list", { postId: post._id });
      await api.patch(`/auth/me/reading-list/${post._id}/complete`);
      setInReadingList(true);
      setIsCompleted(true);
      toast.success("Ditambahkan & ditandai sudah dibaca");
    } else {
      await api.patch(`/auth/me/reading-list/${post._id}/complete`);
      setIsCompleted((prev) => !prev);
      toast.success(isCompleted ? "Ditandai belum dibaca" : "Ditandai sudah dibaca");
    }
  } catch (err) {
    toast.error(err?.response?.data?.message || "Gagal mengubah status");
  } finally {
    setReadingListLoading(false);
  }
};

// Deteksi text selection
const handleMouseUp = () => {
  if (isGuest) {
    // Optional: bisa langsung munculkan toast
    // toast.error("Login dulu untuk menggunakan stabilo");
    return;
  }

  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (text && text.length > 2) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectedText(text);
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY - 50,
    });
    setShowHighlightMenu(true);
  } else {
    setShowHighlightMenu(false);
  }
};

// ===== LOAD HIGHLIGHTS saat post siap =====
useEffect(() => {
  const loadHighlights = async () => {
    if (!user || isGuest || !post?._id) return;
    try {
      const { data } = await api.get(`/auth/me/highlights/${post._id}`);
      setHighlights(data.highlights || []);
    } catch (err) {
      // ignore
    }
  };
  loadHighlights();
}, [post?._id, user]);

// ===== APPLY HIGHLIGHT (simpan ke backend) =====
const applyHighlight = async (color) => {
  if (!selectedText || !post?._id) return;

  const newHighlight = { text: selectedText, color };

  // 1. Langsung tampilkan dulu (Optimistic)
  setHighlights((prev) => {
    if (prev.some((h) => h.text === selectedText)) return prev;
    return [...prev, newHighlight];
  });

  setShowHighlightMenu(false);
  window.getSelection()?.removeAllRanges();
  setHighlightLoading(true);

  try {
    const { data } = await api.post(`/auth/me/highlights/${post._id}`, {
      text: selectedText,
      color,
    });
    // 2. Sinkronkan dengan data server
    setHighlights(data.highlights || []);
    toast.success("Teks distabilo");
  } catch (err) {
    // 3. Kalau gagal → rollback
    setHighlights((prev) => prev.filter((h) => h.text !== selectedText));
    toast.error("Gagal menyimpan highlight");
  } finally {
    setHighlightLoading(false);
  }
};

// Render content dengan highlight
const renderHighlightedContent = (html) => {
  if (!highlights.length) return html;

  let result = html;
  highlights.forEach(({ text, color }) => {
    // Escape special regex characters
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    result = result.replace(
      regex,
      `<mark style="background-color: ${color}; padding: 1px 2px; border-radius: 3px;">$1</mark>`
    );
  });
  return result;
};

// Hapus satu highlight
const removeHighlight = async (text) => {
  if (!post?._id) return;
  try {
    const { data } = await api.delete(`/auth/me/highlights/${post._id}`, {
      data: { text },
    });
    setHighlights(data.highlights || []);
    toast.success("Highlight dihapus");
  } catch (err) {
    toast.error("Gagal menghapus highlight");
  }
};

const isOwner = user?.id === post?.author?._id;

  const handlePin = async () => {
    if (!post) return;

    // Simpan state lama untuk rollback
    const previousPinned = post.isPinned;

    // Langsung ubah tampilan dulu (optimistic)
    setPost((prev) => ({
      ...prev,
      isPinned: !prev.isPinned,
    }));

    try {
      const { data } = await api.patch(`/posts/${post._id}/pin`);

      // Sinkronkan dengan server, tetap jaga author supaya menu tidak hilang
      setPost((prev) => ({
        ...prev,
        ...data.post,
        author: prev.author,
        isPinned: data.post.isPinned,
      }));

      toast.success(data.post.isPinned ? "Guide dipin" : "Guide di-unpin");
    } catch (err) {
      // Jika gagal → kembalikan ke state sebelumnya
      setPost((prev) => ({
        ...prev,
        isPinned: previousPinned,
      }));
      toast.error(err?.response?.data?.message || "Gagal mengubah status pin");
    }
};
  
 const postUrl = `${window.location.origin}/posts/${post?.slug || slug}`;

  const createShareText = () => {
    const title = post?.title || "Guide";
    const category = post?.category || "";
    const author = post?.author?.name || "";
    const tags = post?.tags?.length
      ? post.tags.map((t) => `#${t}`).join(" ")
      : "";

    // Ambil excerpt singkat (buang HTML)
    let excerpt = "";
    if (post?.content) {
      const plain = post.content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      excerpt = plain.length > 140 ? plain.slice(0, 140).trim() + "..." : plain;
    }

    // Format yang lebih bersih & stabil di WhatsApp
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
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    whatsapp: `https://wa.me/?text=${shareText}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Link berhasil disalin");
      setShowShare(false);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handleBookmark = async () => {
    const prev = bookmarked;
    setBookmarked(!prev); // optimistic
    try {
      const { data } = await api.post(`/posts/${post._id}/bookmark`);
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? "Guide disimpan" : "Guide dihapus dari saved");
    } catch (err) {
      setBookmarked(prev);
      toast.error(err?.response?.data?.message || "Gagal menyimpan guide");
    }
  };

 const handleLike = async () => {
    // Simpan state lama untuk rollback jika gagal
    const previousLiked = liked;
    const previousCount = likesCount;

    // Langsung ubah tampilan dulu (optimistic)
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    try {
      const { data } = await api.patch(`/posts/${post._id}/like`);
      // Sinkronkan dengan response server (lebih akurat)
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      // Jika gagal → kembalikan ke state sebelumnya
      setLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error(err?.response?.data?.message || "Gagal menyukai guide");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this guide? This cannot be undone.")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success("Guide berhasil dihapus");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menghapus guide");
    }
  };

  const postTopLevelComment = async () => {
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { content: commentText.trim() });
      setComments((c) => [...c, { ...data.comment, replies: [] }]);
      setCommentText("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal mengirim komentar");
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { content, parent: parentId });
      const addReply = (list) =>
        list.map((c) =>
          c._id === parentId
            ? { ...c, replies: [...(c.replies || []), { ...data.comment, replies: [] }] }
            : { ...c, replies: addReply(c.replies || []) }
        );
      setComments((c) => addReply(c));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal membalas komentar");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      const remove = (list) =>
        list.filter((c) => c._id !== commentId).map((c) => ({ ...c, replies: remove(c.replies || []) }));
      setComments((c) => remove(c));
      toast.success("Komentar dihapus");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menghapus komentar");
    }
  };

  if (loading || !post) {
    return (
      <div className="flex justify-center flex-col h-full items-center text-center py-24">
        <img src="/cloud.png" alt="icon-cloud" className="w-20" />
        <p className="mt-2">Load content ...</p>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-7xl pb-16">
      <div className="mb-4 flex items-center justify-between">
        <div className="w-max flex items-center gap-2.5">
          <CategoryPill category={post.category} />
          {isCompleted && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 size={13} />
              Sudah dibaca
            </div>
          )}
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <button onClick={handlePin} className="btn-secondary px-3 py-1.5 text-xs">
              <Pin size={13} className={post.isPinned ? "fill-accent text-accent" : ""} />
              {post.isPinned ? "Pinned" : "Pin"}
            </button>
            <Link to={`/edit/${post._id}`} className="btn-secondary px-3 py-1.5 text-xs">
              <Pencil size={13} />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-secondary px-3 py-1.5 text-xs text-red-500"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        )}
      </div>

      <h1 className="mb-3 text-2xl w-max rounded-xl p-2 px-1 pr-2.5 font-semibold tracking-tight bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/20">
        📝 {post.title}
      </h1>

      <div className="mb-6 flex items-center justify-between">
        <Link to={`/authors/detail/${post.author._id}`} className="flex w-fit active:scale-[0.98] hover:brightness-75 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 dark:bg-accent-soft text-sm font-semibold text-white dark:text-accent">
            {post.author.name?.[0]?.toUpperCase()}
          </div>
          <div className="leading-tight">
            <p className="text-md font-medium">{post.author.name}</p>
            <p className="text-xs text-gray-400">{post.author.title}</p>
          </div>
        </Link>

        {/* Tombol Follow */}
        {user && user.id !== post.author._id && (
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
              isFollowing
                ? "border border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100 dark:border-white/20 dark:text-gray-300"
                : "bg-accent text-white hover:opacity-90"
            }`}
          >
            {followLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isFollowing ? (
              "Following"
            ) : (
              "Subscribe"
            )}
          </button>
        )}
      </div>
      
      <div className="w-full h-72 bg-slate-200 dark:bg-slate-500 p-0 overflow-hidden rounded-2xl">
        {post.coverImage && (
          <img src={post.coverImage} alt="cover-image" className="mb-6 h-full w-full hover:scale-[1.1] duration-300 ease-in object-cover" />
        )}
      </div>

       <h2 className="mt-6 mb-5 text-sm font-medium tracking-widest text-gray-400 uppercase">
          Description
        </h2>

      {/* Description dengan support highlight */}
      <div className="relative" onMouseUp={handleMouseUp}>
        <article
          className="rounded-2xl text-justify border border-gray-100 bg-slate-200 dark:bg-white/[0.03] px-5 border-y border-border-light py-4 dark:border-border-dark prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold text-slate-500 dark:text-white/70 prose-a:text-accent"
          dangerouslySetInnerHTML={{
            __html: renderHighlightedContent(post.content),
          }}
        />

        {/* Floating Highlight Menu */}
        {showHighlightMenu && (
          <div
            className="fixed z-50 flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-gray-900"
            style={{
              left: menuPosition.x,
              top: menuPosition.y,
              transform: "translateX(-50%)",
            }}
          >
            {highlightLoading ? (
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500">
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </div>
            ) : (
              <>
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => applyHighlight(c.value)}
                    disabled={highlightLoading}
                    className="h-7 w-7 rounded-full border-2 border-white shadow-sm transition hover:scale-110 disabled:opacity-50"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
                <button
                  onClick={() => setShowHighlightMenu(false)}
                  className="ml-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {highlights.length > 0 && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-slate-200 p-5 dark:border-white/5 dark:bg-white/[0.03]">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Highlighter size={15} />
            Stabilo kamu ({highlights.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {highlights.map((h, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs"
                style={{ backgroundColor: h.color }}
              >
                <span className="max-w-[200px] truncate text-gray-800">
                  {h.text}
                </span>
                <button
                  onClick={() => removeHighlight(h.text)}
                  className="opacity-0 transition group-hover:opacity-100 text-gray-600 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {post.codeBlocks?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-5 text-sm font-medium tracking-widest text-gray-400 uppercase">
            Commands & Code
          </h2>

          <div className="space-y-5">
            {post.codeBlocks.map((block, idx) => (
              <CodeBlockItem key={idx} block={block} />
            ))}
          </div>
        </div>
      )}

      {post.referencesImages?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-5 text-sm font-medium tracking-widest text-gray-400 uppercase">
            Reference by Upload
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {post.referencesImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-3xl bg-slate-200 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 transition-all duration-500 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1"
              >
                <div className="overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.name || `Reference ${idx + 1}`}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Optional subtle label */}
                {img.name && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-xs font-medium text-white truncate">
                      {img.name}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Topology & Flowchart Cards ===== */}
      {(post.topology?.nodes?.length > 0 || post.flowchart?.nodes?.length > 0) && (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Topology Card */}
          {post.topology?.nodes?.length > 0 ? (
            <button
              type="button"
              onClick={() => setSidebarType("topology")}
              className="group flex items-center active:scale-[0.99] duration-100 gap-4 rounded-2xl border border-gray-200 bg-slate-200 p-5 text-left transition hover:border-accent hover:bg-accent/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-accent"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">Network Topology</p>
                <p className="text-xs text-gray-500">
                  {post.topology.nodes.length} devices · Klik untuk melihat
                </p>
              </div>
              <span className="ml-auto text-gray-400 transition group-hover:text-accent">→</span>
            </button>
          ): (
            <button
              type="button"
              onClick={() => setSidebarType("flowchart")}
              disabled
              className="group flex cursor-not-allowed items-center gap-4 rounded-2xl border border-gray-200 bg-slate-200 p-5 text-left transition dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="gray" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-slate-600">Network Topology</p>
                <p className="text-xs text-gray-600">
                  {post.flowchart.nodes.length} steps · Klik untuk melihat
                </p>
              </div>
              <span className="ml-auto text-gray-600 transition">→</span>
            </button>
          )}

          {/* Flowchart Card */}
          {post.flowchart?.nodes?.length > 0 ? (
            <button
              type="button"
              onClick={() => setSidebarType("flowchart")}
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-slate-200 p-5 text-left transition hover:border-accent hover:bg-accent/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-accent"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">Flowchart</p>
                <p className="text-xs text-gray-500">
                  {post.flowchart.nodes.length} steps · Klik untuk melihat
                </p>
              </div>
              <span className="ml-auto text-gray-400 transition group-hover:text-accent">→</span>
            </button>
          ): (
             <button
              type="button"
              onClick={() => setSidebarType("flowchart")}
              disabled
              className="group flex cursor-not-allowed items-center gap-4 rounded-2xl border border-gray-200 bg-slate-200 p-5 text-left transition dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="gray" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-slate-600">Flowchart</p>
                <p className="text-xs text-gray-600">
                  {post.flowchart.nodes.length} steps · Klik untuk melihat
                </p>
              </div>
              <span className="ml-auto text-gray-600 transition">→</span>
            </button>
          )}
        </div>
      )}
      
      {/* ===== Step-by-step Wizard (Zigzag + Clickable) ===== */}
      {post.steps?.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 text-sm font-medium tracking-widest text-gray-400 uppercase">
            Step-by-step Guide
          </h2>

          {(() => {
            const perRow = 4;
            const rows = [];
            for (let i = 0; i < post.steps.length; i += perRow) {
              rows.push(post.steps.slice(i, i + perRow));
            }

            return (
              <div className="space-y-6">
                {rows.map((row, rowIdx) => {
                  const isEvenRow = rowIdx % 2 === 1;
                  const stepsInRow = isEvenRow ? [...row].reverse() : row;
                  const isFullRow = row.length === perRow;

                  return (
                    <div key={rowIdx}>
                      <div
                        className={`grid gap-4 ${
                          isFullRow
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                        }`}
                      >
                        {stepsInRow.map((step, idx) => {
                          const realIndex = isEvenRow
                            ? rowIdx * perRow + (row.length - 1 - idx)
                            : rowIdx * perRow + idx;

                          return (
                            <button
                              key={realIndex}
                              type="button"
                              onClick={() =>
                                setSelectedStep({ ...step, index: realIndex })
                              }
                              className="group relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-5 text-left transition-all duration-500 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1"
                            >
                              {/* Header */}
                              <div className="mb-4 flex items-center justify-between">
                                <span className="text-[11px] font-medium tracking-widest text-gray-400">
                                  STEP {String(realIndex + 1).padStart(2, "0")}
                                </span>

                                {/* Arrow */}
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-white/5 text-gray-400 transition-all duration-500 group-hover:bg-accent group-hover:text-white group-hover:scale-110">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                    />
                                  </svg>
                                </div>
                              </div>

                              {/* Image */}
                              {step.image && (
                                <div className="mb-4 overflow-hidden rounded-2xl">
                                  <img
                                    src={step.image}
                                    alt={step.title}
                                    className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                </div>
                              )}

                              {/* Title */}
                              <h3 className="mb-2 text-[15px] font-semibold text-gray-900 dark:text-white line-clamp-2">
                                {step.title || `Step ${realIndex + 1}`}
                              </h3>

                              {/* Description */}
                              {step.description && (
                                <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {step.description}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ===== Custom Tables ===== */}
      {post.customTables?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
            GRADIENTS
          </h2>
          <div className="space-y-6">
            {post.customTables.map((table, tIdx) => (
              <div key={tIdx}>
                {table.title && (
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {table.title}
                  </h3>
                )}
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {table.data?.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="border border-gray-200 px-4 py-2.5 dark:border-white/10"
                            >
                              {cell || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4 border-y border-border-light py-4 dark:border-border-dark">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart size={16} className={liked ? "fill-red-500" : ""} />
          {likesCount}
        </button>

        <button onClick={handleBookmark} className="flex items-center gap-1.5 text-sm">
          <Bookmark size={16} className={bookmarked ? "fill-accent text-accent" : ""} />
          {bookmarked ? "Saved" : "Save"}
        </button>

        {/* Mark as Read */}
        {!isGuest && (
          <button
            onClick={() => {
              if (isGuest) {
                toast.error("Login dulu untuk menandai sudah dibaca");
                // atau navigate("/login");
                return;
              }
              handleToggleCompleted();
            }}
            disabled={readingListLoading}
            className={`flex items-center gap-1.5 text-sm font-medium transition ${
              isCompleted
                ? "text-emerald-600"
                : "text-gray-500 hover:text-emerald-600"
            }`}
          >
            {readingListLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isCompleted ? (
              <>
                <CheckCircle2 size={16} className="fill-emerald-100" />
                Sudah dibaca
              </>
            ) : (
              <>
                <Circle size={16} />
                Tandai dibaca
              </>
            )}
          </button>
        )}

        {/* ===== SHARE BUTTON ===== */}
        <div className="relative">
          <button
            onClick={() => setShowShare((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-accent"
          >
            <Share2 size={16} />
            Share
          </button>

          {showShare && (
            <>
              {/* Backdrop untuk menutup dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowShare(false)}
              />

              <div className="absolute left-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-gray-900">
                <button
                  onClick={copyLink}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-200 dark:text-gray-200 dark:hover:bg-white/5"
                >
                  <Link2 size={16} />
                  Salin Link
                </button>

                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShare(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-200 dark:text-gray-200 dark:hover:bg-white/5"
                >
                  <span className="flex h-4 w-4 items-center justify-center text-[13px] font-bold text-green-600">
                    WA
                  </span>
                  WhatsApp
                </a>

                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShare(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-200 dark:text-gray-200 dark:hover:bg-white/5"
                >
                  <Linkedin size={16} className="text-blue-700" />
                  LinkedIn
                </a>
              </div>
            </>
          )}
        </div>

        <span className="text-sm text-slate-500 dark:text-gray-400">{post.views} views</span>

        {post.tags?.map((t) => (
          <span
            key={t}
            className="pill bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
          >
            #{t}
          </span>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Comments</h2>
        <div className="surface-card shadow-none bg-slate-200 dark:bg-white/[0.03] p-5">
          <div className="mb-4 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && postTopLevelComment()}
              placeholder="Add a comment…"
              className="input-field flex-1"
            />
            <button onClick={postTopLevelComment} className="btn-primary px-4">
              Post
            </button>
          </div>
          <CommentThread comments={comments} onReply={handleReply} onDelete={handleDeleteComment} />
        </div>
      </div>

      {/* ===== RIGHT SIDEBAR (Topology / Flowchart) ===== */}
      {sidebarType && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarType(null)}
          />

          {/* Sidebar - full height */}
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-7xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#12121b]">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
              <h3 className="text-base font-semibold">
                {sidebarType === "topology" ? "Network Topology" : "Flowchart"}
              </h3>
              <button
                type="button"
                onClick={() => setSidebarType(null)}
                className="flex h-8 w-8 bg-red-500/20 items-center justify-center rounded-lg text-white transition hover:bg-red-500/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Canvas area - ambil sisa tinggi */}
            <div className="flex-1 overflow-hidden p-4">
              {sidebarType === "topology" && (
                <TopologyCanvas
                  value={post.topology}
                  readOnly
                  height={window.innerHeight - 100}   // ≈ full screen - header
                  showToolbar={false}
                />
              )}
              {sidebarType === "flowchart" && (
                <FlowchartCanvas
                  value={post.flowchart}
                  readOnly
                  height={window.innerHeight - 100}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== STEP DETAIL SIDEBAR ===== */}
      {selectedStep && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedStep(null)}
          />

          {/* Sidebar */}
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-7xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#12121b]">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {selectedStep.index + 1}
                </div>
                <h3 className="text-base font-semibold">
                  {selectedStep.title || `Step ${selectedStep.index + 1}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStep(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {selectedStep.image && (
                <img
                  src={selectedStep.image}
                  alt={selectedStep.title}
                  className="mb-5 w-full rounded-2xl object-cover max-h-[420px] border border-gray-100 dark:border-white/10"
                />
              )}

              {selectedStep.description && (
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {selectedStep.description}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999999999999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />

          {/* Modal box */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                <Trash2 size={22} className="text-red-600 dark:text-red-400" />
              </div>

              <h3 className="text-center text-lg font-semibold">
                Hapus Guide?
              </h3>
              <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                Guide <span className="font-medium text-gray-700 dark:text-gray-200">"{post.title}"</span> akan
                dihapus permanen. Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 border-t border-gray-100 bg-slate-200 px-6 py-4 dark:border-white/5 dark:bg-white/5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-slate-200 disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Menghapus...
                  </span>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {related?.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Related Guides
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;