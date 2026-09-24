import { Loader2, UserMinus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const Following = () => {
  const { user } = useAuth();
  const isGuest = user?.isGuest || user?.role === "guest";

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/me/following");
      setList(data.following || []);
    } catch {
      toast.error("Gagal memuat daftar following");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGuest) load();
    else setLoading(false);
  }, [isGuest]);

  const handleUnfollow = async (authorId) => {
    setBusyId(authorId);
    try {
      await api.post(`/auth/follow/${authorId}`);
      setList((prev) => prev.filter((u) => u._id !== authorId));
      toast.success("Unfollow berhasil");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal unfollow");
    } finally {
      setBusyId(null);
    }
  };

  if (isGuest) {
    return (
      <div className="mx-auto max-w-full md:border-x border-white dark:border-white/10 min-h-screen md:p-6">
        <div className="surface-card dark:bg-white/5 rounded-xl p-8 text-center">
          <Users className="mx-auto mb-3 text-gray-400" size={32} />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Login dulu untuk melihat daftar following.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full md:border-x border-white dark:border-white/10 min-h-screen md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Following
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Guider yang kamu ikuti
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : list.length === 0 ? (
        <div className="surface-card dark:bg-white/5 rounded-xl border border-border-light dark:border-border-dark py-14 text-center">
          <Users className="mx-auto mb-3 text-gray-400" size={32} />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belum follow siapa pun.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((author) => (
            <div
              key={author._id}
              className="surface-card dark:bg-white/5 flex items-center gap-4 rounded-xl border border-border-light p-4 dark:border-border-dark"
            >
              <Link
                to={`/authors/detail/${author._id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-500 text-sm font-semibold text-white dark:bg-gradient-to-br dark:from-blue-400 dark:to-blue-100 dark:text-slate-900">
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    author.name?.[0]?.toUpperCase() || "?"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {author.name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {author.title || "Network Engineer"}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                disabled={busyId === author._id}
                onClick={() => handleUnfollow(author._id)}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                {busyId === author._id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserMinus size={14} />
                )}
                Unfollow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Following;