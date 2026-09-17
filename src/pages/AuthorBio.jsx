import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import PostCard from "../components/Post/PostCard.jsx";

const AuthorBio = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/auth/authors/${id}`),
      api.get("/posts", { params: { author: id, limit: 24 } }),
    ])
      .then(([authorRes, postsRes]) => {
        setAuthor(authorRes.data.user);
        setPosts(postsRes.data.posts || []);
      })
      .catch(() => {
        setAuthor(null);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="py-24 text-center">
        <p className="font-medium">Author tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header author */}
      <div className="surface-card mb-8 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-xl font-semibold text-accent">
          {author.avatar ? (
            <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
          ) : (
            author.name?.[0]?.toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{author.name}</h1>
          <p className="text-sm text-gray-500">
            {author.title || "Network Enthusiast"}
            {author.username ? ` · @${author.username}` : ""}
          </p>
          {author.bio && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {author.bio}
            </p>
          )}
        </div>
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
        Guides oleh {author.name}
      </h2>

      {posts.length === 0 ? (
        <p className="text-sm text-gray-500">Belum ada guide dari author ini.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthorBio;