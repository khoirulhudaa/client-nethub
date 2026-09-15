import {
  BookOpen,
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

// --- Welcome / greeting row -------------------------------------------------
const WelcomeRow = ({ userName = "there", onNewPost }) => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-accent">{today}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {greeting}, {userName}.
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your network is quiet. Here&apos;s what the community is learning.
        </p>
      </div>
      <button
        onClick={onNewPost}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
      >
        <Plus size={16} /> New post
      </button>
    </div>
  );
};

// --- Metric cards ------------------------------------------------------------
const MetricCard = ({ icon: Icon, iconClass, label, value, delta, deltaTone = "positive" }) => (
  <div className="surface-card flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>
      <Icon size={16} />
    </div>
    <span className="text-sm text-gray-500">{label}</span>
    <strong className="text-xl font-semibold">{value}</strong>
    <small className="text-xs text-gray-400">
      <span
        className={
          deltaTone === "positive"
            ? "text-emerald-600"
            : deltaTone === "neutral"
            ? "text-gray-500"
            : "text-rose-600"
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
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard
        icon={Wifi}
        iconClass="bg-blue-50 text-blue-600"
        label="Signal condition"
        value={signal ? signal.effectiveType.toUpperCase() : "N/A"}
        delta={signal ? `${signal.downlink} Mbps · ${signal.rtt}ms RTT` : "Not supported by this browser"}
        deltaTone="neutral"
      />
      <MetricCard
        icon={BookOpen}
        iconClass="bg-purple-50 text-purple-600"
        label="Total guides"
        value={totalGuides}
        delta="Across all categories"
        deltaTone="neutral"
      />
      <MetricCard
        icon={Eye}
        iconClass="bg-orange-50 text-orange-600"
        label="Total reads"
        value={totalReads}
        delta="All-time views"
        deltaTone="neutral"
      />
      <MetricCard
        icon={Tag}
        iconClass="bg-emerald-50 text-emerald-600"
        label="Categories"
        value={totalCategories}
        delta="Active categories"
        deltaTone="neutral"
      />
    </div>
  );
};

// --- Category counts grid ----------------------------------------------------
const categoryTone = [
  "bg-blue-50 text-blue-600",
  "bg-purple-50 text-purple-600",
  "bg-orange-50 text-orange-600",
  "bg-emerald-50 text-emerald-600",
];

const CategoryCountGrid = ({ items = [], loading }) => {
  if (loading) {
    return (
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.category}
          className="surface-card flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${categoryTone[index % categoryTone.length]}`}>
            <BookOpen size={16} />
          </div>
          <span className="text-sm text-gray-500">{item.category}</span>
          <strong className="text-xl font-semibold">{item.count}</strong>
        </div>
      ))}
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
          <button className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
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
          <button className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
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
          <button className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
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

  // Ambil data dari 1 endpoint utama
  useEffect(() => {
    setLoading(true);
    api
      .get("/posts", { params: { category, search } })
      .then(({ data }) => setData(data))
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, [category, search]);

  // Handle Signal Connection (Browser API)
  useEffect(() => {
    const conn =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return;
    const update = () =>
      setSignal({ effectiveType: conn.effectiveType, downlink: conn.downlink, rtt: conn.rtt });
    update();
    conn.addEventListener("change", update);
    return () => conn.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

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
    <div className="mx-auto max-w-7xl">
      {/* Overview Greeting */}
      {showOverviewSections && (
        <WelcomeRow
          userName={user?.name || "there"}
          onNewPost={() => navigate("/create")}
        />
      )}

      {/* Grid Metrics */}
      {showOverviewSections && (
        <MetricGrid
          signal={signal}
          totalGuides={totalGuides}
          totalReads={totalReads}
          totalCategories={totalCategories}
          loading={loading}
        />
      )}

      {/* Header Search & Title */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-accent">
            New Knowledge
          </p>
          <h2 className="text-xl font-semibold tracking-tight">{headingText}</h2>
        </div>

        <form
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm sm:w-72"
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
      </header>

      {/* Categories Bar */}
      {data.categories?.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-x-2.5">
          <button
            onClick={() => updateParam("category", "")}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              !category
                ? "border-accent bg-accent text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-accent/50"
            }`}
          >
            All guides
          </button>
          {data.categories.map((item) => (
            <button
              key={item}
              onClick={() => updateParam("category", item)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                category === item
                  ? "border-accent bg-accent text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-accent/50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

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

          {/* Category Count Grid & Interactive Tools */}
          {showOverviewSections && (
            <>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                  Network brands
                </p>
                <h2 className="text-xl font-semibold tracking-tight">{'Popular Brands'}</h2>
              </div>
              <div className="mb-8 mt-7 grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Card2 />
                <Card1 />
                <Card3 />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;