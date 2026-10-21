import Fuse from "fuse.js";
import {
  ArrowRight,
  BookOpen,
  Box,
  Brain,
  ChevronDown,
  ChevronRight,
  Eye,
  Key,
  Lock,
  Plus,
  Search,
  Sparkles,
  Tag,
  User2,
  UserCircle,
  Wifi,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import PinnedHero from "../components/Post/PinnedHero.jsx";
import PostCard from "../components/Post/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// --- Search helpers ---------------------------------------------------------
const STOP_WORDS = new Set([
  "cara", "yang", "di", "ke", "dari", "dan", "atau", "untuk", "pada", "dengan",
  "saat", "ketika", "akan", "itu", "ini", "ada", "adalah", "agar", "jika",
  "kalau", "bisa", "apa", "bagaimana", "kenapa", "mengapa", "the", "a", "of", "to",
]);

// Normalisasi ringan bahasa Indonesia: isinya -> isi, errornya -> error
const normalizeToken = (t) => t.replace(/(nya|lah|kah|ku|mu)$/i, "");

const tokenize = (query) => {
  const all = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map(normalizeToken)
    .filter((t) => t.length >= 2);

  const meaningful = all.filter((t) => !STOP_WORDS.has(t));
  // kalau semua kata ternyata stop word, tetap pakai semuanya
  return Array.from(new Set(meaningful.length ? meaningful : all));
};

// --- Welcome / greeting row -------------------------------------------------
const WelcomeRow = ({ userName = "reader", onNewPost, isGuest = false, isUser=false }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <div className="relative h-max border-b border-slate-300 dark:border-white/10 px-0 md:px-6 mb-6 md:h-[11vh] md:pt-4 pb-4 flex flex-col gap-4 md:flex-row md:items-center sm:justify-between">
      <div className="relative">
        <h1 className="mt-[1px] text-xl text-white font-semibold tracking-tight">
          {greeting}, {userName}
        </h1>
        <p className="mt-1 text-sm dark:text-gray-400 text-gray-300">
          {(isGuest || isUser)
            ? "You are currently in Guest mode. Sign up to create guides"
            : "Your network is quiet. Here's what the community is learning"}
        </p>
      </div>

      {/* Hanya tampilkan tombol New post jika BUKAN guest */}
      {(!isGuest && !isUser) && (
        <button
          onClick={onNewPost}
          className="relative w-full active:scale-[0.99] duration-100 md:w-max flex md:inline-flex items-center gap-1.5 rounded-lg bg-slate-200 dark:bg-transparent px-3 md:px-4 py-2 text-sm font-medium text-slate-900 dark:text-white border border-white/15 shadow-sm transition hover:opacity-90"
        >
          <Plus size={16} /> New guide
        </button>
      )}
    </div>
  );
};

// --- Metric cards ------------------------------------------------------------
const MetricCard = ({ icon: Icon, iconClass, label, value }) => (
  <div className="bg-slate-200 dark:bg-gradient-to-br dark:from-blue-400 dark:to-blue-100 flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-none p-3 md:p-4 !pb-2 shadow-sm dark:shadow-none">
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>
      <Icon size={16} />
    </div>
    <span className="text-sm font-semibold text-blue-950">{label}</span>
    <strong className="text-xl font-semibold text-blue-950">{value}</strong>
  </div>
);

const CategoryBarSkeleton = () => (
  <>
    {/* Mobile: dropdown */}
    <div className="mt-2 w-full sm:hidden">
      <SkeletonBlock className="h-10 w-full rounded-xl" />
    </div>

    {/* Desktop: pills */}
    <div className="hidden sm:flex flex-wrap items-center mt-3 gap-2.5">
      {[96, 80, 104, 88, 72].map((w, i) => (
        <SkeletonBlock key={i} className="h-9 rounded-xl" style={{ width: w }} />
      ))}
    </div>
  </>
);

// const SkeletonBlock = ({ className = "", style }) => (
//   <div style={style} className={`animate-pulse rounded-lg bg-slate-300 dark:bg-white/10 ${className}`} />
// );

const MetricGrid = ({ signal, totalGuides, totalReads, totalCategories, loading }) => {
  if (loading) {
    return (
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 md:px-6 relative">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 md:px-6 z-[9999] relative">
      <MetricCard
        icon={Wifi}
        iconClass="bg-orange-600 text-white"
        label="Signal condition"
        value={signal ? signal.effectiveType.toUpperCase() : "N/A"}
        delta={signal ? `${signal.downlink} Mbps · ${signal.rtt}ms RTT` : "Not supported by this browser"}
        deltaTone="neutral"
      />
      <MetricCard
        icon={BookOpen}
        iconClass="bg-green-600 text-white"
        label="Knowledges"
        value={totalGuides}
        delta="Across all categories"
        deltaTone="neutral"
      />
      <MetricCard
        icon={UserCircle}
        iconClass="bg-blue-600 text-white"
        label="Total users"
        value={2}
        delta="All account"
        deltaTone="neutral"
      />
      <MetricCard
        icon={Tag}
        iconClass="bg-cyan-600 text-white"
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
      className="surface-card group block cursor-pointer active:scale-[0.99] duration-100 rounded-xl border border-gray-200 bg-slate-300 dark:bg-slate-950 hover:brightness-[80%] !p-3.5 md:!p-4 shadow-sm"
    >
      <div className="mb-1 flex items-start justify-between">
        <span className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white group-hover:underline">
          Open web <ChevronRight size={14} />
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-gray-500">
        Map your network, inspect a node
      </p>

      <div className="relative h-56 w-full rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src="/mikrotik.png"
          alt="logo-mikrotik"
          className="w-[56%] h-full object-contain group-hover:scale-[1.1] duration-300 ease-out"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-gray-500">
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
      className="surface-card group block cursor-pointer active:scale-[0.99] duration-100 rounded-xl border border-gray-200 bg-slate-300 dark:bg-slate-950 hover:brightness-[80%] !p-3.5 md:!p-4 shadow-sm"
    >
      <div className="mb-1 flex items-start justify-between">
        <span className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white group-hover:underline">
          Open web <ChevronRight size={14} />
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-gray-500">
        Map your network, inspect a node
      </p>

      <div className="relative h-56 w-full rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src="/ubiquiti.png"
          alt="logo-ubiquiti"
          className="w-[40%] h-full object-contain group-hover:scale-[1.1] duration-300 ease-out"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-gray-500">
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
      className="surface-card group block cursor-pointer active:scale-[0.99] duration-100 rounded-xl border border-gray-200 bg-slate-300 dark:bg-slate-950 hover:brightness-[80%] !p-3.5 md:!p-4 shadow-sm"
    >
      <div className="mb-1 flex items-start justify-between">
        <span className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white group-hover:underline">
          Open web <ChevronRight size={14} />
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-gray-500">
        Map your network, inspect a node
      </p>

      <div className="relative h-56 w-full rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src="/tplink.png"
          alt="logo-tplink"
          className="w-[40%] h-full object-contain group-hover:scale-[1.1] duration-300 ease-out"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Tp-Link
        </span>
      </div>
    </a>
  );
};

// --- Skeleton ----------------------------------------------------------------
const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-slate-300 dark:bg-white/10 ${className}`} />
);

const MetricCardSkeleton = () => (
  <div className="flex flex-col gap-2 rounded-xl border border-transparent bg-slate-200 dark:bg-white/5 p-3 md:p-4 !pb-2">
    <SkeletonBlock className="h-8 w-8 rounded-lg" />
    <SkeletonBlock className="h-4 w-24" />
    <SkeletonBlock className="h-6 w-14" />
  </div>
);

const PostCardSkeleton = () => (
  <div className="rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-3 md:p-4">
    <SkeletonBlock className="h-40 md:flex hidden w-full rounded-lg" />
    <div className="md:mt-4 flex gap-2">
      <SkeletonBlock className="h-6 md:h-5 w-12 md:w-16 rounded-full" />
      <SkeletonBlock className="h-5  md:flex hidden w-20 rounded-full" />
    </div>
    <SkeletonBlock className="mt-3 h-5 w-4/5" />
    <SkeletonBlock className="mt-2 h-4 w-full" />
    <SkeletonBlock className="mt-1.5 h-4 w-2/3" />
    <div className="mt-4 flex items-center gap-2">
      <SkeletonBlock className="h-6 w-6 rounded-full" />
      <SkeletonBlock className="h-3 w-24" />
    </div>
  </div>
);

const DashboardSkeleton = ({ showPinned = false }) => (
  <div aria-busy="true" aria-label="Loading content">
    {showPinned && (
      <section className="mb-8 px-3 md:px-4 mt-4 md:mt-0">
        <SkeletonBlock className="h-56 md:h-72 w-full rounded-2xl" />
      </section>
    )}

    <section className="mb-8 px-3 md:px-4">
      <div className="mb-4 flex items-center gap-2">
        <SkeletonBlock className="h-5 w-5" />
        <SkeletonBlock className="h-5 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </section>
  </div>
);

const TagFilter = ({ tags, selected, onToggle, onClear, loading }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading && !tags.length) {
    return <div className="h-10 w-full sm:w-56 animate-pulse rounded-xl bg-slate-300" />;
  }
  if (!tags.length) return null;

  const visible = tags.filter((t) => t.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div ref={ref} className="relative w-full sm:w-56">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white dark:bg-slate-200 px-3 py-2.5 text-sm text-gray-600 dark:border-slate-700"
      >
        <span className="flex items-center gap-2 truncate">
          <Tag size={14} />
          {selected.length ? `${selected.length} tags selected` : "All tags"}
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 h-max z-50 mt-2 w-full min-w-[50vw] p-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-200">
          <div className="border-b border-gray-200 pr-2 pl-1 mb-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find tag..."
              className="w-full rounded-lg bg-white px-2.5 py-1.5 text-sm text-black outline-none"
            />
          </div>

          <ul className="max-h-[40vh] grid grid-cols-4 md:grid-cols-6 gap-1.5 overflow-y-auto p-1">
            {visible.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No tag found</li>
            )}
            {visible.map((tag) => {
              const checked = selected.includes(tag);
              return (
                <li key={tag}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg px-1 border border-slate-400 py-1 text-sm text-slate-800 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(tag)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="truncate">{tag}</span>
                  </label>
                </li>
              );
            })}
          </ul>

          {selected.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <button
                type="button"
                onClick={onClear}
                className="w-full rounded-lg py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Dashboard Component -----------------------------------------------------
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tagsParam = searchParams.get("tags") || "";
  const selectedTags = useMemo(
    () => (tagsParam ? tagsParam.split(",").filter(Boolean) : []),
    [tagsParam]
  );
  const tagsKey = selectedTags.join(",");
  const hasTagFilter = selectedTags.length > 0;
  const search = searchParams.get("search") || "";

  const [data, setData] = useState({ pinned: [], posts: [], categories: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState(search);
  const [signal, setSignal] = useState(null);
  const [pinnedFirst, setPinnedFirst] = useState(true); // true = Pinned di atas
  const [allPostsForSearch, setAllPostsForSearch] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const guidesRef = useRef(null);

  const [stats, setStats] = useState({
    totalGuides: 0,
    totalReads: 0,
    totalCategories: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // const LIMIT = 4;
  const PAGE_SIZES = [6, 12, 24, 32, 60];

  const [limit, setLimit] = useState(() => {
  const saved = Number(localStorage.getItem("nethub_page_size"));
    return PAGE_SIZES.includes(saved) ? saved : 12;
  });
  const [searchShown, setSearchShown] = useState(limit); // jumlah tampil saat search aktif

  useEffect(() => {
    localStorage.setItem("nethub_page_size", String(limit));
  }, [limit]);

  const handleLimitChange = (n) => {
    setLimit(n);
    setPage(1);
    setSearchShown(n);
  };

  useEffect(() => {
    setPage(1);
    setSearchShown(limit);
  }, [tagsKey, search]);

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

  useEffect(() => {
    setPage(1);
    setSearchShown(limit);
  }, [tagsKey, search]);

  // ✅ useEffect KEDUA — ini yang benar, biarkan
  useEffect(() => {
    let cancelled = false;
    const isLoadMore = page > 1;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    api
      .get("/posts", { params: { tags: tagsKey || undefined, page, limit } })
      .then(({ data: res }) => {
        if (cancelled) return;

        setData((prev) => {
          if (!isLoadMore) return { ...res };

          const seen = new Set(prev.posts.map((p) => p._id));
          const fresh = res.posts.filter((p) => !seen.has(p._id));
          return { ...res, pinned: prev.pinned, posts: [...prev.posts, ...fresh] };
        });
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setLoadingMore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tagsKey, page, limit]);

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

  // Saat search aktif, fetch SEMUA post (bukan cuma yang sudah ke-load via pagination)
  useEffect(() => {
    if (!search.trim()) {
      setAllPostsForSearch([]);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    api
      .get("/posts", { params: { tags: tagsKey || undefined, limit: 1000 } })
      .then(({ data: res }) => {
        if (!cancelled) setAllPostsForSearch(res.posts || []);
      })
      .catch((err) => console.error("Error fetching search data:", err))
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, tagsKey]);

  const isGuest = user?.isGuest || user?.role === "guest";
  const isUser = user?.role === "user";

  // Sumber data search: semua post + pinned (backend menyembunyikan pinned dari list biasa)
  const searchSource = useMemo(() => {
    if (!search.trim()) return data.posts || [];
    const map = new Map();
    [...allPostsForSearch, ...(data.pinned || [])].forEach((p) => {
      if (p?._id) map.set(String(p._id), p);
    });
    return Array.from(map.values());
  }, [search, allPostsForSearch, data.posts, data.pinned]);

  const fuse = useMemo(() => {
    if (!searchSource.length) return null;
    return new Fuse(searchSource, {
      keys: [
        { name: "title", weight: 0.6 },
        { name: "excerpt", weight: 0.2 },
        { name: "tags", weight: 0.1 },
        { name: "category", weight: 0.1 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [searchSource]);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return data.posts || [];
    if (!fuse) return [];

    const tokens = tokenize(search);
    if (!tokens.length) return [];

    // cari tiap kata, kumpulkan skor per post
    const board = new Map(); // id -> { item, matched, score }
    tokens.forEach((token) => {
      fuse.search(token).forEach(({ item, score }) => {
        const id = String(item._id);
        const entry = board.get(id) || { item, matched: 0, score: 0 };
        entry.matched += 1;
        entry.score += 1 - (score ?? 0); // makin besar makin relevan
        board.set(id, entry);
      });
    });

    // minimal separuh kata harus cocok (3 kata -> minimal 2)
    const minMatch = Math.max(1, Math.ceil(tokens.length / 2));

    return Array.from(board.values())
      .filter((e) => e.matched >= minMatch)
      .sort((a, b) => b.matched - a.matched || b.score - a.score)
      .map((e) => e.item);
  }, [fuse, search, data.posts]);

  // Sumber post untuk overview (guest)
const overviewPosts = useMemo(() => {
  // Guest + tidak ada search/category → gabungkan pinned + posts
  if (isGuest && !search.trim() && !hasTagFilter) {
    const map = new Map();
    [...(data.pinned || []), ...(data.posts || [])].forEach((p) => {
      if (p?._id) map.set(String(p._id), p);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
  // Selain itu pakai filteredPosts biasa
  return filteredPosts;
}, [isGuest, search, hasTagFilter, data.pinned, data.posts, filteredPosts]);

const { remainingPosts } = useMemo(() => {
  if (search.trim() || hasTagFilter) {
    return { newestThree: [], remainingPosts: overviewPosts };
  }

  // Overview → split ke Top 3 + Other guides
  const sorted = overviewPosts;
  return {
    newestThree: sorted.slice(0, 3),
    remainingPosts: filteredPosts,
  };
  }, [overviewPosts, search, hasTagFilter]);

  const hasMore = data.page < data.pages;

  const isSearching = Boolean(search.trim());

  // Search: hasil Fuse dipotong di client. Selain itu: data sudah dipaginasi server.
  const visiblePosts = isSearching
    ? remainingPosts.slice(0, searchShown)
    : remainingPosts;
  const totalItems = isSearching ? remainingPosts.length : data.total || 0;

  const handleLoadMore = () => {
    if (isSearching) setSearchShown((n) => n + limit);
    else setPage((p) => p + 1);
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const toggleTag = (tag) => {
  const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    updateParam("tags", next.join(","));
  };

  const clearTags = () => updateParam("tags", "");

  // Daftar tag untuk dropdown (selected tag selalu ikut tampil)
  const availableTags = useMemo(() => {
    const set = new Set(selectedTags);
    if (data.tags?.length) {
      data.tags.forEach((t) => set.add(t));
    } else {
      [...(data.pinned || []), ...(data.posts || [])].forEach((p) =>
        (p.tags || []).forEach((t) => t && set.add(t))
      );
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data.tags, data.pinned, data.posts, selectedTags]);

  const handlePinChange = (post, isPinned, unpinnedIds = []) => {
    const removedIds = new Set(unpinnedIds.map(String));
    const same = (p) => String(p._id) === String(post._id);
    const sortNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

    setData((prev) => {
      const updated = { ...post, isPinned };

      // Mode search / kategori: post tetap di grid, hanya flag berubah
      if (!showOverviewSections) {
        const setFlag = (list) =>
          list.map((p) =>
            same(p) ? { ...p, isPinned } : removedIds.has(String(p._id)) ? { ...p, isPinned: false } : p
          );
        const keptPinned = prev.pinned.filter((p) => !same(p) && !removedIds.has(String(p._id)));
        return {
          ...prev,
          posts: setFlag(prev.posts),
          pinned: isPinned ? [updated, ...keptPinned].slice(0, 4) : keptPinned,
        };
      }

      // Overview
      const removed = prev.pinned
        .filter((p) => removedIds.has(String(p._id)))
        .map((p) => ({ ...p, isPinned: false }));
      const keptPinned = prev.pinned.filter((p) => !same(p) && !removedIds.has(String(p._id)));
      const postsWithoutCurrent = prev.posts.filter((p) => !same(p));

      if (isPinned) {
        return {
          ...prev,
          pinned: [updated, ...keptPinned],
          posts: [...postsWithoutCurrent, ...removed].sort(sortNewest),
          total: Math.max(0, (prev.total || 0) - 1 + removed.length),
        };
      }

      // Unpin
      return {
        ...prev,
        pinned: keptPinned,
        posts: [...postsWithoutCurrent, updated].sort(sortNewest),
        total: (prev.total || 0) + 1,
      };
    });

    setAllPostsForSearch((list) =>
      list.map((p) =>
        same(p) ? { ...p, isPinned } : removedIds.has(String(p._id)) ? { ...p, isPinned: false } : p
      )
    );
  };

  const showOverviewSections = !search && !hasTagFilter;

  // heading
  const headingText = useMemo(() => {
    if (search) return `Results for "${search}"`;
    if (selectedTags.length) return `Guides tagged ${selectedTags.join(", ")}`;
    return "Continue learning";
  }, [search, selectedTags]);

  console.log("pinned:", data.pinned?.length, "posts:", data.posts?.length, "total:", data.total);

  const chunk = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const LoadMoreBar = ({ shown, total, limit, loadingMore, onLoadMore, onLimit }) => {
    const remaining = Math.max(0, total - shown);
    const nextCount = Math.min(limit, remaining);

    return (
      <div className="mt-8 flex flex-col gap-2.5 border-t border-slate-300 dark:border-white/10 pt-5 md:flex-row md:items-center md:justify-start">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-gray-400">
          <label className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => onLimit(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-white dark:bg-slate-200 px-2 py-1.5 h-[32px] text-sm text-black outline-none"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        {remaining > 0 && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white dark:bg-slate-200 px-3 py-1.5 h-[32px] text-sm font-medium text-slate-800 transition hover:bg-gray-100 active:scale-[0.98] duration-100 disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : `Load more (+${nextCount})`}
          </button>
        )}
      </div>
    );
  };

  // --- Guest jumbotron ---------------------------------------------------------
  const GuestJumbotron = ({ onSignUp, onLogin, onBrowse, totalGuides = 0 }) => (
    <section className="relative mb-6 overflow-hidden md:mx-6 md:mt-6 md:rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 px-5 py-10 md:px-8 md:py-8">
      {/* dekorasi */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white">
          <Sparkles size={13} /> Guest mode
        </span>

        <h1 className="mt-4 text-3xl md:text-3xl font-bold tracking-tight text-white">
          Belajar jaringan, <br className="hidden md:block" />
          mulai dari panduan komunitas.
        </h1>

        <p className="mt-3 text-sm md:text-base text-blue-100">
          Jelajahi {totalGuides > 0 ? `${totalGuides}+ ` : ""}guide seputar Mikrotik,
          Ubiquiti, TP-Link dan lainnya. Daftar untuk membuat guide sendiri dan
          berbagi ilmu dengan komunitas.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <button
            onClick={onSignUp}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-[0.98] duration-100"
          >
            Sign up gratis <ArrowRight size={16} />
          </button>
          <button
            onClick={onLogin}
            className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 active:scale-[0.98] duration-100"
          >
            Login
          </button>
          {/* <button
            onClick={onBrowse}
            className="inline-flex items-center justify-center gap-1 px-2 py-2.5 text-sm font-medium text-blue-100 underline-offset-4 hover:underline"
          >
            Lihat guide <ChevronDown size={14} />
          </button> */}
        </div>
      </div>
    </section>
  );

  return (
    <div className="mx-auto max-w-full md:border-x border-white dark:border-white/10 pr-0 shadow-none">
      {/* Guest / Welcome tetap sama */}
      {isGuest ? (
          <GuestJumbotron
            totalGuides={stats.totalGuides}
            onSignUp={() => navigate("/register")}
            onLogin={() => navigate("/login")}
            onBrowse={() =>
              guidesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : (
        <div className="w-full h-max">
          <WelcomeRow
            userName={user?.name || "reader"}
            onNewPost={() => navigate("/create")}
            isGuest={isGuest}
            isUser={isUser}
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

      <div ref={guidesRef} className="md:px-6 pb-6 scroll-mt-4">
        <div className="px-0 pt-3 pb-3 md:px-0 w-full md:py-4 relative rounded-xl bg-slate-200 dark:bg-white/5 dark:bg-none">
          {/* Header */}
          <header className="mt-1 px-3 md:px-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-1.5 mt-1">
                <Brain size={17} className="text-slate-900 dark:text-white" />
                <span className="relative top-[-1.2px] text-slate-900 dark:text-white">
                  {headingText}
                </span>
              </h2>
            </div>
          </header>
          
          {/* Search + Category — bersebelahan */}
          <div className="w-full px-3 py-2 md:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search */}
              <form
                className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white dark:bg-slate-200 px-3 py-1.5 shadow-sm sm:flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateParam("search", localSearch.trim());
                }}
              >
                <Search size={16} className="shrink-0 text-gray-400" />
                <input
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search by title..."
                  className="w-full dark:bg-transparent px-1 py-2 h-[24.5px] font-medium text-black text-sm outline-none"
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

             <TagFilter
                tags={availableTags}
                selected={selectedTags}
                onToggle={toggleTag}
                onClear={clearTags}
                loading={loading}
              />
            </div>
            {hasTagFilter && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white active:scale-[0.97] duration-100 hover:bg-blue-700"
                  >
                    {tag}
                    <X size={12} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearTags}
                  className="text-xs text-slate-600 underline dark:text-gray-400"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          {loading || (search.trim() && searchLoading) ? (
            <DashboardSkeleton showPinned={!isGuest && showOverviewSections} />
          ) : (
            <>
              {/* ========== PINNED FIRST ========== */}
              {pinnedFirst ? (
                <>
                  {data.pinned?.length > 0 && (
                    <section className="mb-8 px-3 md:px-4 md:mt-0 mt-4">
                      <PinnedHero pinned={data.pinned} onPinChange={handlePinChange} />
                    </section>
                  )}
                  
                {/* Posts Grid — Other guides */}
                 <section className="mb-8 px-3 md:px-4 border-white/10 pt-8 border-t">
                  {visiblePosts.length === 0  ? (
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
                      {/* Ganti grid-cols-* jadi flex */}
                      <div className="flex flex-col gap-5">
                        {chunk(visiblePosts, 2).map((row, rowIndex) => (
                          <div
                            key={rowIndex}
                            className="flex flex-col sm:flex-row gap-5"
                          >
                            {row.map((post) => (
                              <PostCard
                                slug={post.slug}
                                roundedNormal={true}
                                key={post._id}
                                post={post}
                                status={false}
                                onPinChange={handlePinChange}
                              />
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Skeleton saat load more */}
                      {loadingMore && (
                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2">
                          {Array.from({ length: Math.min(limit, 4) }).map((_, i) => (
                            <PostCardSkeleton key={i} />
                          ))}
                        </div>
                      )}

                      <LoadMoreBar
                        shown={visiblePosts.length}
                        total={totalItems}
                        limit={limit}
                        loadingMore={loadingMore}
                        onLoadMore={handleLoadMore}
                        onLimit={handleLimitChange}
                      />

                      {/* ===== LOAD MORE ===== */}
                      {/* {!search && hasMore && !loadingMore && (
                        <div
                          className="mt-6 cursor-pointer active:scale-[0.98] duration-100 hover:brightness-75 flex flex-col items-center justify-center"
                          onClick={handleLoadMore}
                        >
                          <p>Load more</p>
                          <ChevronDown size={14} className="relative top-1.5 duration-300 ease-out animate-bounce" />
                        </div>
                      )} */}
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
                          <PostCard slug={post.slug} key={post._id} post={post} />
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
                  {!isGuest && showOverviewSections && data.pinned?.length > 0 && (
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
              {!isGuest && localSearch && data.pinned?.length > 0 && (
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