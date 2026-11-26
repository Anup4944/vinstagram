import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { AuthContext } from "../context/AuthContext";
import { PostProvider } from "../context/PostProvider";
import type { AuthContextType, Post, User } from "../types";

export const currentUser: User = {
  id: "me",
  email: "me@example.com",
  name: "Me",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export function makeAuth(overrides: Partial<AuthContextType> = {}): AuthContextType {
  return {
    user: currentUser,
    token: "test-token",
    loading: false,
    isAuthenticated: true,
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    updateUser: vi.fn(),
    forgotPassword: vi.fn().mockResolvedValue(undefined),
    resetPassword: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-1",
    caption: "Sunset at the beach",
    image: { id: "img-1", publicId: "pub-1", url: "https://img.test/1.jpg", postId: "post-1" },
    owner: { id: "alice", name: "Alice", avatar: null },
    likes: [],
    comments: [],
    createdAt: "2026-11-01T10:00:00.000Z",
    ...overrides,
  };
}

/** Render inside Router + a fake AuthContext + the real PostProvider. */
export function renderWithProviders(
  ui: ReactNode,
  { auth = makeAuth() }: { auth?: AuthContextType } = {},
) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={auth}>
        <PostProvider>{ui}</PostProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

/** A promise you resolve/reject by hand, to observe UI while a request is "in flight". */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
