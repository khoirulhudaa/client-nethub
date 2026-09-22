import {
  AlertTriangle,
  Ban,
  Bell,
  BookOpen,
  Calculator,
  CheckCircle2,
  Flame,
  Info,
  LogOut,
  Menu,
  Moon,
  PencilRuler,
  Plus,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const TopBar = ({ onMenuClick }) => {
  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth(); // pastikan logout ada di AuthContext
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const isGuest = user?.isGuest || user?.role === "guest";

  const TYPE_META = {
    info: { icon: Info, color: "text-blue-500", bg: "bg-gradient-to-br from-blue-400 to-blue-900/10" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
    success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    important: { icon: Ban, color: "text-rose-500", bg: "bg-rose-500/10" },
  };

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    if (openNotif || openProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openNotif, openProfile]);

  const openNotifications = () => {
    setOpenNotif((prev) => !prev);
    setOpenProfile(false); // tutup profile kalau buka notif
    if (!openNotif && announcements.length) {
      const ids = announcements.map((a) => a._id);
      localStorage.setItem("nethub_read_announcements", JSON.stringify(ids));
      setUnreadCount(0);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/?search=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = () => {
    setOpenProfile(false);
    logout?.(); // panggil fungsi logout dari AuthContext
    navigate("/"); // atau ke halaman login sesuai flow kamu
  };

  return (
    <header className="w-full surface-card h-[8.6vh] sticky top-0 z-[999] border-r border-white/10 flex h-16 items-center gap-3 py-0 rounded-none border-b px-0 md:px-3.5">
      <div
        className="pointer-events-none absolute top-[1.5px] inset-0 z-0 hidden dark:block"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="w-[100%] border-r border-white/10 flex justify-between h-full items-center pl-2 pr-6">
        <button
          onClick={onMenuClick}
          className="dark:border-none border-slate-300 border rounded-control p-2 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <form data-tour="search" onSubmit={handleSearch} className="relative w-full md:flex hidden max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, tags, categories…"
            className="input-field pl-9"
          />
        </form>

        {/* Quick links — desktop */}
        <div className="ml-3 hidden items-center gap-3 md:flex">
          <TopLink to="/trending" icon={Flame} label="Trending" />
          <TopLink to="/tools/subnet" icon={Calculator} label="Subnet" />
          <TopLink to="/practice" icon={PencilRuler} label="Practice" />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* New post — hanya user login */}
          {!isGuest && (
            <button
              onClick={() => navigate("/create")}
              className="hidden items-center active:scale-[0.98] hover:bg-white/5 h-10 gap-1.5 rounded-xl border-[2px] border-slate-300 dark:border-white/15 px-3 py-2 text-sm font-medium text-gray-500 dark:text-white transition hover:opacity-90 sm:inline-flex"
            >
              <Plus size={16} />
            </button>
          )}

          {/* Notification */}
          <div className="relative" ref={notifRef} data-tour="notif">
            <button
              type="button"
              className="relative border-slate-300 dark:border-white/15 border rounded-control p-2.5 text-gray-500 transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
              title="Notifications"
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
              <div className="absolute right-[122%] top-full z-[99] mt-2 w-[min(100vw-2rem,360px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#12121a]">
                {/* ... isi notifikasi tetap sama ... */}
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
                  <div>
                    <p className="text-sm font-semibold">Pengumuman</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenNotif(false)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
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
                                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}
                                >
                                  <Icon size={15} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">{item.title}</p>
                                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                                    {item.content}
                                  </p>
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
            className="border-slate-300 dark:border-white/15 border rounded-control p-2.5 text-gray-500 transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
            title="Toggle theme"
            >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* ===== PROFILE DROPDOWN ===== */}
          <div className="relative" ref={profileRef} data-tour="profile">
            <button
              type="button"
              onClick={() => {
                setOpenProfile((prev) => !prev);
                setOpenNotif(false);
              }}
              className="ml-0.5 flex h-10 w-10 items-center justify-center dark:border-[2px] dark:border-white/15 border-slate-300 border rounded-control p-2.5 text-gray-500 transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
              // className="ml-0.5 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-transparent text-sm font-semibold text-white ring-1 transition hover:opacity-90"
              title={user?.name || "Profile"}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || "G"
              )}
            </button>

            {openProfile && (
              <div className="absolute shadow-2xl right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#12121a]">
                {/* Header */}
                <div className="border-b border-gray-100 px-4 py-3 dark:border-white/10">
                  <p className="truncate text-sm font-semibold">
                    {user?.name || "Guest"}
                  </p>
                  {user?.email && (
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                  )}
                </div>

                <div className="py-1.5">
                  {!isGuest ? (
                    <>
                      {/* Menu untuk user yang sudah login */}
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
                        onClick={handleLogout}
                        className="flex w-full items-center active:scale-[0.99] duration-100 gap-3 px-4 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </>
                  ) : (
                    /* Menu untuk Guest */
                    <button
                      type="button"
                      onClick={() => {
                        setOpenProfile(false);
                        navigate("/register"); // atau "/auth/register" sesuai route kamu
                      }}
                      className="flex w-[94%] rounded-xl mx-auto items-center gap-2 px-2.5 active:scale-[0.99] duration-100 py-2.5 text-left text-sm text-white transition bg-gradient-to-br from-blue-400 to-blue-900"
                    >
                      <User size={16} />
                      Register
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const TopLink = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm text-gray-500 transition hover:bg-black/5 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
  >
    <Icon size={15} />
    <span className="hidden xl:inline">{label}</span>
  </Link>
);

export default TopBar;