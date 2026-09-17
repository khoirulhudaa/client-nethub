import {
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
  Monitor,
  Network,
  PencilRuler,
  Search,
  Wrench,
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
];

const quizLinks = [
  { label: "Build Quiz", icon: HelpCircle, to: "/quiz-builder" },
  { label: "Test Network", icon: Brain, to: "/quizzes" },
  { label: "Practice", icon: PencilRuler, to: "/practice" },
];

const NavGroup = ({ title, open, onToggle, collapsed, children }) => {
  if (collapsed) {
    // Mode icon-only: tampilkan children langsung tanpa header group
    return <div className="flex flex-col items-center gap-1 py-2">{children}</div>;
  }

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={onToggle}
        className="mb-1 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 transition hover:bg-white/[0.04] hover:text-gray-200"
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

  // Collapse state (persist di localStorage)
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("nethub_sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("nethub_sidebar_collapsed", String(collapsed));
  }, [collapsed]);

  const isGuest = user?.isGuest || user?.role === "guest";

  const [openGroups, setOpenGroups] = useState({
    categories: true,
    discover: true,
    quiz: false,
    library: false,
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

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
        }`
      : `flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-all duration-200 ease-fluid ${
          active
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.06]"
        }`;

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col overflow-y-auto overflow-x-hidden border-l border-white/5 bg-[#0c0c18] transition-all duration-300 ${
        collapsed ? "w-[72px] px-2" : "w-[18.5vw] px-3"
      }`}
    >
      {/* Logo + toggle */}
      <div
        className={`mb-0 z-[22] flex !h-[64px] items-center border-b border-white/10 ${
          collapsed
            ? "justify-center border-x-0"
            : "justify-between gap-2 border-x border-white/10 px-2"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
            <Network size={18} />
          </div>
          {!collapsed && (
            <span className="ml-1 text-[16px] font-semibold tracking-tight">
              NetHub
            </span>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
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

      {/* Search — hanya saat expanded */}
      {!collapsed && (
        <form
          onSubmit={handleSearch}
          className="mb-0 border-x border-b border-white/10 px-2 py-4 pt-5"
        >
          <div className="relative h-[50px] top-[4px]">
            <Search
              size={15}
              className="absolute left-3 top-[38%] -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guide..."
              className="input-field w-full py-2 pl-9 text-sm"
            />
          </div>
        </form>
      )}

      <nav
        className={`flex flex-1 flex-col gap-0.5 ${
          collapsed ? "" : "border-x border-b border-white/10"
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
        {!isGuest && (
          <NavGroup
            title="Library"
            open={openGroups.library}
            onToggle={() => toggleGroup("library")}
            collapsed={collapsed}
          >
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
                          : "text-gray-600 hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.06]"
                      }`
                }
              >
                <FileText size={17} />
                {!collapsed && "My Guides"}
              </NavLink>
            </div>
          </NavGroup>
        )}
      </nav>

      {/* Profile */}
      <div className={`mt-auto border-t border-white/10 ${collapsed ? "py-3" : ""}`}>
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
                    ? "border-accent/40 bg-accent-soft"
                    : "border-border-light hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.05]"
                }`
          }
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-sm font-semibold text-accent">
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
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-gray-400">
                  {isGuest ? "Guest Reader" : user?.title}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogout();
                }}
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-black/5 hover:text-red-500 dark:hover:bg-white/10"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </NavLink>

        {/* Logout icon saat collapsed */}
        {collapsed && (
          <button
            onClick={handleLogout}
            className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-red-400"
            title="Log out"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;