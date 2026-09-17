import { useState } from "react";
import { useUser } from "../hooks/useUser";

interface DeleteAccountModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  userId,
  onClose,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const { deleteUser } = useUser();

  if (!isOpen) return null;

  const isConfirmValid = confirmText.trim().toUpperCase() === "DELETE";

  const handleClose = () => {
    setPassword("");
    setConfirmText("");
    onClose();
  };
  const handleOnDeleteAccount = async () => {
    await deleteUser(userId, password);
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h2>
        <p className="text-sm text-gray-600 mb-6">
          This action is{" "}
          <span className="font-semibold text-red-600">permanent</span> and
          cannot be undone. All your posts, comments, likes, and profile data
          will be permanently removed.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="delete-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enter your password
            </label>
            <input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="delete-confirm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || !isConfirmValid || !password}
            onClick={handleOnDeleteAccount}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
