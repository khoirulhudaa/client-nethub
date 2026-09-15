import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, PlusCircle } from "lucide-react";
import api from "../api/axios.js";
import PostCard from "../components/Post/PostCard.jsx";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/posts/mine")
      .then(({ data }) => setPosts(data.posts))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Guides</h1>
          <p className="mt-1 text-sm text-gray-500">Everything you've published on NetHub.</p>
        </div>
        <Link to="/create" className="btn-primary">
          <PlusCircle size={16} />
          New Guide
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : posts.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="font-medium">You haven't published anything yet</p>
          <p className="text-sm text-gray-500">Share your first fix, install guide, or topology diagram.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
