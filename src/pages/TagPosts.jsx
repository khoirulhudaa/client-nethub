import { ArrowLeft, Hash, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import PostCard from "../components/Post/PostCard.jsx";

const TagPosts = () => {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!tag) return;

    setLoading(true);
    api
      .get("/posts", {
        params: {
          tag: tag.toLowerCase(),
          limit: 24,
        },
      })
      .then(({ data }) => {
        // Gabungkan pinned + posts supaya lengkap
        const all = [...(data.pinned || []), ...(data.posts || [])];
        setPosts(all);
        setTotal(data.total || all.length);
      })
      .catch(() => {
        setPosts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [tag]);

  return (
    <div className="mx-auto max-w-full min-h-screen md:border-x border-white dark:border-white/10 px-0 py-0 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Hash size={14} />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Tag
              </span>
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              #{tag}
            </h1>
            {!loading && (
              <p className="mt-0.5 text-sm text-gray-400">
                {total} guide{total !== 1 ? "s" : ""} ditemukan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex surface-card justify-center flex-col h-full items-center text-center py-20">
          <img src="/cloud.png" alt="icon-cloud" className="w-20" />
          <p className="mt-2 flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Load content ...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Hash size={32} className="text-gray-500" />
          <p className="font-medium">Belum ada guide dengan tag ini</p>
          <p className="text-sm text-gray-500">
            Coba cari tag lain atau buat guide baru dengan tag #{tag}
          </p>
          <Link to="/create" className="btn-primary mt-4">
            Buat Guide Baru
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 p-2.5 md:px-4 w-full md:py-4 relative bg-white/5 rounded-3xl">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TagPosts;