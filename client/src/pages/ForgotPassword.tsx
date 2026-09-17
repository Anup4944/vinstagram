import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (error) {
      console.error("Error occurred while requesting password reset:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm bg-surface border border-surface-muted rounded-lg p-6">
        {submitted ? (
          <>
            <h1 className="text-lg font-semibold text-body mb-1">
              Check your email
            </h1>
            <p className="text-sm text-muted mb-6">
              If an account exists for{" "}
              <span className="font-medium text-body">{email}</span>, we've sent
              a link to reset your password.
            </p>
            <Link
              to="/login"
              className="block text-center text-sm font-semibold text-brand hover:underline"
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-body mb-1">
              Forgot password?
            </h1>
            <p className="text-sm text-muted mb-6">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm bg-surface-muted rounded-md outline-none text-body placeholder:text-muted focus:ring-2 focus:ring-brand"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full text-sm font-semibold text-inverted bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md transition-colors"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <Link
                to="/login"
                className="text-center text-sm text-muted hover:text-body transition-colors"
              >
                Back to login
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
