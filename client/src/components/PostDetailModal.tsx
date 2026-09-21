import { useState } from "react";
import { usePost } from "../hooks/usePosts";
import { useAuth } from "../hooks/useAuth";
import Modal from "./Modal";
import type { Post, PostOwner, PostComment } from "../types";
import formatDate from "../helper/formateDate";

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onLikeToggled?: (
    postId: string,
    likes: { id: string; userId: string }[],
  ) => void;
  onCommentDeleted?: (postId: string, commentId: string) => void;
  onCommentUpdated?: (postId: string, comment: PostComment) => void;
  onCommentAdded?: (postId: string, comment: PostComment) => void;
}

export default function PostDetailModal({
  post,
  onClose,
  onLikeToggled,
  onCommentDeleted,
  onCommentUpdated,
  onCommentAdded,
}: PostDetailModalProps) {
  const [commentText, setCommentText] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [likers, setLikers] = useState<PostOwner[]>([]);
  const [showLikers, setShowLikers] = useState(false);
  const [likersLoading, setLikersLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { addComment, toggleLike, getPostLikes, deleteComment, updateComment } =
    usePost();
  const { user: currentUser } = useAuth();

  const isLiked = post.likes.some((like) => like.userId === currentUser?.id);

  const handleToggleLike = async () => {
    setLikeLoading(true);
    try {
      const result = await toggleLike(post.id);
      onLikeToggled?.(post.id, result.likes);
      setLikers([]);
    } catch (error) {
      console.log(error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShowLikers = async () => {
    setShowLikers((prev) => !prev);
    if (likers.length > 0) return;
    setLikersLoading(true);
    try {
      const data = await getPostLikes(post.id);
      setLikers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLikersLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    try {
      const newComment = await addComment(post.id, text);
      onCommentAdded?.(post.id, newComment);
      setCommentText("");
    } catch (error) {
      console.log(error);
    }
  };

  const startEdit = (comment: PostComment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      const updated = await updateComment(commentId, editText.trim());
      onCommentUpdated?.(post.id, updated); // ✅ if you added the callback from the last message
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(post.id, commentId);
      onCommentDeleted?.(post.id, commentId);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal title="Post" onClose={onClose}>
      <div className="max-w-md mx-auto">
        {post.image?.url && (
          <img
            src={post.image.url}
            alt={post.caption}
            className="w-full aspect-square object-cover rounded-md mb-3"
          />
        )}

        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={handleToggleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              isLiked ? "text-danger" : "text-muted hover:text-body"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={isLiked ? 0 : 1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>

        <button
          onClick={handleShowLikers}
          className="text-sm font-semibold text-body hover:underline mb-2"
        >
          {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
        </button>

        {showLikers && (
          <div className="mb-3 border border-surface-muted rounded-md p-2 max-h-40 overflow-y-auto">
            {likersLoading ? (
              <p className="text-xs text-muted">Loading...</p>
            ) : likers.length === 0 ? (
              <p className="text-xs text-muted">No likes yet.</p>
            ) : (
              likers.map((liker) => (
                <div key={liker.id} className="flex items-center gap-2 py-1">
                  {liker.avatar?.url ? (
                    <img
                      src={liker.avatar.url}
                      alt={liker.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-inverted text-xs font-semibold">
                      {liker.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm text-body">{liker.name}</span>
                </div>
              ))
            )}
          </div>
        )}

        <p className="text-sm text-body mb-3">
          <span className="font-semibold mr-1.5">{post.owner.name}</span>
          {post.caption}
        </p>

        <div className="border-t border-surface-muted pt-3 mb-3 max-h-48 overflow-y-auto">
          {post.comments.length === 0 ? (
            <p className="text-sm text-muted">No comments yet.</p>
          ) : (
            post.comments.map((comment) => {
              const isOwn = comment.user.id === currentUser?.id;
              return (
                <div
                  key={comment.id}
                  className="flex items-start justify-between gap-2 py-1.5"
                >
                  {editingId === comment.id ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                        className="w-full px-2 py-1.5 text-sm bg-surface-muted rounded-md outline-none text-body focus:ring-2 focus:ring-brand"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(comment.id)}
                          className="text-xs font-semibold text-inverted bg-brand hover:bg-brand-dark px-3 py-1 rounded-md transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-xs font-medium text-body bg-surface-muted hover:bg-surface-muted/70 px-3 py-1 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-body flex-1">
                        <span className="font-semibold mr-1.5">
                          {comment.user.name}
                        </span>
                        {comment.text}
                        <span className="text-xs text-muted ml-2">
                          {formatDate(comment.createdAt)}
                        </span>
                      </p>
                      {isOwn && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => startEdit(comment)}
                            className="text-xs font-medium text-muted hover:text-brand transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs font-medium text-muted hover:text-danger transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={handleAddComment}
          className="flex items-center gap-2 border-t border-surface-muted pt-3"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm outline-none text-body placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="text-sm font-semibold text-brand disabled:text-muted disabled:cursor-not-allowed"
          >
            Post
          </button>
        </form>
      </div>
    </Modal>
  );
}
