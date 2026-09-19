import {
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronUp,
  ChevronDown,
  Trash2,
  Calendar,
  Loader2,
  ArrowRight,
  Target,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

// ========== Sortable Item ==========
const SortableItem = ({
  item,
  index,
  total,
  onToggleComplete,
  onRemove,
  onMove,
  actionLoading,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.post._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const post = item.post;
  const isCompleted = item.completed;
  const isLoading = actionLoading === post?._id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-3 rounded-2xl border p-4 transition ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5"
          : "border-gray-200 bg-white dark:border-white/10 dark:bg-white/5"
      } ${isDragging ? "z-50 shadow-lg" : ""}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab relative touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:hover:text-gray-200"
        title="Seret untuk mengubah urutan"
      >
        <GripVertical size={18} />
      </button>

      {/* Step Number */}
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
            isCompleted
              ? "bg-emerald-500 text-white"
              : "bg-accent/15 text-accent"
          }`}
        >
          {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              to={`/posts/${post.slug}`}
              className={`text-base font-semibold hover:underline ${
                isCompleted ? "text-emerald-700 dark:text-emerald-400" : ""
              }`}
            >
              {post.title}
            </Link>
            <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
              {post.excerpt || post.category}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-1 sm:mt-0">
            {/* Move Up */}
            <button
              onClick={() => onMove(post._id, "up")}
              disabled={index === 0 || isLoading}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-black/5 hover:text-gray-700 disabled:opacity-30 dark:hover:bg-white/10"
              title="Naikkan urutan"
            >
              <ChevronUp size={16} />
            </button>

            {/* Move Down */}
            <button
              onClick={() => onMove(post._id, "down")}
              disabled={index === total - 1 || isLoading}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-black/5 hover:text-gray-700 disabled:opacity-30 dark:hover:bg-white/10"
              title="Turunkan urutan"
            >
              <ChevronDown size={16} />
            </button>

            {/* Toggle Complete */}
            <button
              onClick={() => onToggleComplete(post._id)}
              disabled={isLoading}
              className={`rounded-lg p-1.5 transition ${
                isCompleted
                  ? "text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                  : "text-gray-400 hover:bg-black/5 hover:text-accent dark:hover:bg-white/10"
              }`}
              title={isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isCompleted ? (
                <CheckCircle2 size={16} />
              ) : (
                <Circle size={16} />
              )}
            </button>

            {/* Remove */}
            <button
              onClick={() => onRemove(post._id)}
              disabled={isLoading}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              title="Hapus dari list"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span className="rounded-md bg-gray-100 px-2 py-0.5 dark:bg-white/10">
            {post.category}
          </span>
          {item.plannedDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(item.plannedDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {isCompleted && item.completedAt && (
            <span className="text-emerald-600 dark:text-emerald-400">
              Selesai {new Date(item.completedAt).toLocaleDateString("id-ID")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== Main Page ==========
const ReadingListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, progress: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const isGuest = user?.isGuest || user?.role === "guest";

  useEffect(() => {
    if (!user || user.isGuest || user.role === "guest") {
        // Jangan redirect, biarkan masuk tapi tampilkan empty + tombol login
        setLoading(false);
        return;
    }
    fetchReadingList();
    }, [user]);

  const fetchReadingList = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/auth/me/reading-list");
      setList(data.readingList || []);
      setStats(data.stats || { total: 0, completed: 0, progress: 0, remaining: 0 });
    } catch (err) {
      console.error("Failed to fetch reading list:", err);
    } finally {
      setLoading(false);
    }
  };

//   useEffect(() => {
//     if (!user || user.isGuest || user.role === "guest") {
//       navigate("/");
//       return;
//     }
//     fetchReadingList();
//   }, [user]);

  const handleToggleComplete = async (postId) => {
    try {
      setActionLoading(postId);
      await api.patch(`/auth/me/reading-list/${postId}/complete`);
      await fetchReadingList();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (postId) => {
    if (!confirm("Hapus guide ini dari Reading List?")) return;
    try {
      setActionLoading(postId);
      await api.delete(`/auth/me/reading-list/${postId}`);
      await fetchReadingList();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Move dengan panah
  const handleMove = async (postId, direction) => {
    const currentIndex = list.findIndex(
      (item) => String(item.post._id) === String(postId)
    );
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= list.length) return;

    const newList = arrayMove(list, currentIndex, newIndex);
    setList(newList); // optimistic

    const orderedPostIds = newList.map((item) => item.post._id);
    try {
      setActionLoading(postId);
      await api.put("/auth/me/reading-list", { orderedPostIds });
    } catch (err) {
      console.error(err);
      fetchReadingList(); // rollback
    } finally {
      setActionLoading(null);
    }
  };

  // Drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = list.findIndex((item) => item.post._id === active.id);
    const newIndex = list.findIndex((item) => item.post._id === over.id);

    const newList = arrayMove(list, oldIndex, newIndex);
    setList(newList);

    const orderedPostIds = newList.map((item) => item.post._id);
    try {
      await api.put("/auth/me/reading-list", { orderedPostIds });
    } catch (err) {
      console.error("Gagal menyimpan urutan:", err);
      fetchReadingList();
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-accent">
          <span className="text-xs font-semibold uppercase tracking-wider">Library</span>
        </div>
        <h1 className="text-xl font-medium tracking-tight">Reading List</h1>
      </div>

      {/* Progress Card */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Target size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Learning Progress</p>
              <p className="text-md font-bold">
                {stats.completed} / {stats.total}{" "}
              </p>
            </div>
          </div>

          <div className="w-max flex justify-end items-center gap-2 sm:w-64">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.progress}%</span>
            </div>
            <div className="h-2.5 w-[150px] overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-white/15">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
            <BookOpen size={28} className="text-gray-400" />
            </div>

            {isGuest ? (
                <>
                    <h3 className="text-lg font-semibold">Login to use Reading List</h3>
                    <p className="mt-2 max-w-sm text-sm text-gray-500">
                    Create your personal reading list, arrange the order, and track your progress.
                    </p>
                    <button
                    onClick={() => navigate("/login")}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                    >
                    Login now
                    </button>
                </>
                ) : (
                <>
                    <h3 className="text-lg font-semibold">No guides in your Reading List yet</h3>
                    <p className="mt-2 max-w-sm text-sm text-gray-500">
                    Add guides from the Dashboard using the “Add” button.
                    </p>
                    <Link
                    to="/"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                    >
                    Explore Guides
                    <ArrowRight size={16} />
                    </Link>
                </>
                )}
        </div>
        ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={list.map((item) => item.post._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {list.map((item, index) => (
                <SortableItem
                  key={item.post._id}
                  item={item}
                  index={index}
                  total={list.length}
                  onToggleComplete={handleToggleComplete}
                  onRemove={handleRemove}
                  onMove={handleMove}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Tips */}
      {list.length > 0 && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-gray-600 dark:text-gray-300">
            <strong>Tips:</strong> Kamu bisa seret icon{" "}
            <GripVertical size={14} className="inline relative top-[-1.6px]" /> atau pakai tombol panah
            untuk mengatur urutan.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReadingListPage;