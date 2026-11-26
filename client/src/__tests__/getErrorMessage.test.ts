import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { getErrorMessage } from "../helper/getErrorMessage";

function axiosError(status?: number, data: unknown = {}) {
  const response = status
    ? ({ status, data, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } } as AxiosResponse)
    : undefined;
  return new AxiosError("Request failed", "ERR", undefined, undefined, response);
}

describe("getErrorMessage", () => {
  it("prefers the backend's `error` field", () => {
    expect(getErrorMessage(axiosError(400, { error: "Email taken" }))).toBe("Email taken");
  });

  it("falls back to the backend's `message` field", () => {
    expect(getErrorMessage(axiosError(500, { message: "DB down" }))).toBe("DB down");
  });

  it("reports a connection problem when there is no response", () => {
    expect(getErrorMessage(axiosError())).toMatch(/unable to connect/i);
  });

  it.each([
    [401, /log in/i],
    [403, /permission/i],
    [404, /couldn't be found/i],
    [429, /too many requests/i],
    [500, /something went wrong/i],
  ])("maps status %i to a friendly message", (status, expected) => {
    expect(getErrorMessage(axiosError(status))).toMatch(expected);
  });

  it("handles non-Axios errors", () => {
    expect(getErrorMessage(new Error("boom"))).toMatch(/something went wrong/i);
  });
});
