import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api from "../config/api";
import NewPostForm from "../components/NewPostForm";
import { renderWithProviders, makePost, deferred } from "../test/utils";

vi.mock("../config/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const image = () => new File(["fake-bytes"], "photo.png", { type: "image/png" });

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.upload(screen.getByLabelText(/click to upload an image/i), image());
  await screen.findByAltText("Preview");
  await user.type(screen.getByPlaceholderText("Write a caption..."), "Hello world");
}

describe("NewPostForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps Share disabled until both an image and a caption are provided", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewPostForm />);
    const share = screen.getByRole("button", { name: "Share post" });

    expect(share).toBeDisabled();
    await user.type(screen.getByPlaceholderText("Write a caption..."), "caption only");
    expect(share).toBeDisabled();

    await user.upload(screen.getByLabelText(/click to upload an image/i), image());
    await screen.findByAltText("Preview");
    expect(share).toBeEnabled();
  });

  it("locks the form while posting and clears it on success", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewPostForm />);
    await fillForm(user);

    const request = deferred<{ data: unknown }>();
    vi.mocked(api.post).mockReturnValueOnce(request.promise);
    await user.click(screen.getByRole("button", { name: "Share post" }));

    expect(screen.getByRole("button", { name: "Posting..." })).toBeDisabled();
    expect(screen.getByPlaceholderText("Write a caption...")).toBeDisabled();
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.post).mock.calls[0][0]).toBe("/posts");

    request.resolve({ data: { post: makePost({ caption: "Hello world" }) } });

    expect(await screen.findByRole("button", { name: "Posted!" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a caption...")).toHaveValue("");
    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
  });

  it("keeps the image and caption when posting fails so the user can retry", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewPostForm />);
    await fillForm(user);
    vi.mocked(api.post).mockRejectedValueOnce(new Error("upload failed"));

    await user.click(screen.getByRole("button", { name: "Share post" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Share post" })).toBeEnabled(),
    );
    expect(screen.getByPlaceholderText("Write a caption...")).toHaveValue("Hello world");
    expect(screen.getByAltText("Preview")).toBeInTheDocument();
  });
});
