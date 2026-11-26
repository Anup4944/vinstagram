import { useEffect } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api from "../config/api";
import Post from "../components/Post";
import { usePost } from "../hooks/usePosts";
import { renderWithProviders, makePost, deferred } from "../test/utils";

vi.mock("../config/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockedApi = vi.mocked(api);

/** Loads the feed through the real PostProvider, like the Posts page does. */
function Feed() {
  const { posts, fetchFeedPosts } = usePost();
  useEffect(() => {
    fetchFeedPosts();
  }, []);
  return (
    <>
      {posts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </>
  );
}

async function renderFeed(post = makePost()) {
  mockedApi.get.mockResolvedValueOnce({ data: { posts: [post] } });
  renderWithProviders(<Feed />);
  await screen.findByText(post.caption);
}

describe("Post — optimistic like", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fills the heart and bumps the count before the server responds", async () => {
    const user = userEvent.setup();
    await renderFeed();
    const request = deferred<{ data: unknown }>();
    mockedApi.post.mockReturnValueOnce(request.promise);

    await user.click(screen.getByRole("button", { name: "Like" }));

    // Server hasn't answered yet, but the UI already shows the like
    expect(screen.getByRole("button", { name: "Unlike" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "1 like" })).toBeInTheDocument();
    expect(mockedApi.post).toHaveBeenCalledWith("/posts/post-1/like");

    request.resolve({ data: { likes: [{ id: "like-1", userId: "me" }] } });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "1 like" })).toBeInTheDocument(),
    );
  });

  it("rolls the like back if the request fails", async () => {
    const user = userEvent.setup();
    await renderFeed();
    const request = deferred<{ data: unknown }>();
    mockedApi.post.mockReturnValueOnce(request.promise);

    await user.click(screen.getByRole("button", { name: "Like" }));
    expect(screen.getByRole("button", { name: "1 like" })).toBeInTheDocument();

    request.reject(new Error("network down"));

    expect(await screen.findByRole("button", { name: "Like" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "0 likes" })).toBeInTheDocument();
  });

  it("ignores extra clicks while a like request is in flight", async () => {
    const user = userEvent.setup();
    await renderFeed();
    const request = deferred<{ data: unknown }>();
    mockedApi.post.mockReturnValue(request.promise);

    await user.click(screen.getByRole("button", { name: "Like" }));
    await user.click(screen.getByRole("button", { name: "Unlike" }));
    await user.click(screen.getByRole("button", { name: "Unlike" }));

    expect(mockedApi.post).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "1 like" })).toBeInTheDocument();
  });
});

describe("Post — comments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("disables the comment form while posting, then shows the comment", async () => {
    const user = userEvent.setup();
    await renderFeed();
    const request = deferred<{ data: unknown }>();
    mockedApi.post.mockReturnValueOnce(request.promise);

    const input = screen.getByPlaceholderText("Add a comment...");
    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled(); // empty input

    await user.type(input, "Great shot!");
    await user.click(screen.getByRole("button", { name: "Post" }));

    expect(screen.getByRole("button", { name: "Posting..." })).toBeDisabled();
    expect(input).toBeDisabled();
    expect(mockedApi.post).toHaveBeenCalledWith("/posts/post-1/comments", { text: "Great shot!" });

    request.resolve({
      data: {
        comment: {
          id: "c1",
          text: "Great shot!",
          createdAt: "2026-11-02T00:00:00.000Z",
          user: { id: "me", name: "Me" },
        },
      },
    });

    expect(await screen.findByText("Great shot!")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(input).toBeEnabled();
  });

  it("keeps the typed comment if posting fails", async () => {
    const user = userEvent.setup();
    await renderFeed();
    mockedApi.post.mockRejectedValueOnce(new Error("boom"));

    const input = screen.getByPlaceholderText("Add a comment...");
    await user.type(input, "Will this work?");
    await user.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => expect(input).toBeEnabled());
    expect(input).toHaveValue("Will this work?");
  });

  it("disables every Delete button while one comment is being deleted", async () => {
    const user = userEvent.setup();
    const comments = ["first", "second"].map((text, i) => ({
      id: `c${i}`,
      text,
      createdAt: "2026-11-02T00:00:00.000Z",
      user: { id: "me", name: "Me" },
    }));
    await renderFeed(makePost({ comments }));
    await user.click(screen.getByRole("button", { name: /view all 2 comments/i }));

    const request = deferred<unknown>();
    mockedApi.delete.mockReturnValueOnce(request.promise);
    const [firstDelete] = screen.getAllByRole("button", { name: "Delete" });
    await user.click(firstDelete);

    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
    screen
      .getAllByRole("button", { name: "Delete" })
      .forEach((btn) => expect(btn).toBeDisabled());

    request.resolve({});
    await waitFor(() => expect(screen.queryByText("first")).not.toBeInTheDocument());
    const remaining = screen.getByText("second").closest("div")!;
    expect(within(remaining.parentElement!).getByRole("button", { name: "Delete" })).toBeEnabled();
  });
});
