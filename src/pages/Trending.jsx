import {
  Flame,
  Heart,
  HelpCircle,
  Star,
  TrendingUp
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import PostCard from "../components/Post/PostCard.jsx";

const PERIODS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "All time", value: 3650 },
];

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);


// ========== Quiz Card (single top item) ==========
const QuizCard = ({ quiz, type }) => {
  const likes = quiz.likesCount ?? quiz.likes?.length ?? 0;
  const rating = quiz.averageRating ?? quiz.rating ?? 0;
  const questions = quiz.questionsCount ?? quiz.questions?.length ?? 0;

  return (
    <Link
      to={`/quizzes/${quiz._id || quiz.slug}`}
      className="group relative flex flex-col rounded-2xl border border-gray-200 dark:!bg-[#0c0c18]
           !bg-slate-200 p-3.5 shadow-sm transition hover:border-accent/40 hover:shadow-md dark:border-white/10"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl !bg-slate-900 dark:!bg-white text-white dark:text-blue-950">
        <HelpCircle size={20} />
      </div>

      <h4 className="line-clamp-2 dark:text-slate dark:text-white text-slate-900 hover:underline text-base font-semibold group-hover:text-blue-400">
        {quiz.title}
      </h4>

      <p className="mt-1.5 line-clamp-2 text-sm !text-gray-500 dark:!text-slate-500">
        {quiz.description || quiz.category || "Quiz"}
      </p>

      <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-gray-500">
        {type === "loved" ? (
          <span className="flex items-center gap-1.5">
            <Heart size={14} className="text-rose-500" />
            <span className="text-gray-600 dark:!text-slate-500">{likes} likes</span> 
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Star size={14} className="fill-amber-400 text-amber-500" />
            <span className="font-medium">{Number(rating).toFixed(1)}</span>
            {quiz.ratingCount > 0 && (
              <span className="text-gray-600 dark:!text-slate-500">({quiz.ratingCount})</span>
            )}
          </span>
        )}
        <span className="text-gray-600 dark:!text-slate-500">{questions} questions</span>
      </div>
    </Link>
  );
};

const Trending = () => {
  const [posts, setPosts] = useState([]);
  const [lovedQuiz, setLovedQuiz] = useState(null);
  const [ratedQuiz, setRatedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  // Fetch trending guides
  useEffect(() => {
    setLoading(true);
    api
      .get("/posts/trending", { params: { limit: 3, period } })
      .then(({ data }) => setPosts((data.posts || []).slice(0, 3)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [period]);

  const RANK_STYLES = [
    "bg-amber-400 text-amber-950",   // #1 emas
    "bg-gray-300 text-gray-800",     // #2 perak
    "bg-orange-400 text-orange-950", // #3 perunggu
  ];

  // Fetch top 1 quiz per category
  useEffect(() => {
    setQuizLoading(true);

    const lovedPromise = api
      .get("/quizzes/trending", { params: { sort: "likes", limit: 1 } })
      .then(({ data }) => setLovedQuiz(data.quizzes?.[0] || null))
      .catch(() => setLovedQuiz(null));

    const ratedPromise = api
      .get("/quizzes/trending", { params: { sort: "rating", limit: 1 } })
      .then(({ data }) => setRatedQuiz(data.quizzes?.[0] || null))
      .catch(() => setRatedQuiz(null));

    Promise.all([lovedPromise, ratedPromise]).finally(() =>
      setQuizLoading(false)
    );
  }, []);

  const stats = useMemo(() => {
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce(
      (sum, p) => sum + (p.likes?.length || 0),
      0
    );
    const topPost = posts[0];

    return {
      totalPosts: posts.length,
      totalViews,
      totalLikes,
      topTitle: topPost?.title || "—",
    };
  }, [posts]);

  return (
    <div className="mx-auto max-w-full md:border-x border-white dark:border-white/10 px-0 py-0 md:py-6 md:px-6">
      {/* Header */}
      {/* <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Discover
            </span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Trending</h1>
        </div>

        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-xl border px-3 py-1.5 text-sm transition ${
                period === p.value
                  ? "border-accent bg-accent text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-accent/50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div> */}

      {/* Chart + Guides */}
      {loading ? (
        <div className="">
            <div className="flex surface-card justify-center flex-col h-full items-center text-center py-20 mb-10">
              <img src="/cloud.png" alt="icon-cloud" className="w-20" />
              <p className="mt-2">Load content ...</p>
            </div>
          </div>
      ) : posts.length === 0 ? (
        <div className="mb-10 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-white/15">
          <Flame size={32} className="text-gray-400" />
          <p className="font-medium">No trending guides yet</p>
          <p className="text-sm text-gray-500">Try a longer period.</p>
        </div>
      ) : (
        <div>
          {/* <div className="mb-4 flex items-center gap-2 text-sm text-white dark:text-gray-500">
            <TrendingUp size={16} className="text-accent" />
            <span>Top 3 Guides · Ranked by views & likes</span>
          </div> */}

          <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <div key={post._id} className="relative">
                <span
                  className={`absolute right-3 top-[3.7%] z-10 flex h-6 min-w-6 items-center justify-center rounded-lg px-1 text-xs font-bold shadow-md ${RANK_STYLES[index]}`}
                >
                  #{index + 1}
                </span>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TRENDING QUIZZES ===================== */}
      <div className="border-gray-200 dark:border-white/10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-accent">
            <HelpCircle size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Quizzes
            </span>
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Trending Quizzes
          </h2>
        </div>

        {quizLoading ? (
          <div className="">
            <div className="flex surface-card justify-center flex-col h-full items-center text-center py-20">
              <img src="/cloud.png" alt="icon-cloud" className="w-20" />
              <p className="mt-2">Load content ...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Most Loved - 1 quiz saja */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Heart size={16} className="text-rose-500" />
                <h3 className="text-sm text-white font-semibold">Most Loved</h3>
              </div>
              {lovedQuiz ? (
                <QuizCard quiz={lovedQuiz} type="loved" />
              ) : (
                <p className="text-sm text-gray-500">No data yet</p>
              )}
            </div>

            {/* Highest Rated - 1 quiz saja */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                <h3 className="text-sm text-white font-semibold">Highest Rated</h3>
              </div>
              {ratedQuiz ? (
                <QuizCard quiz={ratedQuiz} type="rated" />
              ) : (
                <p className="text-sm text-gray-500">No data yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;