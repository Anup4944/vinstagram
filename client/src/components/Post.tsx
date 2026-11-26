import { useState } from "react";
import { usePost } from "../hooks/usePosts";
import { useAuth } from "../hooks/useAuth";
import type { PostComment, Post as PostType } from "../types";
import LikesModal from "./LikesModal";
import formatDate from "../helper/formateDate";

export default function Post({ post }: { post: PostType }) {
  const [commentText, setCommentText] = useState("");
  const [showLikes, setShowLikes] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const { addComment, toggleLike, updateComment, deleteComment } =
    usePost();
  const { user: currentUser } = useAuth();

  const isLiked = post?.likes?.some((like) => like.userId === currentUser?.id);

  // Optimistic: the provider flips the heart instantly and rolls back on failure
  const handleToggleLike = async () => {
    try {
      await toggleLike(post.id);
    } catch {
      // error toast (if any) is shown by the provider
    }
  };
  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || commentSubmitting) return;

    setCommentSubmitting(true);
    try {
      await addComment(post.id, text);
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const visibleComments = showAllComments
    ? post?.comments
    : post?.comments?.slice(-1);

  const startEdit = (comment: PostComment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (commentId: string) => {
    if (!editText.trim() || editSaving) return;
    setEditSaving(true);
    try {
      await updateComment(commentId, editText.trim());
      setEditingId(null);
      setEditText("");
    } catch {
      // toast already fired inside updateComment
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (deletingId) return;
    setDeletingId(commentId);
    try {
      await deleteComment(post.id, commentId);
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="bg-surface border border-surface-muted rounded-xl shadow-sm overflow-hidden w-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-inverted text-sm font-semibold overflow-hidden">
            {post.owner.avatar?.url ? (
              <img
                src={post.owner.avatar.url}
                alt={post.owner.name}
                className="w-full h-full object-cover"
              />
            ) : (
              post.owner.name.charAt(0).toUpperCase()
            )}
          </span>
          <span className="text-sm font-semibold text-body">
            {post.owner.name}
          </span>
        </div>

        {/* Image */}
        {post.image?.url && (
          <img
            src={post.image.url}
            alt={post.caption}
            className="w-full aspect-square object-cover"
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 px-3 pt-3">
          <button
            onClick={handleToggleLike}
            aria-label={isLiked ? "Unlike" : "Like"}
            aria-pressed={isLiked}
            className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-90 ${
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

        {/* Like count */}
        <div className="relative inline-block px-3 pt-2">
          <button
            onClick={() => setShowLikes(true)}
            className="text-sm font-semibold text-body hover:underline"
          >
            {post?.likes?.length} {post?.likes?.length === 1 ? "like" : "likes"}
          </button>

          {showLikes && (
            <LikesModal
              postId={post.id}
              onClose={() => setShowLikes(false)}
            />
          )}
        </div>

        {/* Caption */}
        <p className="px-3 pt-1 text-sm text-body">
          <span className="font-semibold mr-1.5">{post.owner.name}</span>
          {post.caption}
        </p>

        {/* Comments */}
        <div className="px-3 pt-2">
          {post?.comments?.length > 1 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-sm text-muted hover:text-body mb-1"
            >
              View all {post?.comments?.length} comments
            </button>
          )}

          {visibleComments?.map((comment) => {
            const isOwn = comment.user.id === currentUser?.id;
            const isPostOwner = post.owner.id === currentUser?.id;
            const canDelete = isOwn || isPostOwner;

            return (
              <div key={comment.id} className="py-0.5">
                {editingId === comment.id ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      disabled={editSaving}
                      className="w-full px-2 py-1.5 text-sm bg-surface-muted rounded-md outline-none text-body focus:ring-2 focus:ring-brand disabled:opacity-60"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(comment.id)}
                        disabled={editSaving || !editText.trim()}
                        className="text-xs font-semibold text-brand hover:underline disabled:text-muted disabled:no-underline disabled:cursor-not-allowed"
                      >
                        {editSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={editSaving}
                        className="text-xs font-medium text-muted hover:text-body disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-body flex-1">
                      <span className="font-semibold mr-1.5">
                        {comment.user.name}
                      </span>
                      {comment.text}{" "}
                      <span className="text-xs text-muted">
                        {formatDate(comment.createdAt)}
                      </span>
                    </p>

                    {(isOwn || canDelete) && (
                      <div className="flex items-center gap-2 shrink-0">
                        {isOwn && (
                          <button
                            onClick={() => startEdit(comment)}
                            className="text-xs font-medium text-muted hover:text-brand transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingId !== null}
                            className="text-xs font-medium text-muted hover:text-danger transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === comment.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add comment */}
        <form
          onSubmit={handleAddComment}
          className="flex items-center gap-2 border-t border-surface-muted px-3 py-2 mt-2"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            disabled={commentSubmitting}
            className="flex-1 text-sm outline-none text-body placeholder:text-muted bg-transparent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || commentSubmitting}
            className="text-sm font-semibold text-brand disabled:text-muted disabled:cursor-not-allowed"
          >
            {commentSubmitting ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
