import { useState } from "react";
import Modal from "./Modal";
import { useAuth } from "../hooks/useAuth";
import type { Post, PostComment } from "../types";

interface CommentsModalProps {
  post: Post;
  onClose: () => void;
  onUpdateComment: (commentId: string, newText: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export default function CommentsModal({
  post,
  onClose,
  onUpdateComment,
  onDeleteComment,
}: CommentsModalProps) {
  const { user: currentUser } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const startEdit = (comment: PostComment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = (commentId: string) => {
    if (!editText.trim()) return;
    onUpdateComment(commentId, editText.trim());
    setEditingId(null);
    setEditText("");
  };

  return (
    <Modal title="Comments" onClose={onClose}>
      {post.comments.length === 0 ? (
        <p className="text-sm text-muted py-2">No comments yet.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {post.comments.map((comment) => {
            const isOwn = comment.user.id === currentUser?.id;

            return (
              <div
                key={comment.id}
                className="flex items-start justify-between gap-2 px-2 py-2 rounded-md hover:bg-surface-muted transition-colors"
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
                        {comment.user.name}{" "}
                        {/* ✅ .name, not the whole object */}
                      </span>
                      {comment.text} {/* ✅ uncommented */}
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
                          onClick={() => onDeleteComment(comment.id)}
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
          })}
        </div>
      )}
    </Modal>
  );
}
