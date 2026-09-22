import { Prisma } from "../generated/prisma/index.js";
/**
 * Returns a safe, user-facing error message for API responses.
 * Never includes stack traces, file paths, or raw database errors.
 * Callers should ALSO log the full `error` object separately (server-side only).
 */
export function getErrorMessage(error: unknown): string {
  // Known Prisma errors — map to friendly messages
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return "This value is already in use.";
      case "P2025":
        return "The requested record was not found.";
      case "P2003":
        return "This action references a record that doesn't exist.";
      default:
        return "A database error occurred. Please try again.";
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return "Invalid data provided.";
  }

  // Errors you deliberately threw yourself with a safe, intentional message
  // (e.g., throw new Error("Invalid email or password"))
  if (error instanceof Error && isSafeToExpose(error)) {
    return error.message;
  }

  // Anything else — never leak internals, just return a generic fallback
  return "Something went wrong. Please try again later.";
}

/**
 * Whitelist of error messages that are safe to show directly to users,
 * because YOU wrote them intentionally as user-facing messages.
 * Everything else falls back to the generic message.
 */
function isSafeToExpose(error: Error): boolean {
  const safeMessages = [
    "Invalid email or password",
    "Email already registered",
    "Not authenticated",
    "Not authorized",
    "User not found",
    "Post not found",
    "Comment not found",
    "You cannot follow yourself",
    "Comment text is required",
    "Caption is required",
    "Password must be at least 6 characters",
    "Current password is incorrect",
    "Invalid or expired reset token",
  ];
  return safeMessages.includes(error.message);
}
