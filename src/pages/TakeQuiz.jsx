import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Star
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TopologyCanvas from "./TopologyCanvas";

export default function TakeQuizes() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: { selectedOptions / submittedTopology } }
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Social
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/quizzes/${id}`),
      api.get(`/quizzes/${id}/comments`),
    ])
      .then(([quizRes, commentRes]) => {
        const q = quizRes.data.quiz;
        setQuiz(q);
        setLikesCount(q.likes?.length || 0);
        setLiked(user ? q.likes?.some((l) => String(l) === String(user._id)) : false);
        setComments(commentRes.data.comments || []);

        // cek rating user
        if (user && q.ratings) {
          const r = q.ratings.find((r) => String(r.user) === String(user._id));
          if (r) setUserRating(r.value);
        }
      })
      .catch((err) => {
        console.error(err);
        navigate("/quizzes");
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSelectOption = (qId, optIdx, allowMultiple) => {
    setAnswers((prev) => {
      const current = prev[qId]?.selectedOptions || [];
      let next;
      if (allowMultiple) {
        next = current.includes(optIdx)
          ? current.filter((i) => i !== optIdx)
          : [...current, optIdx];
      } else {
        next = [optIdx];
      }
      return { ...prev, [qId]: { selectedOptions: next } };
    });
  };

  const handleTopologyChange = (qId, topo) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { submittedTopology: topo },
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Login dulu untuk submit jawaban");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: quiz.questions.map((q) => ({
          questionId: q._id,
          ...answers[q._id],
        })),
        timeSpent: 0,
      };
      const { data } = await api.post(`/quizzes/${id}/attempt`, payload);
      setResult(data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal submit");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async () => {
    if (!user) return alert("Login dulu");
    try {
      const { data } = await api.patch(`/quizzes/${id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRate = async (value) => {
    if (!user) return alert("Login dulu");
    try {
      const { data } = await api.post(`/quizzes/${id}/rate`, { value });
      setUserRating(data.userRating);
      setQuiz((prev) => ({
        ...prev,
        averageRating: data.averageRating,
        ratingCount: data.ratingCount,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setCommentLoading(true);
    try {
      const { data } = await api.post(`/quizzes/${id}/comments`, {
        content: newComment,
      });
      setComments((prev) => [{ ...data.comment, replies: [] }, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading || !quiz) {
    return (
      <div className="py-4">
        <div className="flex surface-card justify-center flex-col h-full items-center text-center py-20">
          <img src="/cloud.png" alt="icon-cloud" className="w-20" />
          <p className="mt-2">Load content ...</p>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQ];
  const isLast = currentQ === quiz.questions.length - 1;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/quizzes")}
            className="rounded-lg relative top-[2px] py-2 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold">{quiz.title}</h1>
          </div>
        </div>
      </div>

      {/* Social bar */}
      <div className="surface-card bg-white dark:bg-white/5 flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 px-4 py-3">
        <button
          onClick={toggleLike}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
            liked
              ? "bg-red-50 text-red-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
          {likesCount}
        </button>

        <div className="flex items-center gap-1 relative top-[-2px] left-[-10px]">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => handleRate(v)}
              className="p-0.5"
            >
              <Star
                size={18}
                className={
                  v <= userRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
          <span className="ml-1 relative top-[1.5px] text-xs text-gray-500">
            {quiz.averageRating?.toFixed(1) || "0.0"} ({quiz.ratingCount || 0})
          </span>
        </div>

        <span className="flex items-center gap-1 text-sm text-gray-500">
          <MessageCircle size={16} />
          {comments.length} komentar
        </span>
      </div>

      {/* Hasil (setelah submit) */}
     {submitted && result && (
        <div className="surface-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Header skor */}
            <div className="bg-gradient-to-br from-accent to-blue-600 px-6 py-8 text-center text-white">
            <p className="text-sm font-medium opacity-90">Hasil Quiz</p>
            <p className="mt-2 text-5xl font-bold tracking-tight">
                {result.percentage}%
            </p>
            <p className="mt-1 text-sm opacity-90">
                {result.totalScore} dari {result.maxScore} poin
            </p>

            {/* Badge status */}
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {result.percentage >= 80 ? (
                <>🎉 Excellent</>
                ) : result.percentage >= 60 ? (
                <>👍 Good Job</>
                ) : result.percentage >= 40 ? (
                <>💪 Keep Practicing</>
                ) : (
                <>📚 Perlu Belajar Lagi</>
                )}
            </div>
            </div>

            {/* Ringkasan */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 dark:divide-white/5 dark:border-white/5">
            <div className="px-4 py-4 text-center">
                <p className="text-2xl font-semibold text-emerald-600">
                {result.graded?.filter((g) => g.isCorrect).length || 0}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">Benar</p>
            </div>
            <div className="px-4 py-4 text-center">
                <p className="text-2xl font-semibold text-rose-500">
                {result.graded?.filter((g) => !g.isCorrect).length || 0}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">Salah</p>
            </div>
            <div className="px-4 py-4 text-center">
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                {quiz.questions.length}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">Soal</p>
            </div>
            </div>

            {/* Progress bar visual */}
            <div className="px-6 py-4">
            <div className="mb-1.5 flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{result.percentage}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div
                className={`h-full rounded-full transition-all duration-700 ${
                    result.percentage >= 80
                    ? "bg-emerald-500"
                    : result.percentage >= 60
                    ? "bg-blue-500"
                    : result.percentage >= 40
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${result.percentage}%` }}
                />
            </div>
            </div>

            {/* Tombol aksi */}
            <div className="flex gap-3 border-t border-gray-100 px-6 py-4 dark:border-white/5">
            <button
                onClick={() => {
                setSubmitted(false);
                setResult(null);
                setCurrentQ(0);
                setAnswers({});
                }}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
            >
                Coba Lagi
            </button>
            <button
                onClick={() => navigate("/quizzes")}
                className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
                Kembali ke Daftar
            </button>
            </div>
        </div>
        )}

      {/* Soal */}
      {!submitted && (
        <div className="surface-card bg-white dark:bg-white/5 rounded-xl border border-gray-200 p-5">
          {/* Progress */}
          <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              Soal {currentQ + 1} / {quiz.questions.length}
            </span>
            <span>{question.points} poin</span>
          </div>

          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{
                width: `${((currentQ + 1) / quiz.questions.length) * 100}%`,
              }}
            />
          </div>

          <h3 className="mt-4 text-base font-medium leading-relaxed">
            {question.questionText}
          </h3>

          {/* Multiple Choice */}
          {question.type === "multiple_choice" && (
            <div className="mt-5 space-y-2">
              {question.options.map((opt, oi) => {
                const selected = answers[question._id]?.selectedOptions?.includes(oi);
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() =>
                      handleSelectOption(
                        question._id,
                        oi,
                        question.allowMultiple
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                      selected
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-gray-500/40 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                        selected
                          ? "border-accent bg-accent text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          )}

          {/* Topology */}
          {question.type === "topology" && (
            <div className="mt-5">
              <p className="mb-3 text-sm text-gray-500">
                Susun topology sesuai ketentuan di bawah.
              </p>
              <TopologyCanvas
                value={
                  answers[question._id]?.submittedTopology || {
                    nodes: [],
                    edges: [],
                  }
                }
                onChange={(topo) => handleTopologyChange(question._id, topo)}
                mode="quiz"
                allowedHardware={
                  question.allowedHardware?.length
                    ? question.allowedHardware
                    : null
                }
                allowedCables={
                  question.allowedCables?.length
                    ? question.allowedCables
                    : null
                }
                height={400}
              />
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((p) => p - 1)}
              className="rounded-lg border active:scale-[0.99] duration-100 border-gray-200 px-4 py-2 hover:bg-slate-500/20 text-sm disabled:opacity-40"
            >
              Sebelumnya
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Mengirim..." : "Submit Jawaban"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentQ((p) => p + 1)}
                className="rounded-lg active:scale-[0.99] duration-100 bg-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Selanjutnya
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="surface-card rounded-xl border border-gray-200 sur-white dark:bg-white/5 p-5">
        <h3 className="mb-4 font-medium">
          Komentar ({comments.length})
        </h3>

        {user && (
          <form onSubmit={submitComment} className="mb-6 flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar..."
              className="input-field flex-1 text-sm"
            />
            <button
              type="submit"
              disabled={commentLoading || !newComment.trim()}
              className="rounded-lg bg-accent px-3 py-2 text-white disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        )}

        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-sm text-gray-400">Belum ada komentar.</p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/10 text-xs font-semibold text-accent">
                {c.user?.avatar ? (
                  <img
                    src={c.user.avatar}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  c.user?.name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{c.user?.name}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}