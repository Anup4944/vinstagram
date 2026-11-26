import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Login from "../pages/Login";
import { makeAuth, deferred } from "../test/utils";
import type { AuthContextType } from "../types";

function renderLogin(auth: AuthContextType = makeAuth({ user: null, token: null })) {
  render(
    <MemoryRouter>
      <AuthContext.Provider value={auth}>
        <Login />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  return auth;
}

describe("Login page", () => {
  it("shows the welcome heading and the login form", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: "Welcome to Vinstagram" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");
  });

  it("switches to sign-up mode and back", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(screen.getByRole("heading", { name: "Join us today" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(screen.getByRole("heading", { name: "Welcome to Vinstagram" })).toBeInTheDocument();
  });

  it("calls login with the entered credentials and disables the button meanwhile", async () => {
    const user = userEvent.setup();
    const request = deferred<void>();
    const auth = renderLogin(
      makeAuth({ user: null, token: null, login: vi.fn().mockReturnValue(request.promise) }),
    );

    await user.type(screen.getByLabelText("Email"), "me@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(auth.login).toHaveBeenCalledWith("me@example.com", "secret123");
    expect(screen.getByRole("button", { name: "Processing..." })).toBeDisabled();

    request.resolve();
    await waitFor(() => expect(screen.getByRole("button", { name: "Login" })).toBeEnabled());
  });

  it("shows a validation error and lets the user fix it (form must not stay stuck)", async () => {
    const user = userEvent.setup();
    const auth = renderLogin();

    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getAllByRole("button", { name: "Sign Up" })[0]);

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(auth.register).not.toHaveBeenCalled();
    // After a validation error the user must be able to keep typing and resubmit
    expect(screen.getByLabelText("Name")).toBeEnabled();
    expect(screen.getAllByRole("button", { name: "Sign Up" })[0]).toBeEnabled();
  });
});
