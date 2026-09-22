import { FileText, Loader2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="mx-auto max-w-7xl px-0 py-0 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
         <div className="flex text-left items-center gap-2 text-accent">
            <span className="text-xs font-semibold uppercase tracking-wide">Creation</span>
          </div>
          <h1 className="text-xl text-left font-semibold tracking-tight">My Guides</h1>
        </div>
        <Link to="/create" className="btn-primary">
          <PlusCircle size={16} />
          New Guide
        </Link>
      </div>

      {loading ? (
        <div className="">
            <div className="flex surface-card justify-center flex-col h-full items-center text-center py-20">
              <img src="/cloud.png" alt="icon-cloud" className="w-20" />
              <p className="mt-2">Load content ...</p>
            </div>
          </div>
      ) : posts.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="font-medium">You haven't published anything yet</p>
          <p className="text-sm text-gray-500">Share your first fix, install guide, or topology diagram.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 p-2.5 md:px-4 w-full md:py-4 relative bg-white/5 rounded-3xl">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
