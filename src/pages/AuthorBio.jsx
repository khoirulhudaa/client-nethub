import {
    BookOpen,
    Calendar,
    Eye,
    Heart,
    Loader2,
    UserCheck,
    UserPlus,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import PostCard from "../components/Post/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const AuthorBio = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [stats, setStats] = useState({
    guides: 0,
    totalViews: 0,
    totalLikes: 0,
    followers: 0,
    following: 0,
  });

  const isGuest = user?.isGuest || user?.role === "guest";
  const isOwnProfile = user &&
  (String(user.id) === String(id) || String(user._id) === String(id));

  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.get(`/auth/authors/${id}`),
      api.get("/posts", { params: { author: id, limit: 50 } }),
    ])
      .then(async ([authorRes, postsRes]) => {
        const authorData = authorRes.data.user;

        // Gabungkan pinned + posts
        const pinned = postsRes.data.pinned || [];
        const normal = postsRes.data.posts || [];
        const postList = [...pinned, ...normal];

        setAuthor(authorData);
        setPosts(postList);

        const totalViews = postList.reduce((s, p) => s + (p.views || 0), 0);
        const totalLikes = postList.reduce(
          (s, p) => s + (p.likes?.length || 0),
          0
        );

        setStats({
          guides: postsRes.data.total + pinned.length, // atau postList.length
          totalViews,
          totalLikes,
          followers: authorData.followersCount || 0,
          following: authorData.followingCount || 0,
        });
        
        // Cek follow status (skip guest & own profile)
        if (user && !isGuest && !isOwnProfile) {
          try {
            const { data } = await api.get("/auth/me/following");
            const ids = (data.following || []).map((u) => String(u._id || u.id || u));
            console.log("following ids:", ids);
            console.log("author id dari URL:", String(id));
            console.log("match?", ids.includes(String(id)));
            setIsFollowing(ids.includes(String(id)));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        setAuthor(null);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [id, user, isGuest, isOwnProfile]);

  const handleFollow = async () => {
    if (!user || isGuest) {
      toast.error("Daftar dulu untuk follow author");
      return;
    }
    if (isOwnProfile) return;

    setFollowLoading(true);
    try {
      const { data } = await api.post(`/auth/follow/${id}`);
        setIsFollowing(data.following);
        if (typeof data.followersCount === "number") {
        setStats((s) => ({ ...s, followers: data.followersCount }));
        }
      toast.success(data.following ? "Berhasil follow" : "Unfollow berhasil");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal follow");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-full md:border-x border-white dark:border-white/10 min-h-screen">
        <div className="md:p-6">
          <div className="flex justify-center flex-col h-full items-center rounded-xl bg-slate-300 dark:surface-card text-center py-14 md:py-24">
            <img src="/cloud.png" alt="icon-cloud" className="w-20" />
            <p className="mt-2">Load content ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="py-24 text-center">
        <p className="font-medium">Author tidak ditemukan</p>
        <Link to="/" className="mt-2 inline-block text-sm text-accent hover:underline">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const joinedDate = author.createdAt
    ? new Date(author.createdAt).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-full md:border-x border-white dark:border-white/10 min-h-screen px-4 py-6 sm:px-6">
      {/* ===== Header ===== */}
      <div className="surface-card mb-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 dark:bg-white/[0.03]">
        {/* Cover strip */}
        <div className="h-28 sm:h-36 overflow-hidden">
            <img src="/hero.jpg" alt="wallpaper" className="relative top-[0%] object-contain opacity-10" />
        </div>

        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-accent-soft text-3xl font-bold text-accent shadow-lg dark:border-[#12121b]">
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  author.name?.[0]?.toUpperCase()
                )}
              </div>

              <div className="pb-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {author.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {author.title || "Network Enthusiast"}
                  {author.username ? ` · @${author.username}` : ""}
                </p>
              </div>
            </div>

            {user && !isGuest && !isOwnProfile && (
            <button 
                onClick={handleFollow} 
                disabled={followLoading}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isFollowing
                    ? "border border-gray-300 bg-transparent text-gray-600 hover:bg-red-700 dark:border-white/20 dark:text-gray-300"
                    : "bg-accent text-white hover:opacity-90"
                }`}
            >
                {followLoading ? (
                <Loader2 size={15} className="animate-spin" />
                ) : isFollowing ? (
                <>
                    <UserCheck size={15} /> Following
                </>
                ) : (
                <>
                    <UserPlus size={15} /> Subscribe
                </>
                )}
            </button>
            )}
          </div>

          {/* Bio */}
          {author.bio ? (
            <p className="mb-5 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {author.bio}
            </p>
          ) : (
            <p className="mb-5 text-sm italic text-gray-600 dark:text-gray-400">
              Belum ada bio
            </p>
          )}

          {/* Meta */}
          {joinedDate && (
            <p className="mb-5 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Calendar size={13} />
              Bergabung {joinedDate}
            </p>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <StatPill icon={BookOpen} label="Guides" value={stats.guides} />
            <StatPill icon={Eye} label="Views" value={stats.totalViews} />
            <StatPill icon={Heart} label="Likes" value={stats.totalLikes} />
            <StatPill icon={Users} label="Followers" value={stats.followers} />
            <StatPill icon={UserPlus} label="Following" value={stats.following} />
          </div>
        </div>
      </div>

      {/* ===== Guides ===== */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white dark:text-gray-400">
          Guides By {author.name}
        </h2>
        <span className="text-xs text-gray-400">{posts.length} guide</span>
      </div>

      {posts.length === 0 ? (
        <div className="surface-card rounded-xl border border-gray-200 py-14 text-center dark:border-white/10">
          <p className="text-sm text-gray-500">
            Belum ada guide dari author ini
          </p>
        </div>
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

const StatPill = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-white/5 dark:!bg-[#0c0c18]">
    <div className="mb-1 flex items-center gap-1.5 text-gray-600  dark:text-gray-400">
      <Icon size={13} />
      <span className="text-[11px] font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
    <p className="text-lg font-semibold tabular-nums text-gray-900 dark:text-white">
      {Number(value).toLocaleString("id-ID")}
    </p>
  </div>
);

export default AuthorBio;