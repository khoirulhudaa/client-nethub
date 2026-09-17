import {
  Boxes,
  Brain,
  FileText,
  HardDrive,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Monitor,
  Network,
  PencilRuler,
  Search,
  ShieldAlert,
  Wrench
} from "lucide-react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState } from "react";

const categoryLinks = [
  { label: "Dashboard", icon: LayoutGrid, to: "/", category: null },
  { label: "Topology", icon: Network, to: "/?category=Topology", category: "Topology" },
  { label: "Installation", icon: Boxes, to: "/?category=Installation", category: "Installation" },
  { label: "Maintenance", icon: Wrench, to: "/?category=Maintenance", category: "Maintenance" },
  // { label: "Fixing Error", icon: ShieldAlert, to: "/?category=Fixing", category: "Fixing" },
  { label: "Soft & Hardware", icon: HardDrive, to: "/?category=Hardware", category: "Hardware" },
];

const quizLinks = [
  { label: "Build Quiz", icon: HelpCircle, to: "/quiz-builder" },
  { label: "Test Network", icon: Brain, to: "/quizzes" },
  { label: "Build Computer", icon: Monitor, to: "/pc-build-practice" }, // ← baru
  { label: "Practice Topology", icon: PencilRuler, to: "/topology-practice" }, // ← baru
];

const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category");
  const [search, setSearch] = useState("");

  const isGuest = user?.isGuest || user?.role === "guest";

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

  // Filter quiz links: hilangkan Build Quiz untuk guest
  const filteredQuizLinks = isGuest
    ? quizLinks.filter((item) => item.to !== "/quiz-builder")
    : quizLinks;

  return (
    <aside className="bg-[#0c0c18] flex h-full w-70 shrink-0 flex-col border-r-1 border-white/5 rounded-none px-4 pb-6">
      <div className="mb-6 !h-[64px] z-[22] border-b border-white/10 flex items-center gap-2 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white">
          <Network size={18} />
        </div>
        <span className="text-[16px] font-semibold ml-2 tracking-tight">NetHub</span>
      </div>

      <form onSubmit={handleSearch} className="mb-4 px-1">
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

      <nav className="flex flex-1 flex-col gap-1 pt-2">
        {/* Categories – tetap tampil semua */}
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Categories
        </p>
        {categoryLinks.map(({ label, icon: Icon, to, category }) => {
          const isCategoryActive =
            category === null
              ? !currentCategory && location.pathname === "/"
              : currentCategory === category;

          return (
            <NavLink
              key={label}
              to={to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-all duration-200 ease-fluid ${
                isCategoryActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.06]"
              }`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          );
        })}

        {/* Quiz – tanpa Build Quiz untuk guest */}
        <p className="px-3 pb-1 pt-3.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Quiz
        </p>
        {filteredQuizLinks.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-all duration-200 ease-fluid ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.06]"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        {/* Library – My Guides hanya untuk user biasa */}
        {!isGuest && (
          <>
            <p className="px-3 pb-1 pt-3.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Library
            </p>
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
          </>
        )}
      </nav>

      {/* Profile section – tetap tampil, biar guest bisa logout */}
      <NavLink
        to={isGuest ? "#" : "/profile"}
        onClick={onNavigate}
        className={({ isActive }) =>
          `mt-4 flex items-center gap-3 rounded-control border px-3 py-2.5 transition-colors ${
            isActive && !isGuest
              ? "border-accent/40 bg-accent-soft"
              : "border-border-light hover:bg-black/[0.03] dark:border-border-dark dark:hover:bg-white/[0.05]"
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