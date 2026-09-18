import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import PostCard from "../components/Post/PostCard.jsx";

const PERIODS = [
  { label: "7 hari", value: 7 },
  { label: "30 hari", value: 30 },
  { label: "All time", value: 3650 },
];

const Trending = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    setLoading(true);
    api
      .get("/posts/trending", { params: { limit: 12, period } })
      .then(({ data }) => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <span className="text-xs font-semibold uppercase tracking-wide">Discover</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Trending Guides</h1>
        </div>

        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-xl border px-3 py-1.5 text-sm transition ${
                period === p.value
                  ? "border-accent bg-accent text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-accent/50 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : posts.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="font-medium">Belum ada guide trending</p>
          <p className="text-sm text-gray-500">Coba periode yang lebih panjang.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post, idx) => (
            <div key={post._id} className="relative">
              {idx < 3 && (
                <span className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shadow">
                  #{idx + 1}
                </span>
              )}
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trending;