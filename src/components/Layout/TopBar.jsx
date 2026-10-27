import Fuse from "fuse.js";
import {
  AlertTriangle,
  Ban,
  Bell,
  BookOpen,
  Calculator,
  CheckCircle2,
  Home,
  Info,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Moon,
  PencilRuler,
  Plus,
  Search,
  Sun,
  Ticket,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const TYPE_META = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-gradient-to-br from-blue-400 to-blue-900/10" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  important: { icon: Ban, color: "text-rose-500", bg: "bg-rose-500/10" },
};

const TopBar = ({ onMenuClick }) => {
  const [openNotif, setOpenNotif] = useState(false);
  const [openNotifTicket, setOpenNotifTicket] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const notifRef = useRef(null);
  const notifRefNotif = useRef(null);
  const profileRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isGuest = !user || user?.isGuest || user?.role === "guest";
  const isUser = user?.role === "user";

  // ---------- Tiket / notifikasi ----------
  const [notifications, setNotifications] = useState([]);
  const [unreadCountNotification, setUnreadCountNotification] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications);
      setUnreadCountNotification(data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ---------- Pengumuman ----------
  const fetchAnnouncements = async () => {
    try {
      setNotifLoading(true);
      const { data } = await api.get("/announcements");
      const list = data.announcements || [];
      setAnnouncements(list);
      const readIds = JSON.parse(localStorage.getItem("nethub_read_announcements") || "[]");
      setUnreadCount(list.filter((a) => !readIds.includes(a._id)).length);
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ---------- Search ----------
  const [query, setQuery] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const postsLoaded = useRef(false);

  // Ambil daftar guide sekali, saat input pertama kali di-focus
  const loadPosts = async () => {
    if (postsLoaded.current) return;
    postsLoaded.current = true;
    setPostsLoading(true);
    try {
      const { data } = await api.get("/posts", { params: { limit: 1000 } });
      const map = new Map();
      [...(data.pinned || []), ...(data.posts || [])].forEach((p) => {
        if (p?._id) map.set(String(p._id), p);
      });
      setAllPosts(Array.from(map.values()));
    } catch (err) {
      postsLoaded.current = false; // boleh dicoba lagi
      console.error(err);
    } finally {
      setPostsLoading(false);
    }
  };

  const fuse = useMemo(
    () =>
      new Fuse(allPosts, {
        keys: ["title"],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [allPosts]
  );

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    return fuse.search(q).slice(0, 6).map((r) => r.item);
  }, [fuse, query]);

  // Tutup dropdown saat klik di luar area search
  useEffect(() => {
    const handler = (e) => {
      const inDesktop = desktopSearchRef.current?.contains(e.target);
      const inMobile = mobileSearchRef.current?.contains(e.target);
      if (!inDesktop && !inMobile) setShowSuggest(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fokus otomatis saat bar search mobile dibuka
  useEffect(() => {
    if (mobileSearchOpen) mobileInputRef.current?.focus();
  }, [mobileSearchOpen]);

  const handleSearch = (e, inputRef) => {
    e?.preventDefault?.();
    const q = query.trim();

    // Input kosong: fokuskan input supaya tombol terasa merespons
    if (!q) {
      inputRef?.current?.focus();
      return;
    }

    setShowSuggest(false);
    setMobileSearchOpen(false);
    navigate(`/?search=${encodeURIComponent(q)}`);
  };

  const openPost = (post) => {
    setShowSuggest(false);
    setMobileSearchOpen(false);
    setQuery("");
    navigate(`/posts/${post.slug}`);
  };

  const renderSearch = (wrapRef, inputRef, className = "") => (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form
        data-tour="search"
        onSubmit={(e) => handleSearch(e, inputRef)}
        className="flex w-full items-stretch overflow-hidden rounded-xl border border-slate-400 dark:border-white/20 focus-within:border-blue-400 transition"
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggest(true);
            }}
            onFocus={() => {
              loadPosts();
              setShowSuggest(true);
            }}
            placeholder="Search guides by title…"
            className="h-10 w-full bg-transparent pl-9 pr-8 text-sm text-white outline-none placeholder:text-slate-700 dark:placeholder:text-white/50"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setShowSuggest(false);
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tombol search, menyatu di sisi kanan */}
        <button
          type="submit"
          title="Search"
          className="relative z-[1] flex w-11 shrink-0 items-center justify-center border-l border-slate-400 dark:border-white/20 bg-gradient-to-br from-blue-400 to-blue-900 text-white transition hover:brightness-110 active:scale-[0.97] duration-100"
        >
          <Search size={16} />
        </button>
      </form>

      {showSuggest && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-[99] mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#12121a]">
          {postsLoading ? (
            <p className="px-4 py-3 text-sm text-gray-500">Loading…</p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">
              No guide found for "{query.trim()}"
            </p>
          ) : (
            <ul className="max-h-[50vh] divide-y divide-gray-100 overflow-y-auto dark:divide-white/5">
              {suggestions.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={() => openPost(p)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                  >
                    <BookOpen size={15} className="mt-0.5 shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {p.title}
                      </p>
                      {p.category && (
                        <p className="truncate text-xs text-gray-500">{p.category}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={(e) => handleSearch(e, inputRef)}
            className="w-full border-t border-gray-100 px-4 py-2.5 text-left text-xs font-medium text-blue-600 hover:bg-black/[0.03] dark:border-white/10 dark:text-blue-400 dark:hover:bg-white/[0.05]"
          >
            See all results for "{query.trim()}"
          </button>
        </div>
      )}
    </div>
  );

  // ---------- Dropdown click outside ----------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpenProfile(false);
    };
    if (openNotif || openProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openNotif, openProfile]);

  const openNotifications = () => {
    setOpenNotif((prev) => !prev);
    setOpenProfile(false);
    if (!openNotif && announcements.length) {
      const ids = announcements.map((a) => a._id);
      localStorage.setItem("nethub_read_announcements", JSON.stringify(ids));
      setUnreadCount(0);
    }
  };

  // ---------- Logout ----------
  const handleLogoutClick = () => {
    setOpenProfile(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      localStorage.removeItem("nethub_quote_seen");
      logout?.();
      navigate("/");
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <header className="w-full !bg-transparent surface-card h-[8.6vh] sticky top-0 z-[999] border-r border-white/10 flex items-center gap-3 py-0 rounded-none border-b px-1.5 md:px-3.5">
      <div
        className="pointer-events-none absolute top-[1.5px] inset-0 z-0 hidden dark:block"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-[1] w-[100%] flex justify-between h-full items-center pl-2 pr-2 md:pr-5 gap-3">
        {/* Hamburger (login) / Logo (pengunjung) */}
        {user ? (
          <button
            onClick={onMenuClick}
            className="border dark:!border-white/30 border-slate-400 rounded-xl h-[39.5px] w-[39.5px] flex items-center justify-center text-gray-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
          >
            <Menu size={20} />
          </button>
        ) : (
          <Link to="/" className="flex shrink-0 border border-white/20 rounded-lg px-1 pr-2 items-center gap-2">
            <img
              src="/icons/icon-192x192.png"
              alt="logo"
              draggable={false}
              className="h-10 w-10 rounded-lg relative top-[1px] ml-[-2px]"
            />
            <span className="hidden sm:inline text-[18px] font-semibold tracking-tight text-white">
              TEXNet
            </span>
          </Link>
        )}

        {/* Search desktop */}
        {renderSearch(desktopSearchRef, desktopInputRef, "hidden md:block w-full max-w-md")}

        {/* Quick links — desktop */}
        <div className="hidden h-[68%] border border-white/20 rounded-xl px-1 pr-2 items-center gap-3 md:flex">
          <TopLink to="/" icon={Home} label="Dashboard" />
          <TopLink to="/tools/subnet" icon={Calculator} label="Subnet" />
          <TopLink to="/topology-practice" icon={PencilRuler} label="Practice" />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Tombol search mobile */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((o) => !o)}
            className="md:hidden active:scale-[0.98] duration-100 border-white dark:border-white/30 border rounded-control p-2.5 text-white transition hover:bg-black/10 dark:text-gray-300 dark:hover:bg-white/10"
            title="Search"
          >
            <Search size={18} />
          </button>

          {/* New post */}
          {!isGuest && !isUser && (
            <button
              onClick={() => navigate("/create")}
              className="active:scale-[0.98] duration-100 hidden items-center dark:hover:bg-white/10 hover:bg-black/10 h-10 gap-1.5 rounded-xl border-[2px] border-white dark:md:border-white/30 dark:border-white/30 px-3 py-2 text-sm font-medium text-white dark:text-white transition hover:opacity-90 sm:inline-flex"
            >
              <Plus size={16} />
            </button>
          )}

          {/* Tiket — hanya yang login */}
          {user && (
            <div className="relative" ref={notifRefNotif} data-tour="notif">
              <button
                type="button"
                className="active:scale-[0.98] duration-100 relative border-white dark:md:border-white/30 dark:border-white/30 border rounded-control p-2.5 text-white transition hover:bg-black/10 dark:text-gray-300 dark:hover:bg-white/10"
                title="Tickets"
                onClick={() => {
                  setOpenNotifTicket((prev) => !prev);
                  setOpenProfile(false);
                }}
              >
                <Ticket size={18} />
                {unreadCountNotification > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-900 px-1 text-[10px] font-semibold text-white">
                    {unreadCountNotification > 9 ? "9+" : unreadCountNotification}
                  </span>
                )}
              </button>

              {openNotifTicket && (
                <div className="absolute right-[-236%] md:right-[122%] top-full z-[99] mt-2 w-[min(100vw-2rem,360px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#12121a]">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
                    <div>
                      <p className="text-sm font-semibold">Tiket</p>
                      {unreadCountNotification > 0 && (
                        <p className="text-xs text-gray-500">{unreadCountNotification} belum dibaca</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCountNotification > 0 && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api.patch("/notifications/read-all");
                              setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                              setUnreadCountNotification(0);
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="rounded-lg px-2 py-1 text-xs text-accent hover:bg-accent/10"
                        >
                          Tandai semua
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setOpenNotifTicket(false)}
                        className="rounded-lg active:scale-[0.98] p-1.5 text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[min(60vh,380px)] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                        <Bell size={24} className="text-gray-400" />
                        <p className="text-sm font-medium">Tidak ada permintaan</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100 dark:divide-white/5">
                        {notifications.map((item) => (
                          <li key={item._id}>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenNotifTicket(false);
                                if (item.link) navigate(item.link);

                                if (!item.isRead) {
                                  setNotifications((prev) =>
                                    prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
                                  );
                                  setUnreadCountNotification((prev) => Math.max(0, prev - 1));

                                  api.patch(`/notifications/${item._id}/read`).catch((err) => {
                                    console.error(err);
                                    setNotifications((prev) =>
                                      prev.map((n) => (n._id === item._id ? { ...n, isRead: false } : n))
                                    );
                                    setUnreadCountNotification((prev) => prev + 1);
                                  });
                                }
                              }}
                              className={`w-full px-4 py-3 text-left transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03] ${
                                !item.isRead ? "bg-blue-50/50 dark:bg-blue-500/5" : ""
                              }`}
                            >
                              <div className="flex gap-3">
                                <div
                                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    item.type === "new_ticket"
                                      ? "bg-blue-500/15 text-blue-500"
                                      : "bg-gray-500/15 text-gray-500"
                                  }`}
                                >
                                  <Bell size={15} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm font-medium ${!item.isRead ? "text-white" : ""}`}>
                                      {item.title}
                                    </p>
                                    {!item.isRead && (
                                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                    )}
                                  </div>
                                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{item.message}</p>
                                  <p className="mt-1.5 text-[11px] text-gray-400">
                                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pengumuman */}
          <div className="relative" ref={notifRef} data-tour="notif">
            <button
              type="button"
              className="active:scale-[0.98] duration-100 relative border-white dark:md:border-white/30 dark:border-white/30 border rounded-control p-2.5 text-white transition hover:bg-black/10 dark:text-gray-300 dark:hover:bg-white/10"
              title="Announcements"
              onClick={openNotifications}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-900 px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-[-236%] md:right-[122%] top-full z-[99] mt-2 w-[min(100vw-2rem,360px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#12121a]">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
                  <p className="text-sm font-semibold">Announcements</p>
                  <button
                    type="button"
                    onClick={() => setOpenNotif(false)}
                    className="rounded-lg active:scale-[0.98] p-1.5 text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="max-h-[min(60vh,380px)] overflow-y-auto">
                  {notifLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                      <Bell size={24} className="text-gray-400" />
                      <p className="text-sm font-medium">Tidak ada pengumuman</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-white/5">
                      {announcements.map((item) => {
                        const meta = TYPE_META[item.type] || TYPE_META.info;
                        const Icon = meta.icon;
                        return (
                          <li key={item._id}>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenNotif(false);
                                navigate(`/announcements/${item._id}`);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                            >
                              <div className="flex gap-3">
                                <div
                                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.bg} text-white`}
                                >
                                  <Icon size={15} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">{item.title}</p>
                                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{item.content}</p>
                                  <p className="mt-1.5 text-[11px] text-gray-400">
                                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {user?.role === "superAdmin" && (
                  <div className="border-t border-gray-100 px-4 py-2.5 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenNotif(false);
                        navigate("/admin/announcements");
                      }}
                      className="w-full rounded-lg py-2 text-center text-xs font-medium text-accent hover:text-slate-900 hover:bg-gradient-to-br from-blue-400 to-blue-100"
                    >
                      Kelola pengumuman
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="active:scale-[0.98] duration-100 border-white dark:md:border-white/30 dark:border-white/30 border rounded-control p-2.5 text-white transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Profil (login) / tombol Login (pengunjung) */}
          {user ? (
            <div className="relative" ref={profileRef} data-tour="profile">
              <button
                type="button"
                onClick={() => {
                  setOpenProfile((prev) => !prev);
                  setOpenNotif(false);
                }}
                className="ml-0.5 flex h-10 w-10 active:scale-[0.98] items-center justify-center overflow-hidden dark:border-[2px] dark:md:border-white/30 dark:border-white/30 border-white border rounded-control p-2.5 text-white transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
                title={user?.name || "Profile"}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || "G"
                )}
              </button>

              {openProfile && (
                <div className="absolute shadow-2xl right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#12121a]">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-white/10">
                    <p className="truncate text-sm font-semibold">{user?.name || "Guest"}</p>
                    {user?.email && <p className="truncate text-xs text-gray-500">{user.email}</p>}
                  </div>

                  <div className="py-1.5">
                    {!isGuest ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenProfile(false);
                            navigate("/profile");
                          }}
                          className="flex w-full items-center active:scale-[0.99] duration-100 gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-black/[0.03] dark:text-gray-200 dark:hover:bg-white/[0.05]"
                        >
                          <User size={16} className="text-gray-400" />
                          View profile
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenProfile(false);
                            navigate("/reading-list");
                          }}
                          className="flex w-full items-center active:scale-[0.99] duration-100 gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-black/[0.03] dark:text-gray-200 dark:hover:bg-white/[0.05]"
                        >
                          <BookOpen size={16} className="text-gray-400" />
                          Reading List
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenProfile(false);
                            navigate("/my-posts");
                          }}
                          className="flex w-full items-center active:scale-[0.99] duration-100 gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-black/[0.03] dark:text-gray-200 dark:hover:bg-white/[0.05]"
                        >
                          <BookOpen size={16} className="text-gray-400" />
                          My Guides
                        </button>

                        <button
                          type="button"
                          onClick={handleLogoutClick}
                          className="flex w-full items-center active:scale-[0.99] duration-100 gap-3 px-4 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </>
                    ) : (
                      // Akun guest lama: arahkan ke login (route register disembunyikan)
                      <button
                        type="button"
                        onClick={() => {
                          setOpenProfile(false);
                          navigate("/login");
                        }}
                        className="flex w-[94%] rounded-xl mx-auto items-center gap-2 px-2.5 active:scale-[0.99] duration-100 py-2.5 text-left text-sm text-white transition bg-gradient-to-br from-blue-400 to-blue-900"
                      >
                        <LogIn size={16} />
                        Login
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="ml-0.5 flex h-10 items-center gap-2 rounded-xl border border-white/20 hover:bg-white/10 px-4 text-sm font-medium text-white active:scale-[0.98] duration-100 hover:brightness-110"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Bar search mobile */}
      {mobileSearchOpen && (
        <div className="absolute left-0 right-0 top-full z-[998] border-b border-white/10 bg-blue-950 p-2 md:hidden">
          {renderSearch(mobileSearchRef, mobileInputRef, "w-full")}
        </div>
      )}

      {/* ===== LOGOUT CONFIRMATION MODAL ===== */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999999] w-full md:w-[82vw] right-0 ml-auto flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !loggingOut && setShowLogoutModal(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                <LogOut size={22} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-center text-lg font-semibold">Keluar akun?</h3>
              <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                Kamu akan keluar dari akun
              </p>
            </div>

            <div className="flex gap-3 border-t border-white bg-gray-50 px-6 py-4 dark:border-white/5 dark:bg-white/5">
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 active:scale-[0.99] duration-100 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:hover:bg-gray-900 dark:text-gray-200"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loggingOut}
                onClick={confirmLogout}
                className="flex-1 active:scale-[0.99] duration-100 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {loggingOut ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Keluar...
                  </span>
                ) : (
                  "Ya, Keluar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const TopLink = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm text-white transition hover:bg-black/5 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
  >
    <Icon size={15} />
    <span className="hidden xl:inline">{label}</span>
  </Link>
);

export default TopBar;