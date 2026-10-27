import { Quote, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

// --- Quote modal -------------------------------------------------------------
const QUOTE_SEEN_KEY = "nethub_quote_seen";

const QUOTES = [
  { text: "Tuntutlah ilmu sejak dari buaian sampai ke liang lahat.", author: "Pepatah" },
  { text: "Ilmu itu bukan yang dihafal, tetapi yang memberi manfaat.", author: "Imam Asy-Syafi'i" },
  { text: "Ilmu lebih baik daripada harta, karena ilmu menjagamu sedangkan harta harus kamu jaga.", author: "Ali bin Abi Thalib" },
  { text: "Belajarlah seolah kamu akan hidup selamanya.", author: "Mahatma Gandhi" },
  { text: "Menanamkan modal pada ilmu pengetahuan selalu memberi bunga terbaik.", author: "Benjamin Franklin" },
  { text: "Belajar tanpa berpikir itu sia-sia, berpikir tanpa belajar itu berbahaya.", author: "Confucius" },
  { text: "Akar dari belajar itu pahit, tetapi buahnya manis.", author: "Aristoteles" },
  { text: "Satu-satunya kebaikan sejati adalah pengetahuan, dan satu-satunya keburukan adalah kebodohan.", author: "Socrates" },
];

const QuoteModal = ({ onClose }) => {
  // pilih quote acak sekali saat modal dibuat
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // tutup dengan Esc + kunci scroll halaman saat modal terbuka
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quote menuntut ilmu"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-6 md:p-8 shadow-xl"
      >
        {/* <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-300 dark:hover:bg-white/10 transition"
        >
          <X size={18} />
        </button> */}

        <div className="mb-4 flex h-[40px] w-[42.5px] items-center justify-center rounded-xl bg-blue-600 text-white">
          <Quote size={18} />
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-blue-500">
          Semangat belajar
        </p>
        <blockquote className="mt-2 text-lg md:text-xl font-semibold leading-snug text-slate-900 dark:text-white">
          “{quote.text}”
        </blockquote>
        <p className="mt-3 text-sm text-slate-500 dark:text-gray-400">— {quote.author}</p>

        <button
          onClick={onClose}
          className="mt-6 w-full active:scale-[0.99] duration-100 rounded-lg bg-slate-900 dark:bg-gradient-to-br dark:from-blue-400 dark:to-blue-100 px-4 py-2 text-sm font-medium text-white dark:text-slate-900 transition hover:opacity-90"
        >
          Mulai belajar
        </button>
      </div>
    </div>
  );
};

// --- Layout ------------------------------------------------------------------
const AppLayout = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Kalau logout / belum login, pastikan drawer mobile tertutup
  useEffect(() => {
    if (!user) setMobileOpen(false);
  }, [user]);

  // Tampil hanya jika belum pernah tampil di sesi login ini
  const [showQuote, setShowQuote] = useState(() => {
    try {
      return localStorage.getItem(QUOTE_SEEN_KEY) !== "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    // Tandai sudah tampil (refresh tidak memunculkan lagi)
    try {
      localStorage.setItem(QUOTE_SEEN_KEY, "true");
    } catch {}

    // Saat AppLayout di-unmount (logout -> /login), reset supaya login berikutnya tampil lagi
    return () => {
      try {
        localStorage.removeItem(QUOTE_SEEN_KEY);
      } catch {}
    };
  }, []);

  return (
    <div className="relative flex h-screen overflow-hidden bg-surface-light text-[#1D1D1F] dark:bg-surface-dark dark:text-[#F5F5F7]">
      {showQuote && <QuoteModal onClose={() => setShowQuote(false)} />}

      {/* Desktop sidebar: hanya kalau login */}
      {user && (
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      )}


      {/* Mobile sidebar drawer */}
      {user && mobileOpen && (
        <div className="fixed inset-0 z-[99999] lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 animate-fade-in">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}


      <img src="/hero.jpg" alt="wallpaper-sidebar" className="absolute top-0 left-[0px] w-screen h-screen rotate-[0deg] scale-[2] dark:flex hidden object-cover brightness-[20%]" />
      <img src="/hero.jpg" alt="wallpaper-sidebar" className="absolute top-0 left-[0px] w-screen h-screen rotate-[150deg] scale-[4] dark:hidden flex object-cover brightness-[40%]" />
      <div className="relative z-[9] flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto border- pr z-[99] px-4 py-4 md:py-0 md:pl-4 lg:pl-0 md:pr-[1px] rounded-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;