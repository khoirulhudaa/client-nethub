import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Pin, Heart, Trash2, Pencil, Loader2, Bookmark, Share2, Link2, Twitter, Linkedin } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import CategoryPill from "../components/UI/CategoryPill.jsx";
import CommentThread from "../components/Post/CommentThread.jsx";
import PostCard from "../components/Post/PostCard.jsx";
import TopologyCanvas from "./TopologyCanvas.jsx";

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

  const [showShare, setShowShare] = useState(false);

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
  }, [load]);

  const isOwner = user?.id === post?.author?._id;

  const handlePin = async () => {
    try {
      const { data } = await api.patch(`/posts/${post._id}/pin`);
      setPost(data.post);
      toast.success(data.post.isPinned ? "Guide dipin" : "Guide di-unpin");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal mengubah status pin");
    }
  };

  
  const postUrl = `${window.location.origin}/posts/${post?.slug || slug}`;
  const shareText = encodeURIComponent(post?.title || "");

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${shareText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${encodeURIComponent(postUrl)}`,
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
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="surface-card p-6 mx-auto max-w-7xl pb-16">
      <div className="mb-4 flex items-center justify-between">
        <CategoryPill category={post.category} />
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
            <button onClick={handleDelete} className="btn-secondary px-3 py-1.5 text-xs text-red-500">
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        )}
      </div>

      <h1 className="mb-3 text-3xl font-semibold tracking-tight">{post.title}</h1>

      <Link to={`/authors/${post.author._id}`} className="mb-6 flex w-fit items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
          {post.author.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium">{post.author.name}</p>
          <p className="text-xs text-gray-400">{post.author.title}</p>
        </div>
      </Link>
      
      <div className="w-full bg-slate-200 dark:bg-slate-500 p-0 overflow-hidden rounded-2xl">
        {post.coverImage && (
          <img src={post.coverImage} alt="cover-image" className="mb-6 h-72 w-full object-contain" />
        )}
      </div>

      <article
        className="mt-6 prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-accent"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.gallery?.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Gallery
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {post.gallery.map((img, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-lg">
                <img
                  src={img.url}
                  alt={img.alt || ""}
                  className="aspect-video w-full object-cover"
                />
                {img.photographer && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p className="truncate text-[10px] text-white">
                      Photo by{" "}
                      <a
                        href={`${img.photographerUrl}?utm_source=your_app&utm_medium=referral`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {img.photographer}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {post.topology?.nodes?.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Network Topology
          </h2>
          <TopologyCanvas value={post.topology} readOnly />
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
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                >
                  <Link2 size={16} />
                  Salin Link
                </button>

                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShare(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                >
                  <span className="flex h-4 w-4 items-center justify-center text-[13px] font-bold text-green-600">
                    WA
                  </span>
                  WhatsApp
                </a>

                {/* <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShare(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                >
                  <Twitter size={16} className="text-sky-500" />
                  Twitter / X
                </a>

                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShare(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                >
                  <Facebook size={16} className="text-blue-600" />
                  Facebook
                </a> */}

                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShare(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                >
                  <Linkedin size={16} className="text-blue-700" />
                  LinkedIn
                </a>
              </div>
            </>
          )}
        </div>

        <span className="text-sm text-gray-400">{post.views} views</span>

        {post.tags?.map((t) => (
          <span
            key={t}
            className="pill bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
          >
            #{t}
          </span>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Comments</h2>
        <div className="surface-card p-5">
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