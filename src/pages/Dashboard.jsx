import Fuse from "fuse.js";
import {
  BookOpen,
  Box,
  Brain,
  ChevronRight,
  Eye,
  Plus,
  Search,
  Sparkles,
  Tag,
  Wifi
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import PinnedHero from "../components/Post/PinnedHero.jsx";
import PostCard from "../components/Post/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const GuestJumbotron = ({ onRegister }) => {
  return (
    <section className="relative mb-7 overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:border-white/10">
      {/* Background image / pattern */}
      <div className="absolute inset-0 opacity-10 top-0 left-0">
        <img
          src="/hero.jpg"   // ganti dengan gambar kamu, atau hapus kalau tidak ada
          alt="hero"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-2 flex flex-col items-start gap-6 p-3 md:p-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Text content */}
        <div className="max-w-xl">

          <h1 className="text-2xl font-bold tracking-tight text-white md:text-4xl">
            Explore networking guides
            <br />
            <span className="text-accent">Share your knowledge</span>
          </h1>

          <p className="mt-4 text-sm md:text-base leading-relaxed text-gray-300">
            You are reading as a guest. Sign up for free to create guides, share topologies, write step-by-step instructions, and help the networking community.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={onRegister}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90"
            >
              Sign up as a Guider
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

            <span className="text-sm text-gray-400">
              Free forever
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Welcome / greeting row -------------------------------------------------
const WelcomeRow = ({ userName = "reader", onNewPost, isGuest = false }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <div className="relative h-max border-b border-slate-300 dark:border-white/10 px-0 md:px-6 mb-6 md:h-[11vh] md:pt-4 pb-4 flex flex-col gap-4 md:flex-row md:items-center sm:justify-between">
      <div className="relative">
        <h1 className="mt-[1px] text-xl text-white font-semibold tracking-tight">
          {greeting}, {userName}
        </h1>
        <p className="mt-1 text-sm dark:text-gray-400 text-gray-200">
          {isGuest
            ? "You are currently in Guest mode. Sign up to create guides"
            : "Your network is quiet. Here's what the community is learning"}
        </p>
      </div>

      {/* Hanya tampilkan tombol New post jika BUKAN guest */}
      {!isGuest && (
        <button
          onClick={onNewPost}
          className="relative w-full active:scale-[0.99] duration-100 md:w-max flex md:inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-transparent px-3 md:px-4 py-2 text-sm font-medium text-slate-900 dark:text-white border border-white/15 shadow-sm transition hover:opacity-90"
        >
          <Plus size={16} /> New post
        </button>
      )}
    </div>
  );
};

// --- Metric cards ------------------------------------------------------------
const MetricCard = ({ icon: Icon, iconClass, label, value, delta, deltaTone = "positive" }) => (
  <div className="bg-white dark:bg-gradient-to-br dark:from-blue-400 dark:to-blue-100 flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-none p-3 md:p-4 shadow-sm dark:shadow-none">
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>
      <Icon size={16} />
    </div>
    <span className="text-sm font-semibold text-blue-950">{label}</span>
    <strong className="text-xl font-semibold text-blue-950">{value}</strong>
    <small className="text-xs text-blue-950">
      <span
        className={
          deltaTone === "positive"
            ? "text-emerald-600 dark:text-emerald-400"
            : deltaTone === "neutral"
            ? "text-blue-950"
            : "text-rose-600 dark:text-rose-400"
        }
      >
        {delta}
      </span>
    </small>
  </div>
);

const MetricGrid = ({ signal, totalGuides, totalReads, totalCategories, loading }) => {
  if (loading) {
    return (
      <div className="mb-8 grid grid-cols-2 md:px-5 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-xl border border-white bg-white" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 md:px-6 z-[9999] relative">
      <MetricCard
        icon={Wifi}
        iconClass="bg-slate-900 text-white"
        label="Signal condition"
        value={signal ? signal.effectiveType.toUpperCase() : "N/A"}
        delta={signal ? `${signal.downlink} Mbps · ${signal.rtt}ms RTT` : "Not supported by this browser"}
        deltaTone="neutral"
      />
      <MetricCard
        icon={BookOpen}
        iconClass="bg-slate-900 text-white"
        label="Total guides"
        value={totalGuides}
        delta="Across all categories"
        deltaTone="neutral"
      />
      <MetricCard
        icon={Eye}
        iconClass="bg-slate-900 text-white"
        label="Total reads"
        value={totalReads}
        delta="All-time views"
        deltaTone="neutral"
      />
      <MetricCard
        icon={Tag}
        iconClass="bg-slate-900 text-white"
        label="Categories"
        value={totalCategories}
        delta="Active categories"
        deltaTone="neutral"
      />
    </div>
  );
};

// --- Topology lab ------------------------------------------------------------
const Card1 = () => {
  return (
    <a
      href="https://mikrotik.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="surface-card group block cursor-pointer active:scale-[0.99] duration-100 rounded-xl border border-gray-200 bg-slate-950 dark:bg-white hover:brightness-[80%] p-3 md:p-5 shadow-sm"
    >
      <div className="mb-1 flex items-start justify-between">
        <span className="flex items-center gap-1 text-sm font-medium text-accent dark:text-white group-hover:underline">
          Open web <ChevronRight size={14} />
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-400 dark:text-gray-500">
        Map your network, inspect a node
      </p>

      <div className="relative h-56 w-full rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src="/mikrotik.png"
          alt="logo-mikrotik"
          className="w-[56%] h-full object-contain group-hover:scale-[1.1] duration-300 ease-out"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mikrotik
        </span>
      </div>
    </a>
  );
};

const Card2 = () => {
  return (
    <a
      href="https://ui.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="surface-card group block cursor-pointer active:scale-[0.99] duration-100 rounded-xl border border-gray-200 bg-slate-950 dark:bg-white hover:brightness-[80%] p-3 md:p-5 shadow-sm"
    >
      <div className="mb-1 flex items-start justify-between">
        <span className="flex items-center gap-1 text-sm font-medium text-white dark:text-white group-hover:underline">
          Open web <ChevronRight size={14} />
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-400 dark:text-gray-500">
        Map your network, inspect a node
      </p>

      <div className="relative h-56 w-full rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src="/ubiquiti.png"
          alt="logo-ubiquiti"
          className="w-[40%] h-full object-contain group-hover:scale-[1.1] duration-300 ease-out"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ubiquiti
        </span>
      </div>
    </a>
  );
};

const Card3 = () => {
  return (
    <a
      href="https://www.tp-link.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="surface-card group block cursor-pointer active:scale-[0.99] duration-100 rounded-xl border border-gray-200 bg-slate-950 dark:bg-white hover:brightness-[80%] p-3 md:p-5 shadow-sm"
    >
      <div className="mb-1 flex items-start justify-between">
        <span className="flex items-center gap-1 text-sm font-medium text-accent dark:text-white group-hover:underline">
          Open web <ChevronRight size={14} />
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-400 dark:text-gray-500">
        Map your network, inspect a node
      </p>

      <div className="relative h-56 w-full rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src="/tplink.png"
          alt="logo-tplink"
          className="w-[40%] h-full object-contain group-hover:scale-[1.1] duration-300 ease-out"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Tp-Link
        </span>
      </div>
    </a>
  );
};

// --- Dashboard Component -----------------------------------------------------
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  const [data, setData] = useState({ pinned: [], posts: [], categories: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState(search);
  const [signal, setSignal] = useState(null);
  const [pinnedFirst, setPinnedFirst] = useState(true); // true = Pinned di atas
  const [allPostsForSearch, setAllPostsForSearch] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [stats, setStats] = useState({
    totalGuides: 0,
    totalReads: 0,
    totalCategories: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const LIMIT = 6;

  // Fetch stats sekali
  useEffect(() => {
    setStatsLoading(true);
    api
      .get("/posts/stats")
      .then(({ data }) => {
        setStats({
          totalGuides: data.totalGuides || 0,
          totalReads: data.totalReads || 0,
          totalCategories: data.totalCategories || 0,
        });
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // ✅ useEffect KEDUA — ini yang benar, biarkan
  useEffect(() => {
    const isLoadMore = page > 1;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    api
      .get("/posts", { params: { category, page, limit: LIMIT } })
      .then(({ data: res }) => {
        setData((prev) => ({
          ...res,
          posts: isLoadMore ? [...prev.posts, ...res.posts] : res.posts,
        }));
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [category, page]);

  // Sync localSearch dari URL
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce: update URL search param setelah user berhenti mengetik 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        updateParam("search", localSearch.trim());
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Network signal
  useEffect(() => {
    const conn =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return;
    const update = () =>
      setSignal({
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
      });
    update();
    conn.addEventListener("change", update);
    return () => conn.removeEventListener("change", update);
  }, []);

  // Reset page ke 1 setiap kali category berubah
  useEffect(() => {
    setPage(1);
  }, [category]);

  // Saat search aktif, fetch SEMUA post (bukan cuma yang sudah ke-load via pagination)
  useEffect(() => {
    if (!search.trim()) {
      setAllPostsForSearch([]);
      return;
    }

    setSearchLoading(true);
    api
      .get("/posts", { params: { category, limit: 1000 } }) // limit besar biar dapet semua
      .then(({ data: res }) => {
        setAllPostsForSearch(res.posts || []);
      })
      .catch((err) => console.error("Error fetching search data:", err))
      .finally(() => setSearchLoading(false));
  }, [search, category]);

  const isGuest = user?.isGuest || user?.role === "guest";

  // === CLIENT-SIDE FILTER BY TITLE (utama) ===
  // const filteredPosts = useMemo(() => {
  //   if (!data.posts) return [];
  //   if (!search.trim()) return data.posts;

  //   const q = search.toLowerCase().trim();
  //   return data.posts.filter((post) => {
  //     const title = (post.title || "").toLowerCase();
  //     const excerpt = (post.excerpt || post.description || post.content || "").toLowerCase();
  //     return title.includes(q) || excerpt.includes(q);
  //   });
  // }, [data.posts, search]);

  const fuse = useMemo(() => {
    const source = search.trim() ? allPostsForSearch : data.posts;
    if (!source || source.length === 0) return null;

    return new Fuse(source, {
      keys: [
        { name: "title", weight: 0.7 },
        { name: "excerpt", weight: 0.2 },
        { name: "tags", weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [data.posts, allPostsForSearch, search]);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return data.posts || [];
    if (!fuse) return [];

    return fuse.search(search.trim()).map((result) => result.item);
  }, [fuse, search, data.posts]);

  const hasMore = data.page < data.pages;
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const showOverviewSections = !search && !category;

  const headingText = useMemo(() => {
    if (search) return `Results for "${search}"`;
    if (category) return `${category} Guides`;
    return "Continue learning";
  }, [search, category]);

  console.log("pinned:", data.pinned?.length, "posts:", data.posts?.length, "total:", data.total);

  return (
    <div className="mx-auto max-w-full md:border-x border-white dark:border-white/10 pr-0 shadow-none">
      {/* Guest / Welcome tetap sama */}
      {user?.isGuest || user?.role === "guest" ? (
        <div className="w-full md:px-6 md:pt-6">
          <GuestJumbotron onRegister={() => navigate("/register")} />
        </div>
      ) : (
        <div className="w-full h-max">
          <WelcomeRow
            userName={user?.name || "reader"}
            onNewPost={() => navigate("/create")}
            isGuest={isGuest}
          />
          <MetricGrid
            signal={signal}
            totalGuides={stats.totalGuides}
            totalReads={stats.totalReads}
            totalCategories={stats.totalCategories}
            loading={statsLoading}
          />
        </div>
      )}

      <div className="border-t border-slate-300 dark:border-white/10 mb-6"></div>

      <div className="md:px-6 pb-6">
        <div className="px-0 pt-3 pb-3 md:px-0 w-full md:py-4 relative rounded-xl bg-white dark:bg-white/5 dark:bg-none">
          {/* Header */}
          <header className="mt-1 px-3 md:px-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-900 dark:text-blue-500">
                New Knowledge
              </p>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-1.5 mt-1">
                <Brain size={17} className="text-slate-900 dark:text-white" />
                <span className="relative top-[-1.2px] text-slate-900 dark:text-white">
                  {headingText}
                </span>
              </h2>
            </div>
          </header>

          {/* Search + Categories */}
          <div className="w-full px-3 py-2 md:p-4 flex items-center gap-2">
            <form
              className="flex w-full mb-0 items-center gap-2 rounded-xl border border-gray-200 bg-slate-950 dark:bg-white px-3 py-1.5 shadow-sm sm:w-72"
              onSubmit={(e) => {
                e.preventDefault();
                updateParam("search", localSearch.trim());
              }}
            >
              <Search size={16} className="text-gray-400" />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by title..."
                className="w-full bg-transparent px-3 md:px-3 py-2 h-[22px] font-medium text-black text-sm outline-none"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch("");
                    updateParam("search", "");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Categories bar — responsive: pills di desktop, dropdown di mobile */}
            {data.categories?.length > 0 && (
              <>
                {/* Mobile: dropdown selector */}
                <div className="w-full sm:hidden">
                  <select
                    value={category || ""}
                    onChange={(e) => updateParam("category", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                  >
                    <option value="">All guides</option>
                    {data.categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Desktop: pill buttons */}
                <div className="hidden sm:flex flex-wrap items-center gap-x-2.5">
                  <button
                    onClick={() => updateParam("category", "")}
                    className={`flex items-center border border-slate-400 gap-1.5 rounded-xl font-medium active:scale-[0.99] px-3 md:px-3 py-2 text-sm transition ${
                      !category
                        ? "bg-slate-950 dark:bg-gradient-to-br from-blue-400 to-blue-100 dark:text-slate-900 text-white"
                        : "bg-white text-gray-600 hover:border-accent/50 hover:bg-slate-200"
                    }`}
                  >
                    <Box size={14} />
                    All guides
                  </button>
                  {data.categories.map((item) => (
                    <button
                      key={item}
                      onClick={() => updateParam("category", item)}
                      className={`flex active:scale-[0.99] border border-slate-400 font-medium duration-100 items-center gap-1.5 rounded-xl px-3 md:px-3 py-2 text-sm transition ${
                        category === item
                          ? "bg-slate-950 dark:bg-gradient-to-br from-blue-400 to-blue-100 text-white dark:text-slate-900"
                          : "bg-white text-gray-600 hover:border-accent/50 hover:bg-slate-200"
                      }`}
                    >
                      <Box size={14} />
                      {item}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          {loading || (search.trim() && searchLoading) ? (
            <div className="p-3 md:p-4">
              <div className="flex surface-card justify-center flex-col h-full items-center text-center py-20">
                <img src="/cloud.png" alt="icon-cloud" className="w-20" />
                <p className="mt-2">Load content ...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ========== PINNED FIRST ========== */}
              {pinnedFirst ? (
                <>
                  {showOverviewSections && data.pinned?.length > 0 && (
                    <section className="mb-8 px-3 md:px-4 md:mt-0 mt-4">
                      <PinnedHero pinned={data.pinned} />
                    </section>
                  )}

                  {/* Posts Grid */}
                  <section className="mb-8 border-t px-3 md:px-4 border-white/10 pt-7">
                    {filteredPosts.length === 0 ? (
                      <div className="surface-card flex flex-col items-center justify-center gap-2 py-16 text-center">
                        <img src="/notFound.png" alt="No guides" className="h-16 w-16 mb-1.5" />
                        <p className="font-medium">
                          {search ? `No guides found for "${search}"` : "No guides here yet"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {search
                            ? "Try a different keyword or clear the search"
                            : "Be the first to publish one for this category"}
                        </p>
                      </div>
                    ) : (
                      <>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredPosts.map((post) => (
                          <PostCard key={post._id} post={post} status={false} />
                        ))}
                      </div>

                      {/* Tombol Load More */}
                      {!search && hasMore && (
                        <div className="mt-6 flex justify-center">
                          <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:brightness-[80%] active:scale-[0.99] duration-100 disabled:opacity-50"
                          >
                            {loadingMore ? "Loading..." : "Load more guides"}
                          </button>
                        </div>
                      )}
                      </>
                    )}
                  </section>
                </>
              ) : (
                /* ========== POSTS FIRST ========== */
                <>
                  {/* Posts Grid */}
                 <section className="mb-8 border-t px-4 border-white/10 pt-7">
                    {filteredPosts.length === 0 ? (
                      <div className="surface-card flex flex-col items-center justify-center gap-2 py-16 text-center">
                        <img src="/notFound.png" alt="No guides" className="h-24 w-24 mb-1.5" />
                        <p className="font-medium">
                          {search ? `No guides found for "${search}"` : "No guides here yet"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {search
                            ? "Try a different keyword or clear the search."
                            : "Be the first to publish one for this category."}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredPosts.map((post) => (
                          <PostCard key={post._id} post={post} />
                        ))}

                        {/* Placeholder cards jika post kurang dari 3 */}
                        {filteredPosts.length < 3 &&
                          Array.from({ length: 3 - filteredPosts.length }).map((_, index) => (
                            <button
                              key={`empty-${index}`}
                              onClick={() => navigate("/create")}
                              className="group flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/25 bg-white/5 p-6 text-center transition hover:border-white/40 hover:bg-white/10"
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:scale-110">
                                <Plus size={22} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">Create your guide</p>
                                <p className="mt-1 text-xs text-white/60">
                                  Share your knowledge with the community
                                </p>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </section>
                  {/* Pinned di bawah */}
                  {showOverviewSections && data.pinned?.length > 0 && (
                    <section className="mb-8 px-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
                        <Sparkles size={15} />
                        <span>Pinned</span>
                      </div>
                      <PinnedHero pinned={data.pinned} />
                    </section>
                  )}
                </>
              )}

              {/* Saat sedang search, tetap tampilkan pinned di bawah (opsional) */}
              {localSearch && data.pinned?.length > 0 && (
                <section className="mb-8 px-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/50">
                    <Sparkles size={15} />
                    <span>Pinned</span>
                  </div>
                  <PinnedHero pinned={data.pinned} />
                </section>
              )}

              {/* Brand cards */}
              {showOverviewSections && (
                <>
                  <div className="w-full border-t px-3 md:px-4 border-slate-400 dark:border-white/10 pt-7">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-900 dark:text-blue-500">
                      Network brands
                    </p>
                    <h2 className="flex items-center text-lg mt-1 font-medium tracking-tight">
                      <Box size={17} className="mr-2 text-slate-900 dark:text-white" />
                      <span className="relative top-[-1.7px] text-slate-900 dark:text-white">
                        Reference brands
                      </span>
                    </h2>
                  </div>
                  <div className="md:mb-2 mt-4 px-3 md:px-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <Card2 />
                    <Card1 />
                    <Card3 />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;