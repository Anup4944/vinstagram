import { usePost } from "../hooks/usePosts";
import Modal from "./Modal";

export default function DeletePostModal({ onClose, onConfirm }) {
  const { deletePost } = usePost();

  const handleOnDelete = async () => {
    await deletePost();
    onClose();
  };
  return (
    <Modal title="Delete post" onClose={onClose}>
      <p className="text-sm text-body mb-4">
        This post will be permanently deleted. This action cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="text-sm font-medium text-body bg-surface-muted hover:bg-surface-muted/70 px-4 py-2 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleOnDelete}
          className="text-sm font-semibold text-inverted bg-danger hover:bg-danger-dark px-4 py-2 rounded-md transition-colors"
        >
          Delete post
        </button>
      </div>
    </Modal>
  );
}
