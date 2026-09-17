import { type ReactNode } from "react";
import { AuthProvider } from "../context/AuthProvider";
import { PostProvider } from "../context/PostProvider";
import { UserProvider } from "../context/UserProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider>
        <PostProvider>{children}</PostProvider>
      </UserProvider>{" "}
    </AuthProvider>
  );
}
