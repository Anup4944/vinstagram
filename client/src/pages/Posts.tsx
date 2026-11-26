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
    <div className="bg-surface-muted min-h-screen">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,36rem)_20rem] lg:justify-center lg:gap-8 lg:py-8">
        {/* Search appears FIRST on mobile, on the SIDE on desktop */}
        <aside className="lg:order-2">
          <div className="lg:sticky lg:top-28">
            <Search />
          </div>
        </aside>

        <section className="flex flex-col gap-6 lg:order-1">
          <NewPostForm />

          {loading && posts.length === 0 ? (
            <p className="text-center text-sm text-muted py-8">
              Loading feed...
            </p>
          ) : posts.length === 0 ? (
            <div className="bg-surface border border-surface-muted rounded-xl py-12 px-6 text-center">
              <p className="text-sm font-medium text-body">No posts yet</p>
              <p className="text-sm text-muted mt-1">
                Follow some users to see their posts here.
              </p>
            </div>
          ) : (
            posts.map((post) => <Post key={post.id} post={post} />)
          )}
        </section>
      </div>
    </div>
  );
};

export default Posts;
