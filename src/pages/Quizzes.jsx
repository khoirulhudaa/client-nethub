import {
  BookOpen,
  Heart,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Star
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Topology", "Maintenance", "Fixing", "Installation", "Hardware"];

export default function Quizzes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLoading(true);
    api
      .get("/quizzes", { params: { category, search } })
      .then(({ data }) => setQuizzes(data.quizzes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-accent">
            Quiz Network
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Materi Quiz dari Komunitas
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Latihan pilihan ganda & praktek topology
          </p>
        </div>

        {user && (
          <button
            onClick={() => navigate("/quizzes/create")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
          >
            <Plus size={16} /> Buat Quiz
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm sm:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            updateParam("search", localSearch);
          }}
        >
          <Search size={16} className="text-gray-400" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari quiz..."
            className="w-full bg-transparent text-sm outline-none text-black"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParam("category", "")}
            className={`rounded-xl border px-3 py-1.5 text-sm transition ${
              !category
                ? "border-accent bg-accent text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-accent/50"
            }`}
          >
            Semua
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => updateParam("category", c)}
              className={`rounded-xl border px-3 py-1.5 text-sm transition ${
                category === c
                  ? "border-accent bg-accent text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-accent/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <BookOpen size={40} className="text-gray-300" />
          <p className="font-medium">Belum ada quiz</p>
          <p className="text-sm text-gray-500">Jadilah yang pertama membuat materi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <Link
              key={quiz._id}
              to={`/quizzes/${quiz._id}`}
              className="surface-card group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-accent/40 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="rounded-full bg-accent/10 px-2.5 py-0.5 flex items-center text-xs font-medium text-accent">
                  <span className="relative top-[1.2px]">
                    {quiz.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-medium">
                    {quiz.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({quiz.ratingCount || 0})
                  </span>
                </div>
              </div>

              <h3 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-accent">
                {quiz.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                {quiz.description || "Tidak ada deskripsi"}
              </p>

              <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <BookOpen size={13} />
                  {quiz.questions?.length || 0} soal
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={13} />
                  {quiz.likes?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={13} />
                  {/* bisa diisi count comment nanti */}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-white/5">
                <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-accent/10 text-xs font-semibold text-accent">
                  {quiz.author?.avatar ? (
                    <img
                      src={quiz.author.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    quiz.author?.name?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {quiz.author?.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}