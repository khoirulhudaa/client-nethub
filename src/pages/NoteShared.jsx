// Konstanta bersama untuk Notes.jsx dan NoteForm.jsx

export const MOODS = [
  { value: "happy", emoji: "😊", label: "Senang" },
  { value: "excited", emoji: "🤩", label: "Semangat" },
  { value: "calm", emoji: "😌", label: "Tenang" },
  { value: "neutral", emoji: "😐", label: "Biasa" },
  { value: "tired", emoji: "😴", label: "Lelah" },
  { value: "sad", emoji: "😢", label: "Sedih" },
  { value: "angry", emoji: "😠", label: "Kesal" },
];

export const moodOf = (value) => MOODS.find((m) => m.value === value);

export const COLORS = ["default", "yellow", "green", "blue", "pink", "purple"];

// Latar kartu / area tulis
export const COLOR_BG = {
  default: "bg-slate-300 dark:!bg-[#0c0c18]",
  yellow: "bg-yellow-100 dark:!bg-yellow-500/15",
  green: "bg-green-100 dark:!bg-green-500/15",
  blue: "bg-sky-100 dark:!bg-sky-500/15",
  pink: "bg-pink-100 dark:!bg-pink-500/15",
  purple: "bg-purple-100 dark:!bg-purple-500/15",
};

// Titik pemilih warna
export const COLOR_DOT = {
  default: "bg-slate-400",
  yellow: "bg-yellow-300",
  green: "bg-green-300",
  blue: "bg-sky-300",
  pink: "bg-pink-300",
  purple: "bg-purple-300",
};

export const formatLong = (d) =>
  new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export const formatDay = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const pad = (n) => String(n).padStart(2, "0");

export const toInputDate = (d) => {
  const x = d ? new Date(d) : new Date();
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};

// Simpan di tengah hari agar tidak bergeser tanggal karena zona waktu
export const fromInputDate = (v) => new Date(`${v}T12:00:00`).toISOString();

export const toInputMonth = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;