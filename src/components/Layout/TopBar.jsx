import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

const TopBar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="surface-card rounded-none sticky top-0 z-20 flex h-16 items-center gap-3 border-b-1 px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-control p-2 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <form onSubmit={handleSearch} className="relative w-full max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides, tags, categories…"
          className="input-field pl-9"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-control p-2.5 text-gray-500 transition-all duration-200 ease-fluid hover:bg-black/5 active:scale-98 dark:text-gray-300 dark:hover:bg-white/10"
          title="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
