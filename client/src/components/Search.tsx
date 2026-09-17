import { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";
import { usePost } from "../hooks/usePosts";
import { Link } from "react-router-dom";

export default function SearchUsers() {
  const [query, setQuery] = useState("");
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);

  const { users, fetchAllUsers, toggleFollow } = useUser();
  const { user: currentUser } = useAuth();
  const { fetchFeedPosts, removePostsByUserId } = usePost();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleOnToggleFollow = async (userId: string) => {
    setFollowLoadingId(userId);
    try {
      const result = await toggleFollow(userId);
      if (!result.isFollowing) {
        removePostsByUserId(userId);
      } else {
        await fetchFeedPosts();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFollowLoadingId(null);
    }
  };

  const filteredUsers = users
    .filter((u) => u.id !== currentUser?.id)
    .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="bg-surface border border-surface-muted rounded-lg p-4 sticky top-4">
      <h2 className="text-sm font-semibold text-body mb-3">Search</h2>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-surface-muted rounded-md outline-none text-body placeholder:text-muted focus:ring-2 focus:ring-brand"
        />
      </div>

      <div className="flex flex-col gap-1">
        {filteredUsers.length === 0 ? (
          <p className="text-sm text-muted py-2">No users found</p>
        ) : (
          filteredUsers.map((user) => {
            const isFollowing = user.isFollowing; // ✅ from the User object itself, not mock state
            const isLoading = followLoadingId === user.id;

            return (
              <div
                key={user.id}
                className="flex items-start gap-3 px-2 py-2.5 rounded-md hover:bg-surface-muted transition-colors"
              >
                {user.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-inverted text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <Link to={`/profile/${user.id}`} className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-body truncate hover:underline">
                    {user.name}
                  </p>
                  <p className="text-xs text-body mt-0.5 truncate">
                    {user.bio}
                  </p>
                </Link>
                <button
                  onClick={() => handleOnToggleFollow(user.id)}
                  disabled={isLoading}
                  className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 ${
                    isFollowing
                      ? "bg-surface-muted text-body hover:bg-danger hover:text-inverted"
                      : "bg-brand text-inverted hover:bg-brand-dark"
                  }`}
                >
                  {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
