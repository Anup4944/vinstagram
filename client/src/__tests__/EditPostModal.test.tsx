import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api from "../config/api";
import EditPostModal from "../components/EditPostModal";
import { renderWithProviders, makePost, deferred } from "../test/utils";

vi.mock("../config/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const ownPost = () =>
  makePost({
    owner: { id: "me", name: "Me", avatar: null },
    likes: [{ id: "l1", userId: "alice" }],
    comments: [
      { id: "c1", text: "nice", createdAt: "2026-11-02T00:00:00.000Z", user: { id: "alice", name: "Alice" } },
    ],
  });

describe("EditPostModal — optimistic caption edit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("applies the new caption and closes before the server responds", async () => {
    const user = userEvent.setup();
    const post = ownPost();
    const onSave = vi.fn();
    const onClose = vi.fn();
    const request = deferred<{ data: unknown }>();
    vi.mocked(api.put).mockReturnValueOnce(request.promise);

    renderWithProviders(<EditPostModal post={post} onSave={onSave} onClose={onClose} />);
    const caption = screen.getByDisplayValue(post.caption);
    await user.clear(caption);
    await user.type(caption, "New caption");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    // Optimistic: parent already has the new caption, modal already closed
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ caption: "New caption" }));
    expect(onClose).toHaveBeenCalled();

    // Server reply lacks likes/comments — they must survive the merge
    request.resolve({
      data: { post: { id: post.id, caption: "New caption", owner: post.owner, image: post.image } },
    });
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));
    const merged = onSave.mock.calls[1][0];
    expect(merged.caption).toBe("New caption");
    expect(merged.likes).toHaveLength(1);
    expect(merged.comments).toHaveLength(1);
  });

  it("rolls back to the original post if saving fails", async () => {
    const user = userEvent.setup();
    const post = ownPost();
    const onSave = vi.fn();
    vi.mocked(api.put).mockRejectedValueOnce(new Error("server error"));

    renderWithProviders(<EditPostModal post={post} onSave={onSave} onClose={vi.fn()} />);
    const caption = screen.getByDisplayValue(post.caption);
    await user.clear(caption);
    await user.type(caption, "Doomed edit");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));
    expect(onSave.mock.calls[0][0].caption).toBe("Doomed edit");
    expect(onSave.mock.calls[1][0]).toEqual(post);
  });

  it("disables Save when the caption is empty", async () => {
    const user = userEvent.setup();
    const post = ownPost();
    renderWithProviders(<EditPostModal post={post} onSave={vi.fn()} onClose={vi.fn()} />);

    await user.clear(screen.getByDisplayValue(post.caption));
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("shows the like count", () => {
    renderWithProviders(<EditPostModal post={ownPost()} onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "1 like" })).toBeInTheDocument();
  });
});
