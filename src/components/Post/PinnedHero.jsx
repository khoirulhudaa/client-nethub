import PostCard from "./PostCard.jsx";

// Renders pinned posts as a hero grid — the main pin occupies the large left
// hero card, and up to two secondary pins stack on the right.
const PinnedHero = ({ pinned }) => {
  if (!pinned?.length) return null;

  const [main, ...rest] = pinned;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Pinned Guides</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PostCard post={main} featured />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {rest.slice(0, 2).map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PinnedHero;
