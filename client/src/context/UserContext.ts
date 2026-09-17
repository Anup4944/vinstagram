import { createContext } from "react";
import type { FollowUser, ToggleFollowResponse, User } from "../types";

export interface UserContextType {
  users: User[];
  usersLoading: boolean; // for fetchAllUsers
  profileLoading: boolean; // for updateProfile
  fetchAllUsers: () => Promise<void>;
  fetchUserById: (userId: string) => Promise<User>;
  updateProfile: (payload: {
    name?: string;
    email?: string;
    bio?: string;
    avatar?: string;
  }) => Promise<User>;
  deleteUser: (userId: string, password: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  toggleFollow: (userId: string) => Promise<ToggleFollowResponse>;
  getFollowers: (userId: string) => Promise<FollowUser[]>;
  getFollowing: (userId: string) => Promise<FollowUser[]>;
  clearUsers: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);
