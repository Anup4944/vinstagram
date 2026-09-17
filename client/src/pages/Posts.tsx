import Search from "../components/Search";
import NewPostForm from "../components/NewPostForm";
import { usePost } from "../hooks/usePosts";
import { useEffect } from "react";
import Post from "../components/Post";

const Posts = () => {
  const { posts, loading, fetchFeedPosts } = usePost();

  useEffect(() => {
    fetchFeedPosts();
  }, []);
  return (
    <div className="flex flex-col lg:flex-row mx-auto bg-surface-muted min-h-screen py-8 px-4 gap-6 ">
      {/* Search appears FIRST on mobile, on the SIDE on desktop */}
      <div className="w-full lg:w-[40%] lg:order-2 rounded-lg p-4">
        <Search />
      </div>

      <div className="w-full lg:w-[60%] lg:order-1 rounded-lg p-4 ">
        <NewPostForm />

        {loading ? (
          <p className="text-center text-sm text-muted py-8">Loading feed...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-sm text-muted py-8">
            No posts yet — follow some users to see their posts here!
          </p>
        ) : (
          posts.map((post) => <Post key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Posts;
