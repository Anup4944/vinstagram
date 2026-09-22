import { useState, type ReactNode } from "react";
import api from "../config/api";
import toast from "react-hot-toast";
import { PostContext } from "./PostContext";
import type { Post, UpdatePostPayload, PostComment, PostOwner } from "../types";

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const createPost = async (caption: string, avatar: string) => {
    try {
      setLoading(true);
      const { data } = await api.post("/posts", { caption, avatar });
      setPosts((prev) => [data.post, ...prev]);
      toast.success(data.message || "Post created successfully!");
      return data.post as Post;
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.error || "Failed to create post");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const fetchFeedPosts = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await api.get("/posts/feed");
      setPosts(data.posts);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch feed posts");
    } finally {
      setLoading(false);
    }
  };

  const getPostByUserId = async (userId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/posts/user/${userId}`);
      return data.posts as Post[];
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch posts");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const removePostsByUserId = (userId: string) => {
    setPosts((prev) => prev.filter((p) => p.owner.id !== userId));
  };

  const updatePost = async (postData: UpdatePostPayload): Promise<Post> => {
    try {
      setLoading(true);

      const { data } = await api.put(`/posts/${postData?.id}`, postData);

      setPosts((prev) =>
        prev.map((p) => (p.id === postData?.id ? data.post : p)),
      );

      toast.success(data.message || "Post updated successfully!");
      return data.post as Post;
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update post");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { data } = await api.delete(`/posts/${postId}`);
      toast.success(data.message || "Post updated successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete post");
      throw error;
    }
  };
  const toggleLike = async (
    postId: string,
  ): Promise<{ likes: { id: string; userId: string }[] }> => {
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: data.likes } : p)),
      );
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch posts");
      throw error;
    }
  };

  const clearPosts = () => {
    setPosts([]);
  };

  const addComment = async (
    postId: string,
    text: string,
  ): Promise<PostComment> => {
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...(p.comments ?? []), data.comment] }
            : p,
        ),
      );
      return data.comment as PostComment;
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to add comment");
      throw error;
    }
  };

  const getPostLikes = async (postId: string): Promise<PostOwner[]> => {
    try {
      const { data } = await api.get(`/posts/${postId}/likes`);
      return data.likes as PostOwner[];
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch post likes");
      throw error;
    }
  };

  const updateComment = async (
    commentId: string,
    text: string,
  ): Promise<PostComment> => {
    try {
      const { data } = await api.put(`/posts/comments/${commentId}`, { text });

      setPosts((prev) =>
        prev.map((p) => ({
          ...p,
          comments: (p.comments ?? []).map((c) =>
            c.id === commentId ? data.comment : c,
          ),
        })),
      );

      return data.comment as PostComment;
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch post likes");
      throw error;
    }
  };

  const deleteComment = async (
    postId: string,
    commentId: string,
  ): Promise<void> => {
    try {
      await api.delete(`/posts/comments/${commentId}`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: (p.comments ?? []).filter((c) => c.id !== commentId),
              }
            : p,
        ),
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete comment");
      throw error;
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        clearPosts,
        fetchFeedPosts,
        createPost,
        getPostByUserId,
        updatePost,
        deletePost,
        removePostsByUserId,
        toggleLike,
        addComment,
        getPostLikes,
        updateComment,
        deleteComment,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}
