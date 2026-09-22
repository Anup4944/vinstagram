import axios from "axios";

/**
 * Extracts a user-facing error message from a caught error (typically an
 * Axios error from a failed API call). Never logs anything — the backend
 * already decided what's safe to expose in error.response.data.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // The backend's getErrorMessage() already sanitized this — trust it
    const backendMessage =
      error.response?.data?.error || error.response?.data?.message;

    if (backendMessage) {
      return backendMessage;
    }

    // No response at all — network failure, timeout, CORS, server down, etc.
    if (!error.response) {
      return "Unable to connect. Please check your internet connection.";
    }

    // Response exists but has no message field — generic fallback by status
    switch (error.response.status) {
      case 401:
        return "Please log in to continue.";
      case 403:
        return "You don't have permission to do that.";
      case 404:
        return "That couldn't be found.";
      case 429:
        return "Too many requests. Please slow down.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  // Non-Axios error (shouldn't normally happen for API calls, but just in case)
  return "Something went wrong. Please try again.";
}
