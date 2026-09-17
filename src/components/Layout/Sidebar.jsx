import {
  Boxes,
  Brain,
  Calculator,
  ChevronDown,
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
import { useState } from "react";
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
  { label: "Build Computer", icon: Monitor, to: "/pc-build-practice" },
  { label: "Practice Topology", icon: PencilRuler, to: "/topology-practice" },
];

// --- Collapsible Group (FIXED) -----------------------------------------------
const NavGroup = ({ title, open, onToggle, children }) => (
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

const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category");
  const [search, setSearch] = useState("");

  const isGuest = user?.isGuest || user?.role === "guest";

  // State buka/tutup tiap group
  const [openGroups, setOpenGroups] = useState({
    categories: true,
    discover: true,
    quiz: false,
    library: false,
  });

  const toggleGroup = (key) => {
    setOpenGroups((prev) => {
      const isOpen = prev[key];

      // Kalau group ini sedang terbuka → tutup saja
      if (isOpen) {
        return { ...prev, [key]: false };
      }

      // Hitung berapa group yang sedang terbuka
      const openKeys = Object.keys(prev).filter((k) => prev[k]);

      // Kalau sudah 2 yang terbuka → tutup yang paling lama (yang pertama di list)
      if (openKeys.length >= 2) {
        const closeKey = openKeys[0]; // tutup salah satu yang terbuka
        return {
          ...prev,
          [closeKey]: false,
          [key]: true,
        };
      }

      // Masih kurang dari 2 → buka group ini
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
    `flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-all duration-200 ease-fluid ${
      active
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.06]"
    }`;

  return (
    <aside className="flex h-full w-[18vw] shrink-0 flex-col overflow-y-auto rounded-none border-l border-white/5 bg-[#0c0c18] px-3">
      {/* Logo */}
      <div className="border-x border-white/10 mb-0 z-[22] flex !h-[64px] items-center gap-2 border-b border-white/10 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white">
          <Network size={18} />
        </div>
        <span className="ml-2 text-[16px] font-semibold tracking-tight">NetHub</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-0 pt-7 py-4 px-2 border-x border-b border-white/10">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari guide..."
            className="input-field w-full py-2 pl-9 text-sm"
          />
        </div>
      </form>

      <nav className="flex flex-1 flex-col gap-0.5 border-x border-b border-white/10">
        {/* ===== Categories ===== */}
        <NavGroup
          title="Categories"
          open={openGroups.categories}
          onToggle={() => toggleGroup("categories")}
        >
          {categoryLinks.map(({ label, icon: Icon, to, category }) => {
            const isCategoryActive =
              category === null
                ? !currentCategory && location.pathname === "/"
                : currentCategory === category;

            return (
              <div className="px-2 mb-1.5">
                <NavLink
                  key={label}
                  to={to}
                  onClick={onNavigate}
                  className={linkClass(isCategoryActive)}
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              </div>
            );
          })}
        </NavGroup>

        {/* ===== Discover ===== */}
        <NavGroup
          title="Discover"
          open={openGroups.discover}
          onToggle={() => toggleGroup("discover")}
        >
          {discoverLinks.map(({ label, icon: Icon, to }) => (
            <div className="px-2">
              <NavLink
                key={label}
                to={to}
                onClick={onNavigate}
                className={({ isActive }) => linkClass(isActive)}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            </div>
          ))}
        </NavGroup>

        {/* ===== Quiz ===== */}
        <NavGroup
          title="Quiz"
          open={openGroups.quiz}
          onToggle={() => toggleGroup("quiz")}
        >
          {filteredQuizLinks.map(({ label, icon: Icon, to }) => (
            <div className="px-2">
              <NavLink
                key={label}
                to={to}
                onClick={onNavigate}
                className={({ isActive }) => linkClass(isActive)}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            </div>
          ))}
        </NavGroup>

        {/* ===== Library (hanya user biasa) ===== */}
        {!isGuest && (
          <NavGroup
            title="Library"
            open={openGroups.library}
            onToggle={() => toggleGroup("library")}
          >
            <div className="px-2">
              <NavLink
                to="/my-posts"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-all duration-200 ease-fluid ${
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-gray-600 hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.06]"
                  }`
                }
              >
                <FileText size={17} />
                My Guides
              </NavLink>
            </div>
          </NavGroup>
        )}
      </nav>

      {/* Profile */}
      <NavLink
        to={isGuest ? "#" : "/profile"}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 border-x px-3 pb-4 pt-3 transition-colors ${
            isActive && !isGuest
              ? "border-accent/40 bg-accent-soft"
              : "border-border-light hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.05]"
          }`
        }
        title={isGuest ? "Guest Mode" : "Buka profil"}
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-sm font-semibold text-accent">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name?.[0]?.toUpperCase() || "G"
          )}
        </div>
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
      </NavLink>
    </aside>
  );
};

export default Sidebar;