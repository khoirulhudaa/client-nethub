// src/components/Post/BrowseGuidesSidebar.jsx
import { Box, Loader2, Search, Tag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { createGuideFuse, searchGuides } from "../../utils/searchGuides";

const BrowseGuidesSidebar = ({ open, onClose, currentSlug, initialQuery }) => {
  const [query, setQuery] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // Sync saat sidebar dibuka
  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  // Fetch data saat sidebar dibuka
  useEffect(() => {
    if (!open) return;
    if (allPosts.length > 0) return;

    setLoading(true);
    api
      .get("/posts", { params: { limit: 1000 } })
      .then(({ data }) => setAllPosts(data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, allPosts.length]);

  // Reset filter saat ditutup (opsional)
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedCategory("");
      setSelectedTag("");
    }
  }, [open]);

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

  const results = useMemo(() => {
    let source = allPosts.filter((p) => p.slug !== currentSlug);

    if (selectedCategory) {
      source = source.filter((p) => p.category === selectedCategory);
    }
    if (selectedTag) {
      source = source.filter((p) => (p.tags || []).includes(selectedTag));
    }

    if (query.trim()) {
      const fuse = createGuideFuse(source);
      return searchGuides(fuse, query).slice(0, 30);
    }

    return source.slice(0, 30);
  }, [allPosts, currentSlug, selectedCategory, selectedTag, query]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 bottom-0 z-[9999] flex h-[92vh] w-full max-w-lg flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/15 dark:bg-[#12121b]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3.5 dark:border-white/15">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Browse Guides
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/70 text-white transition hover:bg-red-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search + Filters */}
        <div className="shrink-0 space-y-3 border-b border-gray-100 p-4 dark:border-white/10">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-slate-100 px-3 py-2 dark:border-white/15 dark:bg-white/5">
            <Search size={15} className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul, tag, kategori..."
              className="w-full bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder:text-gray-500"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              <Box size={11} /> Category
            </p>
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

          {/* Tags Filter — pakai select */}
            {tags.length > 0 && (
            <div>
                <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                <Tag size={11} /> Tags
                </p>
                <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
                >
                <option value="" className="text-slate-900">Semua tags</option>
                {tags.map((tag) => (
                    <option key={tag} value={tag} className="text-slate-900">
                    #{tag}
                    </option>
                ))}
                </select>
            </div>
            )}
        </div>

        {/* Results */}
        <div className="flex-1 pt-1.5 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
              <Loader2 size={18} className="animate-spin" />
              Memuat guides...
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-gray-500">
              <p>Tidak ada guide yang cocok</p>
              <p className="text-xs">Coba ubah kata kunci atau filter</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-white/5">
              {results.map((post) => (
                <li key={post._id}>
                  <Link
                    to={`/posts/${post.slug}`}
                    onClick={onClose}
                    className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-200 dark:bg-white/10" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-white">
                        {post.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                        {post.category && (
                          <span className="text-blue-600 dark:text-blue-400">
                            {post.category}
                          </span>
                        )}
                        {post.author?.name && <span>· {post.author.name}</span>}
                      </div>
                      {(post.tags || []).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(post.tags || []).slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer count */}
        {!loading && results.length > 0 && (
          <div className="shrink-0 border-t border-gray-100 px-4 py-2.5 text-center text-xs text-gray-500 dark:border-white/10">
            Menampilkan {results.length} guide
          </div>
        )}
      </div>
    </>
  );
};

export default BrowseGuidesSidebar;