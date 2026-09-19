import {
  Bell,
  Box,
  Boxes,
  Brain,
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flame,
  HardDrive,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Loader2,
  Network,
  PencilRuler,
  Wrench,
  BookOpen
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const categoryLinks = [
  { label: "Dashboard", icon: LayoutGrid, to: "/", category: null },
  { label: "Topology", icon: Network, to: "/?category=Topology", category: "Topology" },
  { label: "Installation", icon: Boxes, to: "/?category=Installation", category: "Installation" },
  { label: "Maintenance", icon: Wrench, to: "/?category=Maintenance", category: "Maintenance" },
  { label: "Soft & Hardware", icon: HardDrive, to: "/?category=Hardware", category: "Hardware" },
];

const discoverLinks = [
  { label: "Trending", icon: Flame, to: "/trending" },
  { label: "Subnet Calc", icon: Calculator, to: "/tools/subnet" },
  { label: "Collection Card", icon: Box, to: "/hardware" },
];

const quizLinks = [
  { label: "Build Exam", icon: HelpCircle, to: "/quiz-builder" },
  { label: "Go Practice", icon: PencilRuler, to: "/practice" },
  { label: "Test Knowledge", icon: Brain, to: "/quizzes" },
];

const NavGroup = ({ title, open, onToggle, collapsed, children }) => {
  if (collapsed) {
    // Mode icon-only: tampilkan children langsung tanpa header group
    return <div className="flex flex-col items-center gap-1 py-2">{children}</div>;
  }

  return (
    <div className="pt-2 px-1">
      <button
        type="button"
        onClick={onToggle}
        className="mb-1 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white dark:text-gray-400 transition hover:text-gray-200"
      >
        <span>{title}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        <div className="flex flex-col gap-0.5 pb-1">{children}</div>
      </div>
    </div>
  );
};

const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category");
  const [search, setSearch] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Collapse state (persist di localStorage)
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("nethub_sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("nethub_sidebar_collapsed", String(collapsed));
  }, [collapsed]);

  const isGuest = user?.isGuest || user?.role === "guest";
  const isSuperAdmin = user?.role === "superAdmin";
  console.log(user)

  const [openGroups, setOpenGroups] = useState({
    categories: true,
    discover: true,
    quiz: false,
    library: false,
    admin: true,
  });

  const toggleGroup = (key) => {
    setOpenGroups((prev) => {
      const isOpen = prev[key];
      if (isOpen) return { ...prev, [key]: false };

      const openKeys = Object.keys(prev).filter((k) => prev[k]);
      if (openKeys.length >= 2) {
        const closeKey = openKeys[0];
        return { ...prev, [closeKey]: false, [key]: true };
      }
      return { ...prev, [key]: true };
    });
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      logout();
      navigate("/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/?search=${encodeURIComponent(search.trim())}`);
    onNavigate?.();
  };

  const filteredQuizLinks = isGuest
    ? quizLinks.filter((item) => item.to !== "/quiz-builder")
    : quizLinks;

  const linkClass = (active) =>
    collapsed
      ? `flex h-10 w-10 items-center justify-center rounded-xl transition ${
          active
            ? "bg-blue-600 text-white"
            : "text-white dark:text-gray-400 hover:bg-white/[0.06] hover:text-white"
        }`
      : `flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-all duration-200 ease-fluid ${
          active
            ? "bg-blue-600 text-white"
            : "text-white hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.06]"
        }`;

  return (
    <aside
      className={`relative flex h-screen shrink-0 z-[9999] flex-col overflow-y-hidden overflow-x-hidden border-l dark:border-white/5 dark:bg-[#0c0c18] transition-all duration-300 ${
        collapsed ? "w-[72px] px-2" : "w-[18.5vw] px-3"
      }`}
    >

      <img src="/sidebar.png" alt="wallpaper-sidebar" className="rotate-[4deg] scale-[2] w-full h-screen dark:flex hidden object-cover absolute z-0 top-0 opacity-5 left-0" />
      <img src="/hero.jpg" alt="wallpaper-sidebar" className="rotate-[4deg] scale-[2] w-full h-screen dark:hidden flex object-cover absolute opacity-90 z-0 top-0 left-0" />
      
      <div className="z-10 relative h-screen">
        {/* Logo + toggle */}
        <div
          className={`mb-0 z-[22] px-3 flex h-[8.6vh] items-center border-b border-white dark:border-white/10 ${
            collapsed
              ? "justify-center border-x-0"
              : "justify-between gap-2 border-x border-white/75 dark:border-white/10 px-2"
          }`}
        >
          <div className="flex items-center gap-2 h-[10%]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
              <Network size={18} />
            </div>
            {!collapsed && (
              <span className="ml-1 text-white text-[16px] font-semibold tracking-tight">
                NetHub
              </span>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="relative left-2 rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Tombol expand saat collapsed */}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white"
            title="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <nav
          className={`flex flex-1 flex-col h-[82.4vh] gap-0.5 ${
            collapsed ? "" : "border-x dark:border-white/10"
          }`}
        >
          {/* Categories */}
          <NavGroup
            title="Categories"
            open={openGroups.categories}
            onToggle={() => toggleGroup("categories")}
            collapsed={collapsed}
          >
            {categoryLinks.map(({ label, icon: Icon, to, category }) => {
              const isCategoryActive =
                category === null
                  ? !currentCategory && location.pathname === "/"
                  : currentCategory === category;

              return (
                <div key={label} className={collapsed ? "" : "mb-1.5 px-2"}>
                  <NavLink
                    to={to}
                    onClick={onNavigate}
                    title={collapsed ? label : undefined}
                    className={linkClass(isCategoryActive)}
                  >
                    <Icon size={17} />
                    {!collapsed && label}
                  </NavLink>
                </div>
              );
            })}
          </NavGroup>

          {/* Discover */}
          <NavGroup
            title="Discover"
            open={openGroups.discover}
            onToggle={() => toggleGroup("discover")}
            collapsed={collapsed}
          >
            {discoverLinks.map(({ label, icon: Icon, to }) => (
              <div key={label} className={collapsed ? "" : "px-2"}>
                <NavLink
                  to={to}
                  onClick={onNavigate}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  <Icon size={17} />
                  {!collapsed && label}
                </NavLink>
              </div>
            ))}
          </NavGroup>

          {/* Quiz */}
          <NavGroup
            title="Quiz"
            open={openGroups.quiz}
            onToggle={() => toggleGroup("quiz")}
            collapsed={collapsed}
          >
            {filteredQuizLinks.map(({ label, icon: Icon, to }) => (
              <div key={label} className={collapsed ? "" : "px-2"}>
                <NavLink
                  to={to}
                  onClick={onNavigate}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  <Icon size={17} />
                  {!collapsed && label}
                </NavLink>
              </div>
            ))}
          </NavGroup>

          {/* Library */}
          <NavGroup
            title="Library"
            open={openGroups.library}
            onToggle={() => toggleGroup("library")}
            collapsed={collapsed}
          >
            {/* My Guides - hanya user login */}
            {!isGuest && (
              <div className={collapsed ? "" : "px-2"}>
                <NavLink
                  to="/my-posts"
                  onClick={onNavigate}
                  title={collapsed ? "My Guides" : undefined}
                  className={({ isActive }) =>
                    collapsed
                      ? linkClass(isActive)
                      : `flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-accent-soft text-accent"
                            : "text-white hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.06]"
                        }`
                  }
                >
                  <FileText size={17} />
                  {!collapsed && "My Guide"}
                </NavLink>
              </div>
            )}

            {/* Reading List - tampil untuk semua, termasuk guest */}
            <div className={collapsed ? "" : "px-2 mt-1"}>
              <NavLink
                to="/reading-list"
                onClick={onNavigate}
                title={collapsed ? "Reading List" : undefined}
                className={({ isActive }) =>
                  collapsed
                    ? linkClass(isActive)
                    : `flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-accent-soft text-accent"
                          : "text-white hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.06]"
                      }`
                }
              >
                <BookOpen size={17} />
                {!collapsed && "Reading List"}
              </NavLink>
            </div>
          </NavGroup>

          {/* Admin — hanya superAdmin */}
          {isSuperAdmin && (
            <NavGroup
              title="Admin"
              open={openGroups.admin ?? true}
              onToggle={() => toggleGroup("admin")}
              collapsed={collapsed}
            >
              <div className={collapsed ? "" : "px-2"}>
                <NavLink
                  to="/admin/announcements"
                  onClick={onNavigate}
                  title={collapsed ? "Pengumuman" : undefined}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  <Bell size={17} />
                  {!collapsed && "Announcement"}
                </NavLink>
              </div>
            </NavGroup>
          )}
        </nav>

        {/* Profile */}
        <div className={`h-[9%] mt-auto border-t dark:border-white/10 ${collapsed ? "py-3" : ""}`}>
          <NavLink
            to={isGuest ? "#" : "/profile"}
            onClick={onNavigate}
            title={collapsed ? user?.name : undefined}
            className={({ isActive }) =>
              collapsed
                ? `mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ${
                    isActive && !isGuest ? "ring-2 ring-accent" : ""
                  }`
                : `flex items-center gap-3 border-x px-3 pb-4 pt-3 transition-colors ${
                    isActive && !isGuest
                      ? "dark:border-accent/40 bg-accent-soft"
                      : "border-white hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.05]"
                  }`
            }
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-accent-soft text-sm font-semibold text-accent">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || "G"
              )}
            </div>

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white dark:text-gray-400 font-medium">{user?.name}</p>
                  <p className="truncate text-xs text-white dark: text-gray-400">
                    {isGuest ? "Guest Reader" : user?.title}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogoutClick();          // ← ganti
                  }}
                  className="rounded-md p-1.5 text-white dark:text-gray-400 transition-colors hover:bg-black/5 hover:text-red-500 dark:hover:bg-white/10"
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </NavLink>

          {/* ===== LOGOUT CONFIRMATION MODAL ===== */}
          {showLogoutModal && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => !loggingOut && setShowLogoutModal(false)}
              />

              {/* Modal box */}
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
                <div className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                    <LogOut size={22} className="text-red-600 dark:text-red-400" />
                  </div>

                  <h3 className="text-center text-lg font-semibold">
                    Keluar akun?
                  </h3>
                  <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                    Kamu akan keluar dari akun
                  </p>
                </div>

                <div className="flex gap-3 border-t border-white bg-gray-50 px-6 py-4 dark:border-white/5 dark:bg-white/5">
                  <button
                    type="button"
                    disabled={loggingOut}
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 active:scale-[0.99] duration-100 rounded-xl border border-white bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:hover:bg-gray-900 dark:text-gray-200"
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

          {/* Logout icon saat collapsed */}
          {collapsed && (
            <button
              onClick={handleLogoutClick}
              className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-red-400"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;