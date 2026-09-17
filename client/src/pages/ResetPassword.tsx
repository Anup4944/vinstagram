import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
    } catch (error: any) {
      console.error("Error resetting password:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-8">Invalid or missing reset token.</div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm bg-surface border border-surface-muted rounded-lg p-6">
        <h1 className="text-lg font-semibold text-body mb-1">Reset Password</h1>
        <p className="text-sm text-muted mb-6">
          Enter a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-3 py-2 text-sm bg-surface-muted rounded-md outline-none text-body placeholder:text-muted focus:ring-2 focus:ring-brand"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer text-sm font-semibold text-inverted bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md transition-colors"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
