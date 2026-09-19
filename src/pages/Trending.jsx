import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
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

// ========== HIGHCHARTS - Top Guides by Views ==========
const ViewsChart = ({ posts }) => {
  const top5 = posts.slice(0, 5);

  const options = useMemo(() => {
    return {
      chart: {
        type: "bar",
        backgroundColor: "transparent",
        height: 280,
        style: { fontFamily: "inherit" },
      },
      title: { text: null },
      xAxis: {
        categories: top5.map((p) =>
          p.title.length > 28 ? p.title.slice(0, 28) + "…" : p.title
        ),
        labels: {
          style: { color: "#9ca3af", fontSize: "12px" },
        },
        lineWidth: 0,
        tickLength: 0,
      },
      yAxis: {
        min: 0,
        title: { text: null },
        labels: {
          style: { color: "#9ca3af", fontSize: "11px" },
        },
        gridLineColor: "rgba(156, 163, 175, 0.15)",
      },
      tooltip: {
        backgroundColor: "#1f2937",
        borderWidth: 0,
        borderRadius: 8,
        style: { color: "#fff", fontSize: "12px" },
        pointFormat: "<b>{point.y}</b> views",
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          pointPadding: 0.15,
          groupPadding: 0.1,
          color: {
            linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
            stops: [
              [0, "#3b82f6"],
              [1, "#1d4ed8"],
            ],
          },
          dataLabels: {
            enabled: true,
            format: "{y}",
            style: {
              color: "#6b7280",
              fontSize: "11px",
              fontWeight: "500",
              textOutline: "none",
            },
          },
        },
      },
      legend: { enabled: false },
      credits: { enabled: false },
      series: [
        {
          name: "Views",
          data: top5.map((p) => p.views || 0),
        },
      ],
    };
  }, [top5]);

  if (top5.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex items-center gap-2">
        {/* <TrendingUp size={16} className="text-accent" /> */}
        <h3 className="text-sm font-semibold">Top 3 Guides by Views</h3>
      </div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

// ========== Quiz Card (single top item) ==========
const QuizCard = ({ quiz, type }) => {
  const likes = quiz.likesCount ?? quiz.likes?.length ?? 0;
  const rating = quiz.averageRating ?? quiz.rating ?? 0;
  const questions = quiz.questionsCount ?? quiz.questions?.length ?? 0;

  return (
    <Link
      to={`/quizzes/${quiz._id || quiz.slug}`}
      className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-accent/40 hover:shadow-md dark:border-white/10 dark:bg-white/5"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <HelpCircle size={20} />
      </div>

      <h4 className="line-clamp-2 hover:underline text-base font-semibold group-hover:text-blue-400">
        {quiz.title}
      </h4>

      <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
        {quiz.description || quiz.category || "Quiz"}
      </p>

      <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-gray-500">
        {type === "loved" ? (
          <span className="flex items-center gap-1.5">
            <Heart size={14} className="text-rose-500" />
            <span className="font-medium">{likes}</span> likes
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Star size={14} className="fill-amber-400 text-amber-500" />
            <span className="font-medium">{Number(rating).toFixed(1)}</span>
            {quiz.ratingCount > 0 && (
              <span className="text-gray-400">({quiz.ratingCount})</span>
            )}
          </span>
        )}
        <span>{questions} questions</span>
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <Flame size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Discover
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Trending</h1>
          <p className="mt-1 text-sm text-gray-500">
            Most popular guides and quizzes
          </p>
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
      </div>

      {/* Stats */}
      {/* {!loading && posts.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Trending Guides"
            value={stats.totalPosts}
            sub={`in last ${period === 3650 ? "all time" : `${period} days`}`}
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={stats.totalViews.toLocaleString()}
            sub="across trending guides"
          />
          <StatCard
            icon={Heart}
            label="Total Likes"
            value={stats.totalLikes.toLocaleString()}
            sub="community engagement"
          />
          <StatCard
            icon={Award}
            label="Top Guide"
            value="#1"
            sub={
              stats.topTitle.length > 28
                ? stats.topTitle.slice(0, 28) + "…"
                : stats.topTitle
            }
          />
        </div>
      )} */}

      {/* Chart + Guides */}
      {loading ? (
        <d  iv className="flex justify-center flex-col h-full items-center text-center py-24">
          <img src="/cloud.png" alt="icon-cloud" className="w-20" />
          <p className="mt-2">Load content ...</p>
        </d>
      ) : posts.length === 0 ? (
        <div className="mb-10 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-white/15">
          <Flame size={32} className="text-gray-400" />
          <p className="font-medium">No trending guides yet</p>
          <p className="text-sm text-gray-500">Try a longer period.</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <ViewsChart posts={posts} />
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp size={16} className="text-accent" />
            <span>Top 3 Guides · Ranked by views & likes</span>
          </div>

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
        </>
      )}

      {/* ===================== TRENDING QUIZZES ===================== */}
      <div className="border-t border-gray-200 pt-10 dark:border-white/10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-accent">
            <HelpCircle size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Quizzes
            </span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            Trending Quizzes
          </h2>
        </div>

        {quizLoading ? (
          <div className="flex justify-center flex-col h-full items-center text-center py-24">
            <img src="/cloud.png" alt="icon-cloud" className="w-20" />
            <p className="mt-2">Load content ...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Most Loved - 1 quiz saja */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Heart size={16} className="text-rose-500" />
                <h3 className="text-sm font-semibold">Most Loved</h3>
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
                <h3 className="text-sm font-semibold">Highest Rated</h3>
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