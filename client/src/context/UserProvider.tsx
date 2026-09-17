import { useState, type ReactNode } from "react";
import api from "../config/api";
import { UserContext } from "./UserContext";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import type {
  UpdateProfilePayload,
  User,
  FollowUser,
  ToggleFollowResponse,
} from "../types";
import { useNavigate } from "react-router-dom";

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const fetchUserById = async (userId: string): Promise<User> => {
    try {
      const { data } = await api.get(`/users/${userId}`);
      return data.user as User;
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
      throw error;
    }
  };

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } catch (error: any) {
      setUsersLoading(false);
      toast.error(error?.response?.data?.error);
      throw error;
    }
  };

  const updateProfile = async (
    userData: UpdateProfilePayload,
  ): Promise<User> => {
    setProfileLoading(true);
    try {
      const { data } = await api.put(`/users/profile/${user?.id}`, userData);
      updateUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(data.message || "Profile updated successfully!");
      return data.user as User;
    } catch (error: any) {
      setProfileLoading(false);
      toast.error(error?.response?.data?.error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const deleteUser = async (
    userId: string,
    password: string,
  ): Promise<void> => {
    try {
      await api.delete(`/users/profile/${userId}`, { data: { password } });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("User deleted successfully!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    try {
      const { data } = await api.put(`/users/password/${user?.id}`, {
        currentPassword,
        newPassword,
      });

      toast.success(data.message || "Password changed successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
      throw error;
    }
  };

  const toggleFollow = async (
    userId: string,
  ): Promise<ToggleFollowResponse> => {
    try {
      const { data } = await api.post(`/users/follow/${userId}`);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isFollowing: data.isFollowing } : u,
        ),
      );
      toast.success(data.message || "Follow status updated successfully!");

      return data as ToggleFollowResponse;
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
      throw error;
    }
  };

  const getFollowers = async (userId: string): Promise<FollowUser[]> => {
    try {
      const { data } = await api.get(`/users/${userId}/followers`);
      return data.followers as FollowUser[];
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
      throw error;
    }
  };

  const getFollowing = async (userId: string): Promise<FollowUser[]> => {
    try {
      const { data } = await api.get(`/users/${userId}/following`);
      return data.following as FollowUser[];
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
      throw error;
    }
  };
  const clearUsers = () => {
    setUsers([]);
  };
  return (
    <UserContext.Provider
      value={{
        users,
        usersLoading,
        profileLoading,
        fetchUserById,
        fetchAllUsers,
        updateProfile,
        deleteUser,
        changePassword,
        toggleFollow,
        getFollowers,
        getFollowing,
        clearUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
