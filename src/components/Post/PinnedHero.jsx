import { Pin } from "lucide-react";
import PostCard from "./PostCard.jsx";

// Layout:
// - Kiri (lebih lebar / col-span-2): 2 card
// - Kanan: 2 card (stack)
// Maksimal 4 pinned
const PinnedHero = ({ pinned }) => {
  if (!pinned?.length) return null;

  const items = pinned.slice(0, 4); // max 4
  const leftCards = items.slice(0, 2);
  const rightCards = items.slice(2, 4);

  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
        <Pin size={17} />
        <span className="relative top-[-2px] ml-1">
          Your pinned
        </span>
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Kiri — lebih lebar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:col-span-2">
          {leftCards.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {/* Kanan — stack 2 card */}
        {rightCards.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {rightCards.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PinnedHero;