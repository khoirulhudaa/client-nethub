import { Pin } from "lucide-react";
import PostCard from "./PostCard.jsx";

// Layout (maksimal 4 pinned):
// - 1 pinned : 1 kartu lebar penuh
// - 2 pinned : kiri 1 kartu lebar, kanan 1 kartu kecil
// - 3-4      : kiri 2 kartu (lebar), kanan 1-2 kartu (kecil)
const PinnedHero = ({ slug, pinned, onPinChange }) => {
  if (!pinned?.length) return null;

  const items = pinned.slice(0, 4);

  // Kalau hanya 2, bagi 1 kiri + 1 kanan. Selain itu 2 kiri, sisanya kanan.
  const leftCount = items.length === 2 ? 1 : 2;
  const leftCards = items.slice(0, leftCount);
  const rightCards = items.slice(leftCount);

  const hasRight = rightCards.length > 0;

  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
        <Pin size={17} />
        <span className="relative top-[-2px] ml-1">Your pinned</span>
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Kiri: lebar. Kalau tidak ada kolom kanan (1 pinned), isi penuh */}
        <div
          className={`grid grid-cols-1 gap-4 ${
            hasRight ? "lg:col-span-2" : "lg:col-span-3"
          }`}
        >
          {leftCards.map((post) => (
            <PostCard post={post} onPinChange={onPinChange} />
          ))}
        </div>

        {/* Kanan: kecil */}
        {hasRight && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {rightCards.map((post) => (
              <PostCard post={post} onPinChange={onPinChange} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PinnedHero;