// Konstanta & helper bersama untuk Tasks.jsx dan TaskForm.jsx

export const PRIORITIES = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
  { value: "urgent", label: "Mendesak" },
];

export const PRIORITY_STYLE = {
  low: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  medium: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  high: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
  urgent: "bg-red-500/15 text-red-600 dark:text-red-300",
};

export const STATUSES = [
  { value: "todo", label: "Belum mulai" },
  { value: "in_progress", label: "Dikerjakan" },
  { value: "done", label: "Selesai" },
];

export const REPEATS = [
  { value: "none", label: "Tidak berulang" },
  { value: "daily", label: "Setiap hari" },
  { value: "weekly", label: "Setiap minggu" },
  { value: "monthly", label: "Setiap bulan" },
];

const pad = (n) => String(n).padStart(2, "0");

// Date → "YYYY-MM-DD" (waktu lokal) untuk <input type="date">
export const toInputDate = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};

// "YYYY-MM-DD" → ISO (tengah malam lokal)
export const fromInputDate = (v) => (v ? new Date(`${v}T00:00:00`).toISOString() : null);

export const formatShort = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// "overdue" | "today" | "upcoming" | null
export const dueState = (task) => {
  if (!task.dueDate || task.status === "done") return null;
  const due = new Date(task.dueDate);
  const start = startOfToday();
  const end = new Date(start.getTime() + 86400000);
  if (due < start) return "overdue";
  if (due < end) return "today";
  return "upcoming";
};

export const PriorityBadge = ({ priority }) => {
  const p = PRIORITIES.find((x) => x.value === priority);
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLE[priority] || PRIORITY_STYLE.medium}`}>
      {p?.label || priority}
    </span>
  );
};