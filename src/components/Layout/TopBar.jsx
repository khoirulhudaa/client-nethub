import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Flame,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  Calculator,
  PencilRuler,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const TopBar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const isGuest = user?.isGuest || user?.role === "guest";

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="surface-card sticky top-0 z-20 flex h-16 items-center gap-3 rounded-none border-b px-4 sm:px-5 lg:pr-9">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="rounded-control p-2 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative w-full max-w-md">
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
      <div className="ml-2 hidden items-center gap-3 md:flex">
        <TopLink to="/trending" icon={Flame} label="Trending" />
        <TopLink to="/tools/subnet" icon={Calculator} label="Subnet" />
        <TopLink to="/practice" icon={PencilRuler} label="Practice" />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* New post — hanya user login */}
        {!isGuest && (
          <button
            onClick={() => navigate("/create")}
            className="hidden items-center h-10 gap-1.5 rounded-xl border-[2px] border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 sm:inline-flex"
          >
            <Plus size={16} />
          </button>
        )}

        {/* Notification placeholder */}
        <button
          type="button"
          className="relative rounded-control p-2.5 text-gray-500 transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
          title="Notifications"
          onClick={() => {
            // nanti bisa buka dropdown notifikasi
          }}
        >
          <Bell size={18} />
          {/* Badge contoh */}
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-control p-2.5 text-gray-500 transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
          title="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Avatar singkat */}
        <Link
          to={isGuest ? "#" : "/profile"}
          className="ml-0.5 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-blue-500 text-sm font-semibold text-white ring-1"
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
        </Link>
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