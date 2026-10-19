import {
  Bell,
  BookOpen,
  Calculator,
  ChevronDown,
  Expand,
  FileText,
  LayoutGrid,
  LifeBuoy,
  Loader2,
  LogOut,
  NotebookPen,
  PencilRuler,
  Phone,
  Shrink,
  Ticket,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const quizLinks = [
  { label: "Practice", icon: PencilRuler, to: "/topology-practice" },
];

const supportLinks = [
  { label: "Ticket List", icon: Ticket, to: "/tickets" },
  { label: "Create Ticket", icon: LifeBuoy, to: "/tickets/create" },
];

const mainLinks = [
  { label: "Dashboard", icon: LayoutGrid, to: "/", end: true, tour: "categories" },
  { label: "Read Guide", icon: BookOpen, to: "/reading-list", tour: "library" },
  { label: "Subneting", icon: Calculator, to: "/tools/subnet", tour: "discover" },
  { label: "Practice", icon: PencilRuler, to: "/topology-practice", tour: "practice" },
];

const NavGroup = ({ title, open, onToggle, collapsed, single = false, children }) => {
  const divider = "border-b border-white/20 dark:border-white/10 last:border-b-0";

  // Mode icon-only
  if (collapsed) {
    return (
      <div className={`flex flex-col items-center gap-1 py-2 ${divider}`}>
        {children}
      </div>
    );
  }

  // Cuma 1 menu → tanpa header & dropdown
  if (single) {
    return <div className={`pt-[2px] pb-[0px] px-[4px] ${divider}`}>{children}</div>;
  }

  return (
    <div className={`pt-2 pb-1 px-[4px] ${divider}`}>
      <button
        type="button"
        onClick={onToggle}
        className="mb-1 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white dark:text-gray-400 transition hover:text-gray-200"
      >
        <span>{title}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
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

  const [openGroups, setOpenGroups] = useState({
    main: true,
    workspace: false,
    support: false,
    admin: false,
  });

  const location = useLocation();

  // di dalam komponen Sidebar, setelah state openGroups / collapsed

  useEffect(() => {
    const p = location.pathname;
    let group = null;

    if (
      p === "/" ||
      p.startsWith("/reading-list") ||
      p.startsWith("/tools") ||
      p.startsWith("/topology-practice")
    ) group = "main";
    else if (p.startsWith("/contacts") || p.startsWith("/remote")) group = "workspace";
    else if (p.startsWith("/tickets")) group = "support";
    else if (p.startsWith("/admin")) group = "admin";

    if (group) {
      setOpenGroups((prev) => {
        const next = {};
        Object.keys(prev).forEach((k) => (next[k] = k === group));
        return next;
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      const { group, expandSidebar } = e.detail || {};

      // Expand sidebar kalau sedang collapsed
      if (expandSidebar) {
        setCollapsed(false);
      }

      // Buka group yang diminta, tutup yang lain biar fokusus
      if (group) {
        setOpenGroups((prev) => {
          const next = {};
          Object.keys(prev).forEach((k) => {
            next[k] = k === group;
          });
          // pastikan key ada
          next[group] = true;
          return next;
        });
      }
    };

    window.addEventListener("nethub-intro-step", handler);
    return () => window.removeEventListener("nethub-intro-step", handler);
  }, []);

  const toggleGroup = (key) => {
    setOpenGroups((prev) => {
      const isOpen = prev[key];
      if (isOpen) return { ...prev, [key]: false };

      const openKeys = Object.keys(prev).filter((k) => prev[k]);
      if (openKeys.length >= 1) {
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
      localStorage.removeItem("nethub_quote_seen"); // ← tambah
      logout();
      navigate("/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const linkClass = (active) =>
    collapsed
      ? `flex h-10 active:scale-[0.99] w-10 items-center justify-center rounded-xl transition ${
          active && !collapsed
            ? "text-blue-950" : 
            active && collapsed ? 
            'text-blue-700 bg-blue-100'
            : "text-white hover:dark:!text-slate-400 dark:text-gray-400 hover:text-white"
        }`
      : `active:scale-[0.99] flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-all duration-200 ease-fluid ${
          active
            ? "text-blue-400"
            : "text-white hover:dark:!text-slate-400 dark:text-gray-300"
        }`;

  const renderLink = ({ to, icon: Icon, label, end, tour }) => (
    <div key={to} data-tour={tour} className={collapsed ? "mb-2" : "mb-1.5 px-2"}>
      <NavLink
        to={to}
        end={end}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        className={({ isActive }) => linkClass(isActive)}
      >
        <Icon size={17} />
        {!collapsed && label}
      </NavLink>
    </div>
  );

  return (
    <aside
      className={`relative flex h-screen shrink-0 z-[999] flex-col overflow-x-hidden border-l dark:border-white/5 dark:bg-[#0c0c18] bg-blue-950 md:bg-transparent transition-all duration-300 ${
        collapsed ? "w-[72px] px-2 overflow-y-auto" : "w-screen overflow-y-auto md:overflow-y-hidden md:w-[18.5vw] px-3"
      }`}
    >

      <img 
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        src="/hero.jpg" alt="wallpaper-sidebar" className={`rotate-[4deg] ${collapsed ? 'dark:rotate-0 duration-0' : ''} scale-[1.2] w-full h-screen dark:flex hidden object-cover absolute z-0 top-0 opacity-15 left-0`} />
      
      <div className="z-10 relative h-screen flex flex-col">
        {/* Logo + toggle */}
        <div
          className={`mb-0 z-[22] flex h-[8.6vh] min-h-[56px] shrink-0 items-center border-b border-white dark:border-white/10 ${
            collapsed
              ? "justify-center border-x-0 dark:px-0"
              : "justify-between dark:gap-2 border-x border-white/75 dark:border-white/10 dark:px-2"
          }`}
        >
          <a href="/">
            <div className="hover:brightness-75 active:scale-[0.99] duration-100 flex items-center pl-3 dark:pl-1 gap-2 h-full w-full shadow-none dark:shadow-none border-none dark:border-none dark:bg-transparent rounded-none">
              <div className={`flex ${collapsed ? 'h-10 w-10 rounded-xl' : 'w-9 h-9 md:h-10 md:w-10 rounded-lg'} shrink-0 items-center justify-center bg-slate-200 dark:!bg-gradient-to-br from-blue-400 to-blue-100 text-white dark:text-slate-900`}>
                <img 
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  src="/icons/icon-192x192.png" alt="logo" className="w-[85%] relative top-[1px] left-[0.5px]" />
              </div>
              {!collapsed && (
                <span className="ml-1 !text-white text-[16px] font-semibold tracking-tight">
                  TEXNet
                </span>
              )}
            </div>
          </a>

          <div className="w-max flex h-full pr-3 dark:pr-2 surface-card bg-transparent dark:shadow-none dark:bg-transparent shadow-none border-none rounded-none items-center gap-2">
          {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className={`md:!flex hidden md:h-10 md:w-10 h-9 w-9 shrink-0 relative border hover:brightness-90 hover:dark:!bg-white/5 active:scale-[0.99] duration-100 items-center justify-center border-white/20 mr-2 rounded-md left-2 md:rounded-lg text-gray-400 transition bg-transparent hover:md:dark!:bg-slate-100 hover:md:!bg-slate-800 hover:text-white`}
                title="Expand sidebar"
              >
                {
                  !collapsed ? (
                    <Shrink className="text-slate-200 relative left-[-0px]" size={16} />
                  ): (
                    <Expand className="text-slate-200 relative left-[0px]" size={16} />
                  )

                }
              </button>
            )}
            <div onClick={() => onNavigate()} className="h-9 w-9 border bg-red-600 text-white cursor-pointer active:scale-[0.99] duration-100 hover:bg-red-700 ease-out border-white/20 rounded-md left-2 flex md:hidden items-center justify-center md:rounded-lg p-1.5">
              <X className="text-slate-200" size={20} />
            </div>
          </div>
        </div>

        {/* Tombol expand saat collapsed */}
        {collapsed && (
          <div className="shrink-0 border-b border-white/10 my-1 pb-[1.2px]">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="h-10 active:scale-[0.99] mb-2 w-10 left-[1px] mt-2 relative border flex items-center justify-center border-white/20 rounded-lg md:rounded-xl bg-transparent text-gray-400 transition hover:bg-red-700 hover:text-white"
              title="Collapse sidebar"
            >
              <Expand className="text-slate-200 relative top-[-0.7px]" size={16} />
            </button>
          </div>
        )}

        <nav
          className={`flex flex-1 pt-1 min-h-0 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            collapsed ? "" : "border-x dark:border-white/10"
          }`}
        >

          <NavGroup
            title="Menu"
            open={openGroups.main}
            onToggle={() => toggleGroup("main")}
            collapsed={collapsed}
          >
            {mainLinks.map(renderLink)}
          </NavGroup>

          {/* Workspace */}
          <NavGroup
            title="Workspace"
            open={openGroups.workspace}
            single={isGuest}
            onToggle={() => toggleGroup("workspace")}
            collapsed={collapsed}
          >
            <div data-tour="workspace">
              {!isGuest &&
                renderLink({ to: "/contacts", icon: Phone, label: "Phone Book" })}
              {renderLink({ to: "/remote", icon: NotebookPen, label: "Remote Client" })}
            </div>
          </NavGroup>

          {/* Support */}
          {!isGuest && (
            <NavGroup
              title="Support"
              open={openGroups.support ?? false}
              onToggle={() => toggleGroup("support")}
              collapsed={collapsed}
            >
              <div data-tour="support">
                {supportLinks.map(({ label, icon: Icon, to }) => (
                  <div key={label} className={collapsed ? "mb-2" : "mb-1.5 px-2"}>
                    <NavLink
                      to={to}
                      end={to === "/tickets"}   
                      onClick={onNavigate}
                      title={collapsed ? label : undefined}
                      className={({ isActive }) => linkClass(isActive)}
                    >
                      <Icon size={17} />
                      {!collapsed && label}
                    </NavLink>
                  </div>
                ))}
              </div>
            </NavGroup>
          )}

          {/* Admin — hanya superAdmin */}
          {isSuperAdmin && (
            <NavGroup
              title="Admin"
              open={openGroups.admin ?? true}
              onToggle={() => toggleGroup("admin")}
              collapsed={collapsed}
            >
              <div className={collapsed ? "mb-2" : "mb-1.5 px-2"}>
                <NavLink 
                  to="/admin/activities"
                  onClick={onNavigate}
                  title={collapsed ? "Activity Log" : undefined}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  <FileText size={17} />   {/* atau import Activity / History dari lucide */}
                  {!collapsed && "Activity Log"}
                </NavLink>
              </div>
              <div className={collapsed ? "mb-2" : "mb-1.5 px-2"}>
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
        <div
          className={`shrink-0 border-t dark:border-white/10 rounded-none shadow-none dark:bg-transparent ${
            collapsed ? "flex flex-col items-center gap-2 py-3" : "pt-[1px]"
          }`}
        >
          <NavLink
            to={isGuest ? "#" : "/profile"}
            onClick={onNavigate}
            title={collapsed ? user?.name : undefined}
            className={() =>
              collapsed
                ? "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                : "flex items-center gap-3 border-x px-3 pb-4 pt-3 transition-colors border-white hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.05]"
            }
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-200 dark:!bg-gradient-to-br from-blue-400 to-blue-100 text-md font-semibold text-slate-900 dark:text-accent">
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
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-white/80">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-white/80">
                      {isGuest ? "Guest Reader" : user?.title}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLogoutClick();
                    }}
                    className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-black/5 hover:text-red-500 text-white dark:text-white/90 dark:hover:bg-white/10"
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

          {/* Logout icon saat collapsed */}
          {collapsed && (
            <button
              onClick={handleLogoutClick}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-red-400"
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