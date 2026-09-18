import {
  BookOpen,
  Box,
  ChevronRight,
  Eye,
  Loader2,
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
      <div className="absolute inset-0 opacity-15 top-0 left-0">
        <img
          src="/hero.jpg"   // ganti dengan gambar kamu, atau hapus kalau tidak ada
          alt="hero"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col items-start gap-6 px-7 py-8 sm:px-7 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Text content */}
        <div className="max-w-xl">

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Explore networking guides.
            <br />
            <span className="text-accent">Share your knowledge.</span>
          </h1>

          <p className="mt-4 text-base leading-relaxed text-gray-300">
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
const WelcomeRow = ({ userName = "there", onNewPost, isGuest = false }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <div className="border-b border-white/10 px-5 mb-6 h-[11vh] pt-4 pb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative">
        <h1 className="mt-[-5px] text-xl font-semibold tracking-tight">
          {greeting}, {userName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isGuest
            ? "You are currently in Guest mode. Sign up to create guides"
            : "Your network is quiet. Here's what the community is learning"}
        </p>
      </div>

      {/* Hanya tampilkan tombol New post jika BUKAN guest */}
      {!isGuest && (
        <button
          onClick={onNewPost}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          <Plus size={16} /> New post
        </button>
      )}
    </div>
  );
};

// --- Metric cards ------------------------------------------------------------
const MetricCard = ({ icon: Icon, iconClass, label, value, delta, deltaTone = "positive" }) => (
  <div className="surface-card bg-white dark:bg-white/5 flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-[#1E1E2A] p-4 shadow-sm">
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>
      <Icon size={16} />
    </div>
    <span className="text-sm text-gray-500 dark:text-white">{label}</span>
    <strong className="text-xl font-semibold text-gray-900 dark:text-white">{value}</strong>
    <small className="text-xs text-gray-400">
      <span
        className={
          deltaTone === "positive"
            ? "text-emerald-600 dark:text-emerald-400"
            : deltaTone === "neutral"
            ? "text-gray-500 dark:text-white/60"
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
      <div className="mb-8 grid grid-cols-2 px-5 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-xl border border-white bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 px-5">
      <MetricCard
        icon={Wifi}
        iconClass="bg-blue-50 text-blue-600 dark:bg-white dark:text-black"
        label="Signal condition"
        value={signal ? signal.effectiveType.toUpperCase() : "N/A"}
        delta={signal ? `${signal.downlink} Mbps · ${signal.rtt}ms RTT` : "Not supported by this browser"}
        deltaTone="neutral"
      />
      <MetricCard
        icon={BookOpen}
        iconClass="bg-purple-50 text-purple-600 dark:bg-white dark:text-black"
        label="Total guides"
        value={totalGuides}
        delta="Across all categories"
        deltaTone="neutral"
      />
      <MetricCard
        icon={Eye}
        iconClass="bg-orange-50 text-orange-600 dark:bg-white dark:text-black"
        label="Total reads"
        value={totalReads}
        delta="All-time views"
        deltaTone="neutral"
      />
      <MetricCard
        icon={Tag}
        iconClass="bg-emerald-50 text-emerald-600 dark:bg-white dark:text-black"
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
  const [selected, setSelected] = useState("Core switch");
  const nodes = [
    { name: "Gateway", x: 50, y: 30, tone: "bg-orange-400" },
    { name: "Core switch", x: 50, y: 58, tone: "bg-blue-500" },
    { name: "Access point", x: 22, y: 83, tone: "bg-purple-500" },
    { name: "NAS", x: 78, y: 83, tone: "bg-emerald-500" },
  ];

  return (
    <section className="surface-card rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-start justify-between">
        <a target="_blank" href="https://mikrotik.com/" rel="noopener noreferrer">
          <button className="flex items-center gap-1 text-sm font-medium text-accent dark:text-white hover:underline">
            Open web <ChevronRight size={14} />
          </button>
        </a>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Map your network, inspect a node
      </p>

      <div className="relative h-56 w-full rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
        <img src="/mikrotik.png" alt="logo-mikrotik" className='w-[56%] h-full object-contain' />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mikrotik
        </span>
        <span>
          Selected: <strong className="text-gray-700">{selected}</strong>
        </span>
      </div>
    </section>
  );
};

const Card2 = () => {
  const [selected, setSelected] = useState("Core switch");
  const nodes = [
    { name: "Gateway", x: 50, y: 30, tone: "bg-orange-400" },
    { name: "Core switch", x: 50, y: 58, tone: "bg-blue-500" },
    { name: "Access point", x: 22, y: 83, tone: "bg-purple-500" },
    { name: "NAS", x: 78, y: 83, tone: "bg-emerald-500" },
  ];

  return (
    <section className="surface-card rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-start justify-between">
        <a target="_blank" href="https://ui.com/" rel="noopener noreferrer">
          <button className="flex items-center gap-1 text-sm font-medium text-accent dark:text-white hover:underline">
            Open web <ChevronRight size={14} />
          </button>
        </a>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Map your network, inspect a node
      </p>

      <div className="relative h-56 w-full rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
        <img src="/ubiquiti.png" alt="logo-ubiquiti" className='w-[40%] h-full object-contain' />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ubiquiti
        </span>
        <span>
          Selected: <strong className="text-gray-700">{selected}</strong>
        </span>
      </div>
    </section>
  );
};

const Card3 = () => {
  const [selected, setSelected] = useState("Core switch");
  const nodes = [
    { name: "Gateway", x: 50, y: 30, tone: "bg-orange-400" },
    { name: "Core switch", x: 50, y: 58, tone: "bg-blue-500" },
    { name: "Access point", x: 22, y: 83, tone: "bg-purple-500" },
    { name: "NAS", x: 78, y: 83, tone: "bg-emerald-500" },
  ];

  return (
    <section className="surface-card rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-start justify-between">
        <a target="_blank" href="https://www.tp-link.com/" rel="noopener noreferrer">
          <button className="flex items-center gap-1 text-sm font-medium text-accent dark:text-white hover:underline">
            Open web <ChevronRight size={14} />
          </button>
        </a>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Map your network, inspect a node
      </p>

      <div className="relative h-56 w-full rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
        <img src="/tplink.png" alt="logo-tplink" className='w-[40%] h-full object-contain' />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Tp-Link
        </span>
        <span>
          Selected: <strong className="text-gray-700">{selected}</strong>
        </span>
      </div>
    </section>
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

  // Stats overview (hanya di-load sekali, tidak ikut filter)
  const [stats, setStats] = useState({
    totalGuides: 0,
    totalReads: 0,
    totalCategories: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);

  // 1) Stats global — HANYA sekali saat mount
  useEffect(() => {
    setStatsLoading(true);
    api
      .get("/posts", { params: { limit: 100 } }) // tanpa category/search
      .then(({ data }) => {
        const posts = data.posts || [];
        const pinned = data.pinned || [];
        const all = [...pinned, ...posts];

        const totalReads = all.reduce((sum, p) => sum + (p.views || 0), 0);

        setStats({
          totalGuides: data.total ?? posts.length,
          totalReads,
          totalCategories: data.categories?.length || 0,
        });
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []); // ← dependency kosong = tidak refetch saat ganti category

  // 2) List posts — berubah saat category/search
  useEffect(() => {
    setLoading(true);
    api
      .get("/posts", { params: { category, search } })
      .then(({ data }) => setData(data))
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, [category, search]);

  // Signal browser
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

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const isGuest = user?.isGuest || user?.role === "guest";

  // Menghitung statistik langsung dari data pos yang diterima
  const categoryStats = useMemo(() => {
    if (!data.posts || data.posts.length === 0) return [];
    
    // Kelompokkan & hitung jumlah post per kategori
    const counts = data.posts.reduce((acc, post) => {
      const cat = post.category || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map((cat) => ({
      category: cat,
      count: counts[cat],
    }));
  }, [data.posts]);

  // Menghitung total reads (jumlah akumulasi views dari seluruh post)
  const totalReads = useMemo(() => {
    if (!data.posts) return 0;
    return data.posts.reduce((sum, post) => sum + (post.views || 0), 0);
  }, [data.posts]);

  const totalGuides = data.total || data.posts?.length || 0;
  const totalCategories = data.categories?.length || categoryStats.length || 0;

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

  return (
    <div className="mx-auto max-w-full border-r border-white/10 pr-0 shadow-none">
      {/* ===== GUEST → Jumbotron | USER → Welcome + Metrics ===== */}
      {
        user?.isGuest || user?.role === "guest" ? (
          <div className="w-full px-6 pt-6">
            <GuestJumbotron onRegister={() => navigate("/register")} />
          </div>
        ) : (
          <>
            <WelcomeRow
              userName={user?.name || "there"}
              onNewPost={() => navigate("/create")}
              isGuest={false}
            />
            <MetricGrid
              signal={signal}
              totalGuides={totalGuides}
              totalReads={totalReads}
              totalCategories={totalCategories}
              loading={loading}
            />
          </>
        )
      }


      <div className="border-t border-white/10 mb-6"></div>

      <div className="px-6 pb-6">
        <div className="px-7 py-7 sm:px-4 w-full sm:py-4 relative bg-white/5 rounded-xl">
          {/* Header Search & Title */}
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-accent">
                New Knowledge
              </p>
              <h2 className="text-xl font-semibold tracking-tight">{headingText}</h2>
            </div>
          </header>

          <div className="w-full flex items-center gap-2.5 mb-6">
            <form
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 shadow-sm sm:w-72"
              onSubmit={(e) => {
                e.preventDefault();
                updateParam("search", localSearch);
              }}
            >
              <Search size={16} className="text-gray-400" />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search guides"
                className="w-full bg-transparent text-sm outline-none"
              />
            </form>

            {/* Categories Bar */}
            {data.categories?.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2.5">
                <button
                  onClick={() => updateParam("category", "")}
                  className={`rounded-xl border px-3 py-1.5 text-sm transition ${
                    !category
                      ? "border-accent bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-accent/50"
                  }`}
                >
                  All guides
                </button>
                {data.categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => updateParam("category", item)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition ${
                      category === item
                        ? "border-accent bg-blue-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-accent/50 hover:bg-slate-200"
                    }`}
                  >
                    <Box size={14} />
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-accent" size={28} />
            </div>
          ) : (
            <>
              {/* Section Pinned Hero */}
              {showOverviewSections && data.pinned?.length > 0 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Sparkles size={15} />
                    <span>Pinned</span>
                  </div>
                  <PinnedHero pinned={data.pinned} />
                </section>
              )}

              {/* Posts Grid */}
              <section className="mb-8">
                {data.posts.length === 0 ? (
                  <div className="surface-card flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <img src="/notFound.png" alt="No guides" className="h-24 w-24 mb-1.5" />
                    <p className="font-medium">No guides here yet</p>
                    <p className="text-sm text-gray-500">
                      Be the first to publish one for this category.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {data.posts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                )}
              </section>

              <div className="border-t border-white/10 mb-6"></div>

              {/* Category Count Grid & Interactive Tools */}
              {showOverviewSections && (
                <>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-accent">
                      Network brands
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight">{'Popular Brands'}</h2>
                  </div>
                  <div className="mb-0 mt-7 grid grid-cols-1 gap-5 lg:grid-cols-3">
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