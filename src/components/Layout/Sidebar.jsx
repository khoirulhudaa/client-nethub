import {
  Boxes,
  FileText,
  HardDrive,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Network,
  Search,
  ShieldAlert,
  Wrench
} from "lucide-react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState } from "react";

const categoryLinks = [
  { label: "All Guides", icon: LayoutGrid, to: "/", category: null },
  { label: "Topology", icon: Network, to: "/?category=Topology", category: "Topology" },
  { label: "Installation", icon: Boxes, to: "/?category=Installation", category: "Installation" },
  { label: "Maintenance", icon: Wrench, to: "/?category=Maintenance", category: "Maintenance" },
  { label: "Fixing Error", icon: ShieldAlert, to: "/?category=Fixing", category: "Fixing" },
  { label: "Soft & Hardware", icon: HardDrive, to: "/?category=Hardware", category: "Hardware" },
  { label: "Quiz Network", icon: HelpCircle, to: "/quiz-builder", category: null },
];

const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Ambil nilai query ?category= saat ini
  const currentCategory = searchParams.get("category");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // di dalam component:
const [search, setSearch] = useState("");

const handleSearch = (e) => {
  e.preventDefault();
  if (!search.trim()) return;
  navigate(`/?search=${encodeURIComponent(search.trim())}`);
  onNavigate?.();
};

  return (
    <aside className="glass-panel flex h-full w-64 shrink-0 flex-col border-r px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
          <Network size={18} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">NetHub</span>
      </div>

      {/* <button onClick={() => { navigate("/create"); onNavigate?.(); }} className="btn-primary mb-6 py-3 flex items-start justify-start text-left w-max">
        <PlusCircle size={16} />
        New Guide
      </button> */}

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

      <nav className="flex flex-1 flex-col gap-1">
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Categories
        </p>
        {categoryLinks.map(({ label, icon: Icon, to, category }) => {
          // Cek apakah item ini aktif berdasarkan query category
          const isCategoryActive = currentCategory === category;

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

        <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
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
      </nav>

      <NavLink
        to="/profile"
        onClick={onNavigate}
        className={({ isActive }) =>
          `mt-4 flex items-center gap-3 rounded-control border px-3 py-2.5 transition-colors ${
            isActive
              ? "border-accent/40 bg-accent-soft"
              : "border-border-light hover:bg-black/[0.03] dark:border-border-dark dark:hover:bg-white/[0.05]"
          }`
        }
        title="Buka profil"
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-sm font-semibold text-accent">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name?.[0]?.toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-gray-400">{user?.title}</p>
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