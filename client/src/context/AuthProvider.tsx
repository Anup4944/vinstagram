import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";
import type { User } from "../types";
import { getErrorMessage } from "../helper/getErrorMessage";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data.user);
      setToken(data.token);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`${data.user.name}, logged in successfully!`);
      navigate("/");
    } catch (error: unknown) {
      setLoading(false);
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    bio?: string,
    avatar?: string,
  ) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        bio,
        avatar,
      });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`${data.user.name}, registration successful!`);
      navigate("/");
    } catch (error: unknown) {
      setLoading(false);
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      toast.success(data.message);
    } catch (error: unknown) {
      setLoading(false);
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<void> => {
    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      toast.success(data.message);
      navigate("/login");
    } catch (error: unknown) {
      setLoading(false);
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
