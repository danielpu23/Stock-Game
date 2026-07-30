import { AxiosError } from "axios";

/**
 * Pulls the human-readable reason out of a failed request.
 *
 * The API returns errors as {status, message, timestamp}. Call sites used to
 * read `error.response.data.message` inline against a plain-text body, so every
 * real message ("Not enough cash", "You don't own any TSLA") was discarded in
 * favour of a generic fallback.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim() !== "") {
      return data;
    }

    if (data && typeof data === "object" && typeof data.message === "string") {
      return data.message;
    }

    if (error.code === "ERR_NETWORK") {
      return "Can't reach the server. Is the backend running on port 8080?";
    }
  }

  return fallback;
}
