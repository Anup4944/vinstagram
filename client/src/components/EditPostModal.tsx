import { useState } from "react";
import Modal from "./Modal";
import LikesModal from "./LikesModal";
import type { Post, PostComment } from "../types";
import { usePost } from "../hooks/usePosts";
import { useAuth } from "../hooks/useAuth";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSave: (updatedPost: Post) => void;
  onCommentDeleted?: (postId: string, commentId: string) => void;
  onCommentUpdated?: (postId: string, comment: PostComment) => void;
  onCommentAdded?: (postId: string, comment: PostComment) => void;
}

export default function EditPostModal({
  post,
  onClose,
  onSave,
  onCommentDeleted,
  onCommentUpdated,
  onCommentAdded,
}: EditPostModalProps) {
  const [caption, setCaption] = useState(post.caption);
  const [imagePreview, setImagePreview] = useState(post?.image?.url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [showLikes, setShowLikes] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [saving, setSaving] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { updatePost, addComment, deleteComment, updateComment } =
    usePost();
  const { user: currentUser } = useAuth();

  const isPostOwner = post.owner.id === currentUser?.id;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving || !caption.trim()) return;

    const original = post;
    const payload = {
      id: post.id,
      caption: caption.trim(),
      image: imageFile ? imagePreview : undefined, // only send if a new file was chosen
    };

    // Caption-only edits are optimistic: show the change and close right away.
    // A new image has to upload first, so that path waits with the button disabled.
    if (!imageFile) {
      onSave({ ...original, caption: payload.caption });
      onClose();
      try {
        const updated = await updatePost(payload);
        onSave({ ...original, ...updated });
      } catch {
        onSave(original); // roll back; provider already showed the error toast
      }
      return;
    }

    setSaving(true);
    try {
      const updated = await updatePost(payload);
      onSave({ ...original, ...updated });
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      const newComment = await addComment(post.id, text);
      onCommentAdded?.(post.id, newComment);
      setCommentText("");
    } catch (error) {
      console.log(error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (deletingId) return;
    setDeletingId(commentId);
    try {
      await deleteComment(post.id, commentId);
      onCommentDeleted?.(post.id, commentId);
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingId(null);
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
    if (!editText.trim() || editSaving) return;
    setEditSaving(true);
    try {
      const updated = await updateComment(commentId, editText.trim());
      onCommentUpdated?.(post.id, updated);
      setEditingId(null);
      setEditText("");
    } catch {
      // toast already fired
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <Modal title="Edit post" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label
            htmlFor="postImageFile"
            className="relative cursor-pointer group block"
          >
            <div className="rounded-md overflow-hidden bg-surface-muted aspect-square w-full">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="absolute inset-0 rounded-md bg-surface-dark/0 group-hover:bg-surface-dark/50 flex items-center justify-center transition-colors">
              <span className="text-xs font-medium text-inverted opacity-0 group-hover:opacity-100 transition-opacity">
                Click to change image
              </span>
            </div>
          </label>
          <input
            id="postImageFile"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={saving}
            className="hidden"
          />

          <div>
            <label className="block text-xs font-medium text-muted mb-1">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              disabled={saving}
              className="w-full px-3 py-2 text-sm bg-surface-muted rounded-md outline-none text-body focus:ring-2 focus:ring-brand resize-none disabled:opacity-60"
            />
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-sm font-medium text-body bg-surface-muted hover:bg-surface-muted/70 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !caption.trim()}
              aria-busy={saving}
              className="text-sm font-semibold text-inverted bg-brand hover:bg-brand-dark px-4 py-2 rounded-md transition-colors disabled:bg-surface-muted disabled:text-muted disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

        {/* Likes */}
        <div className="border-t border-surface-muted pt-3">
          <button
            onClick={() => setShowLikes(true)}
            className="text-sm font-semibold text-body hover:underline mb-2"
          >
            {post.likes?.length ?? 0}{" "}
            {post.likes?.length === 1 ? "like" : "likes"}
          </button>

          {showLikes && (
            <LikesModal
              postId={post.id}
              onClose={() => setShowLikes(false)}
            />
          )}
        </div>

        {/* Comments */}
        <div className="border-t border-surface-muted pt-3">
          <h3 className="text-xs font-medium text-muted mb-2">
            Comments ({post?.comments?.length})
          </h3>

          {post.comments?.length === 0 ? (
            <p className="text-sm text-muted">No comments yet.</p>
          ) : (
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {post.comments?.map((comment) => {
                const isCommentAuthor = comment.user.id === currentUser?.id;
                const canDelete = isCommentAuthor || isPostOwner;

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
                          disabled={editSaving}
                          className="w-full px-2 py-1.5 text-sm bg-surface-muted rounded-md outline-none text-body focus:ring-2 focus:ring-brand disabled:opacity-60"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(comment.id)}
                            disabled={editSaving || !editText.trim()}
                            className="text-xs font-semibold text-inverted bg-brand hover:bg-brand-dark px-3 py-1 rounded-md transition-colors disabled:bg-surface-muted disabled:text-muted disabled:cursor-not-allowed"
                          >
                            {editSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={editSaving}
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
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {isCommentAuthor && (
                            <button
                              onClick={() => startEdit(comment)}
                              className="text-xs font-medium text-muted hover:text-brand transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
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
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <form
            onSubmit={handleAddComment}
            className="flex items-center gap-2 border-t border-surface-muted pt-3 mt-2"
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
    </Modal>
  );
}
