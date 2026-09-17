// ─── Core User shape ───

export interface Avatar {
  id: string;
  publicId: string;
  url: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: Avatar | null;
  bio?: string;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followers?: number;
    following?: number;
    posts?: number;
  };
}

// ─── UserContext-specific types ───

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  avatar?: string;
}

export interface ToggleFollowResponse {
  message: string;
  isFollowing: boolean;
  followerCount: number;
}

export interface FollowUser {
  id: string;
  name: string;
  email: string;
  avatar?: Avatar | null;
}

export interface UserContextType {
  users: User[];
  usersLoading: boolean;
  profileLoading: boolean;
  fetchAllUsers: () => Promise<void>;
  clearUsers: () => void;
  fetchUserById: (userId: string) => Promise<User>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
  deleteUser: (password: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  toggleFollow: (userId: string) => Promise<ToggleFollowResponse>;
  getFollowers: (userId: string) => Promise<FollowUser[]>;
  getFollowing: (userId: string) => Promise<FollowUser[]>;
}
