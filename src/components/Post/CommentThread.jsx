import { useState } from "react";
import { CornerDownRight, Trash2, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return "just now";
};

const CommentItem = ({ comment, onReply, onDelete, depth = 0 }) => {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");

  const submitReply = async () => {
    if (!text.trim()) return;
    await onReply(comment._id, text.trim());
    setText("");
    setReplying(false);
  };

  return (
    <div className={depth > 0 ? "ml-6 border-l border-border-light pl-4 dark:border-border-dark" : ""}>
      <div className="flex gap-3 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
          {comment.author?.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.author?.name}</span>
            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <button
              onClick={() => setReplying((r) => !r)}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-accent"
            >
              <CornerDownRight size={12} />
              Reply
            </button>
            {user?.id === comment.author?._id && (
              <button
                onClick={() => onDelete(comment._id)}
                className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500"
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
          </div>

          {replying && (
            <div className="mt-2 flex gap-2">
              <input
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitReply()}
                placeholder={`Reply to ${comment.author?.name}…`}
                className="input-field flex-1 py-1.5 text-sm"
              />
              <button onClick={submitReply} className="btn-primary px-3 py-1.5">
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem key={reply._id} comment={reply} onReply={onReply} onDelete={onDelete} depth={depth + 1} />
      ))}
    </div>
  );
};

const CommentThread = ({ comments, onReply, onDelete }) => {
  if (!comments?.length) {
    return <p className="py-6 text-center text-sm text-gray-400">Be the first to comment on this guide.</p>;
  }
  return (
    <div className="divide-y divide-border-light dark:divide-border-dark">
      {comments.map((c) => (
        <CommentItem key={c._id} comment={c} onReply={onReply} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default CommentThread;
