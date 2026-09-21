import { useState } from "react";
import { usePost } from "../hooks/usePosts";
import Modal from "./Modal";

interface DeletePostModalProps {
  postId: string;
  onClose: () => void;
}

export default function DeletePostModal({
  postId,
  onClose,
}: DeletePostModalProps) {
  const { deletePost } = usePost();
  const [loading, setLoading] = useState(false);

  const handleOnDelete = async () => {
    setLoading(true);
    try {
      await deletePost(postId);
      onClose();
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Delete post" onClose={onClose}>
      <p className="text-sm text-body mb-4">
        This post will be permanently deleted. This action cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          disabled={loading}
          className="text-sm font-medium text-body bg-surface-muted hover:bg-surface-muted/70 px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleOnDelete}
          disabled={loading}
          className="text-sm font-semibold text-inverted bg-danger hover:bg-danger-dark px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Delete post"}
        </button>
      </div>
    </Modal>
  );
}
