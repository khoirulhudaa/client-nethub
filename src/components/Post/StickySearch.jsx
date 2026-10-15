// src/components/Post/StickySearch.jsx
import { Search, X, Loader2, Tag, Box, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createGuideFuse, searchGuides } from "../../utils/searchGuides";
import api from "../../api/axios";

const StickySearch = ({ currentSlug }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch posts sekali
  useEffect(() => {
    if (!open && !query && !selectedCategory && !selectedTag) return;
    if (allPosts.length > 0) return;

    setLoading(true);
    api
      .get("/posts", { params: { limit: 1000 } })
      .then(({ data }) => setAllPosts(data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, query, selectedCategory, selectedTag, allPosts.length]);

  // Ambil daftar category & tags unik dari data
  const { categories, tags } = useMemo(() => {
    const catSet = new Set();
    const tagSet = new Set();

    allPosts.forEach((p) => {
      if (p.category) catSet.add(p.category);
      (p.tags || []).forEach((t) => tagSet.add(t));
    });

    return {
      categories: Array.from(catSet).sort(),
      tags: Array.from(tagSet).sort(),
    };
  }, [allPosts]);

  // Filter + Search
  useEffect(() => {
    let source = allPosts.filter((p) => p.slug !== currentSlug);

    // Filter category
    if (selectedCategory) {
      source = source.filter((p) => p.category === selectedCategory);
    }

    // Filter tag
    if (selectedTag) {
      source = source.filter((p) => (p.tags || []).includes(selectedTag));
    }

    // Kalau ada query teks → pakai Fuse
    if (query.trim()) {
      const fuse = createGuideFuse(source);
      const found = searchGuides(fuse, query);
      setResults(found.slice(0, 10));
    } else {
      // Tanpa query, tampilkan hasil filter saja (maks 10)
      setResults(source.slice(0, 10));
    }
  }, [query, allPosts, currentSlug, selectedCategory, selectedTag]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearAll = () => {
    setQuery("");
    setSelectedCategory("");
    setSelectedTag("");
    setResults([]);
    inputRef.current?.focus();
  };

  const hasActiveFilter = selectedCategory || selectedTag || query.trim();

  return (
    <div ref={containerRef} className="relative z-30 mb-5">
      {/* Search Input */}
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-slate-300 dark:border-white/15 dark:!bg-[#0c0c18] px-3 py-2 shadow-sm">
        <Search size={16} className="shrink-0 text-gray-500 dark:text-gray-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Cari guide lain..."
          className="w-full bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder:text-gray-500"
        />

        {loading && <Loader2 size={14} className="animate-spin text-gray-400" />}

        {/* Toggle Filters */}
        <button
          type="button"
          onClick={() => {
            setShowFilters((v) => !v);
            setOpen(true);
          }}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
            showFilters || selectedCategory || selectedTag
              ? "bg-blue-600 text-white"
              : "text-gray-500 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <Box size={13} />
          Filter
          <ChevronDown
            size={12}
            className={`transition ${showFilters ? "rotate-180" : ""}`}
          />
        </button>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
            title="Hapus semua filter"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && open && (
        <div className="mt-1.5 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/15 dark:bg-[#12121b]">
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  !selectedCategory
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-gray-600 hover:bg-slate-200 dark:bg-white/10 dark:text-gray-300"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setSelectedCategory((prev) => (prev === cat ? "" : cat))
                  }
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-gray-600 hover:bg-slate-200 dark:bg-white/10 dark:text-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex w-full flex-col gap-1.5 border-t border-gray-100 pt-2 dark:border-white/10">
              <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                <Tag size={11} /> Tags
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setSelectedTag("")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    !selectedTag
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-gray-600 hover:bg-slate-200 dark:bg-white/10 dark:text-gray-300"
                  }`}
                >
                  Semua
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setSelectedTag((prev) => (prev === tag ? "" : tag))
                    }
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      selectedTag === tag
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-gray-600 hover:bg-slate-200 dark:bg-white/10 dark:text-gray-300"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Results */}
      {open && (hasActiveFilter || results.length > 0) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/15 dark:bg-[#12121b]">
          {/* Active filter chips */}
          {(selectedCategory || selectedTag) && (
            <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-3 py-2 dark:border-white/10">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("")}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  #{selectedTag}
                  <button onClick={() => setSelectedTag("")}>
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Mencari...
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              {hasActiveFilter
                ? "Tidak ada guide yang cocok"
                : "Ketik atau pilih filter untuk mencari"}
            </div>
          ) : (
            <ul className="py-1">
              {results.map((post) => (
                <li key={post._id}>
                  <Link
                    to={`/posts/${post.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-white/10" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {post.title}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                        {post.category && (
                          <span className="text-blue-600 dark:text-blue-400">
                            {post.category}
                          </span>
                        )}
                        {post.author?.name && <span>· {post.author.name}</span>}
                        {(post.tags || []).slice(0, 2).map((t) => (
                          <span key={t} className="text-emerald-600 dark:text-emerald-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default StickySearch;