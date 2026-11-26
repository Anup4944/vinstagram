import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api from "../config/api";
import LikesModal from "../components/LikesModal";
import { renderWithProviders } from "../test/utils";

vi.mock("../config/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe("LikesModal", () => {
  it("lists every person who liked the post, not just the first few", async () => {
    const likers = Array.from({ length: 25 }, (_, i) => ({
      id: `u${i}`,
      name: `User ${i}`,
      avatar: null,
    }));
    vi.mocked(api.get).mockResolvedValueOnce({ data: { likes: likers } });

    renderWithProviders(<LikesModal postId="post-1" onClose={vi.fn()} />);

    expect(await screen.findByText("Likes (25)")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(25);
    expect(screen.getByText("User 0")).toBeInTheDocument();
    expect(screen.getByText("User 24")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/posts/post-1/likes");
  });

  it("shows an empty state and closes via the X button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(api.get).mockResolvedValueOnce({ data: { likes: [] } });

    renderWithProviders(<LikesModal postId="post-1" onClose={onClose} />);

    expect(await screen.findByText("No likes yet.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
