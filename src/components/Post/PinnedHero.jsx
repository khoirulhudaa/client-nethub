import { Pin } from "lucide-react";
import PostCard from "./PostCard.jsx";

const PinnedHero = ({ pinned, onPinChange }) => {
  if (!pinned?.length) return null;

  const items = pinned.slice(0, 3);

  return (
    <section className="mb-6 mt-4">
      <h2 className="mb-3 flex items-center text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
        <Pin size={17} />
        <span className="relative top-[-2px] ml-1">Your pinned</span>
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onPinChange={onPinChange}
            hideImage
          />
        ))}
      </div>
    </section>
  );
};

export default PinnedHero;