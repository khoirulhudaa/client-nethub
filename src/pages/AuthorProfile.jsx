import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Pin } from "lucide-react";
import api from "../api/axios.js";
import PostCard from "../components/Post/PostCard.jsx";

const AuthorProfile = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/auth/authors/${id}`), api.get("/posts", { params: { author: id, limit: 50 } })])
      .then(([authorRes, postsRes]) => {
        setAuthor(authorRes.data.user);
        setPosts([...postsRes.data.pinned, ...postsRes.data.posts]);
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

  if (!author) return <p className="text-center text-gray-500">Author not found.</p>;

  const pinnedPosts = posts.filter((p) => p.isPinned);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="surface-card mb-8 flex flex-col items-center gap-3 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent-soft text-2xl font-semibold text-accent">
          {author.avatar ? (
            <img src={author.avatar} alt={author.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            author.name?.[0]?.toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{author.name}</h1>
          <p className="text-sm text-accent">{author.title}</p>
          {author.bio && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{author.bio}</p>}
        </div>
      </div>

      {pinnedPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-gray-400">
            <Pin size={13} /> Pinned
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {pinnedPosts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">All Articles</h2>
      {posts.length === 0 ? (
        <p className="text-sm text-gray-500">No published guides yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthorProfile;
