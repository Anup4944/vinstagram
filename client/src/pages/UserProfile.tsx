import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";
import { usePost } from "../hooks/usePosts";
import PostThumbnail from "../components/PostThumnail";
import UserListModal from "../components/UserListModal";
import EditProfileModal from "../components/EditProfileModal";
import EditPostModal from "../components/EditPostModal";
import DeletePostModal from "../components/DeletePostModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import type { PostComment, Post, User } from "../types";
import PostDetailModal from "../components/PostDetailModal";

function formatJoinDate(isoDate?: string) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type ModalType =
  | "edit"
  | "change-password"
  | "delete"
  | "followers"
  | "following"
  | "editPost"
  | "deletePost"
  | "comments"
  | "post-details"
  | null;

const UserProfile = () => {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);

  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateUser } = useAuth();
  const { fetchUserById, toggleFollow } = useUser();
  const { getPostByUserId, removePostsByUserId } = usePost();

  const isOwnProfile = id === currentUser?.id;

  useEffect(() => {
    if (!id) return;

    const loadUserData = async () => {
      try {
        setLoading(true);
        const [fetchedUser, posts] = await Promise.all([
          fetchUserById(id),
          getPostByUserId(id),
        ]);
        setProfileUser(fetchedUser);
        setUserPosts(posts);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [id]);

  const handleToggleFollow = async () => {
    if (!profileUser) return;
    setFollowLoading(true);
    try {
      const result = await toggleFollow(profileUser.id);

      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: result.isFollowing,
              _count: {
                ...prev._count,
                followers: result.followerCount,
              },
            }
          : prev,
      );

      if (currentUser?._count) {
        updateUser({
          _count: {
            ...currentUser._count,
            following: result.isFollowing
              ? (currentUser._count.following ?? 0) + 1
              : Math.max((currentUser._count.following ?? 0) - 1, 0),
          },
        });
      }

      if (!result.isFollowing) {
        removePostsByUserId(profileUser.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = (updated: User) => {
    setProfileUser((prev) => (prev ? { ...prev, ...updated } : updated));
    updateUser(updated); // ✅ keep AuthContext's currentUser in sync too, since this IS your own profile
    setActiveModal(null);
  };

  const openPostDetails = (post: Post) => {
    setActivePost(post);
    setActiveModal("post-details");
  };

  const openEditPost = (post: Post) => {
    setActivePost(post);
    setActiveModal("editPost");
  };

  const openDeletePost = (post: Post) => {
    setActivePost(post);
    setActiveModal("deletePost");
  };

  const handleSavePost = (updatedPost: Post) => {
    setUserPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
    );
    setActiveModal(null);
  };

  const handleConfirmDeletePost = () => {
    if (!activePost) return;
    setUserPosts((prev) => prev.filter((p) => p.id !== activePost.id));
    setActiveModal(null);
    setActivePost(null);
  };

  const openComments = (post: Post) => {
    setActivePost(post);
    setActiveModal("comments");
  };

  const handleLikeToggled = (
    postId: string,
    likes: { id: string; userId: string }[],
  ) => {
    setUserPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes } : p)),
    );
    setActivePost((prev) =>
      prev && prev.id === postId ? { ...prev, likes } : prev,
    );
  };

  const handleCommentUpdated = (postId: string, comment: PostComment) => {
    setUserPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === comment.id ? comment : c,
              ),
            }
          : p,
      ),
    );
    setActivePost((prev) =>
      prev && prev.id === postId
        ? {
            ...prev,
            comments: prev.comments.map((c) =>
              c.id === comment.id ? comment : c,
            ),
          }
        : prev,
    );
  };

  const handleCommentDeleted = (postId: string, commentId: string) => {
    setUserPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
          : p,
      ),
    );
    setActivePost((prev) =>
      prev && prev.id === postId
        ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) }
        : prev,
    );
  };
  const handleCommentAdded = (postId: string, comment: PostComment) => {
    setUserPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, comment] } : p,
      ),
    );
    setActivePost((prev) =>
      prev && prev.id === postId
        ? { ...prev, comments: [...prev.comments, comment] }
        : prev,
    );
  };
  if (!currentUser) {
    return <div className="text-center py-8">Not logged in.</div>;
  }

  if (loading) {
    return (
      <div className="bg-surface-muted min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-surface-muted border-t-brand rounded-full animate-spin" />
          <p className="text-sm text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return <div className="text-center py-8">User not found.</div>;
  }

  return (
    <div className="bg-surface-muted min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile card */}
        <div className="bg-surface border border-surface-muted rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {profileUser.avatar?.url ? (
              <img
                src={profileUser.avatar.url}
                alt={profileUser.name}
                className="w-20 h-20 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand text-inverted flex items-center justify-center text-2xl font-bold shrink-0">
                {profileUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-body">
                {profileUser.name}
              </h1>
              <p className="text-sm text-muted">{profileUser.email}</p>
              <p className="text-sm text-body mt-1">{profileUser.bio}</p>
              {profileUser.createdAt && (
                <p className="text-xs text-muted mt-2">
                  Joined {formatJoinDate(profileUser.createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Followers / following */}
          <div className="flex gap-6 mt-5 pt-5 border-t border-surface-muted">
            <button
              onClick={() => setActiveModal("followers")}
              className="text-left hover:opacity-70 transition-opacity"
            >
              <span className="block text-sm font-semibold text-body">
                {profileUser._count?.followers ?? 0}
              </span>
              <span className="block text-xs text-muted">Followers</span>
            </button>
            <button
              onClick={() => setActiveModal("following")}
              className="text-left hover:opacity-70 transition-opacity"
            >
              <span className="block text-sm font-semibold text-body">
                {profileUser._count?.following ?? 0}
              </span>
              <span className="block text-xs text-muted">Following</span>
            </button>
          </div>

          {/* Actions — different depending on whose profile this is */}
          <div className="flex gap-3 mt-5">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setActiveModal("edit")}
                  className="text-sm font-semibold text-inverted bg-brand hover:bg-brand-dark px-4 py-2 rounded-md transition-colors"
                >
                  Edit profile
                </button>
                <button
                  onClick={() => setActiveModal("change-password")}
                  className="text-sm font-semibold text-inverted bg-brand hover:bg-brand-dark px-4 py-2 rounded-md transition-colors"
                >
                  Change password
                </button>
                <button
                  onClick={() => setActiveModal("delete")}
                  className="text-sm font-semibold text-danger bg-surface-muted hover:bg-danger hover:text-inverted px-4 py-2 rounded-md transition-colors"
                >
                  Delete account
                </button>
              </>
            ) : (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`text-sm font-semibold px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${
                  profileUser.isFollowing
                    ? "bg-surface-muted text-body hover:bg-danger hover:text-inverted"
                    : "bg-brand text-inverted hover:bg-brand-dark"
                }`}
              >
                {followLoading
                  ? "..."
                  : profileUser.isFollowing
                    ? "Following"
                    : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Posts grid */}
        <div className="bg-surface border border-surface-muted rounded-lg p-6">
          <h2 className="text-sm font-semibold text-body mb-4">
            {isOwnProfile ? "Your Posts" : `${profileUser.name}'s Posts`}
          </h2>
          {userPosts.length === 0 ? (
            <p className="text-sm text-muted">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {userPosts.map((post) => (
                <PostThumbnail
                  key={post.id}
                  post={post}
                  onEdit={
                    isOwnProfile
                      ? () => openEditPost(post)
                      : () => openPostDetails(post)
                  }
                  onDelete={
                    isOwnProfile ? () => openDeletePost(post) : undefined
                  }
                  onOpenComments={() => openComments(post)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal === "edit" && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveProfile}
        />
      )}
      {activeModal === "change-password" && (
        <ChangePasswordModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "delete" && (
        <DeleteAccountModal
          userId={profileUser.id}
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "followers" && (
        <UserListModal
          title="Followers"
          userId={profileUser.id}
          type="followers"
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "following" && (
        <UserListModal
          title="Following"
          userId={profileUser.id}
          type="following"
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "post-details" && activePost && (
        <PostDetailModal
          post={activePost}
          onClose={() => setActiveModal(null)}
          onLikeToggled={handleLikeToggled}
          onCommentDeleted={handleCommentDeleted}
          onCommentUpdated={handleCommentUpdated}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {activeModal === "editPost" && activePost && (
        <EditPostModal
          post={activePost}
          onClose={() => setActiveModal(null)}
          onSave={handleSavePost}
          onCommentDeleted={handleCommentDeleted}
          onCommentUpdated={handleCommentUpdated}
          onCommentAdded={handleCommentAdded}
        />
      )}
      {activeModal === "deletePost" && activePost && (
        <DeletePostModal
          postId={activePost.id}
          onClose={() => setActiveModal(null)}
          onConfirm={handleConfirmDeletePost}
        />
      )}
    </div>
  );
};

export default UserProfile;
