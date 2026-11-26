import { useRef, useState, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../config/api";
import toast from "react-hot-toast";
import { PostContext } from "./PostContext";
import type { Post, UpdatePostPayload, PostComment, PostOwner } from "../types";
import { getErrorMessage } from "../helper/getErrorMessage";

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const likesInFlight = useRef(new Set<string>());
  const { user } = useAuth();

  // Components track their own submitting state; the shared `loading` flag is
  // only for fetching the feed, so creating a post doesn't blank the feed.
  const createPost = async (caption: string, avatar: string) => {
    try {
      const { data } = await api.post("/posts", { caption, avatar });
      setPosts((prev) => [data.post, ...prev]);
      toast.success(data.message || "Post created successfully!");
      return data.post as Post;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };
  const fetchFeedPosts = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await api.get("/posts/feed");
      setPosts(data.posts);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getPostByUserId = async (userId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/posts/user/${userId}`);
      return data.posts as Post[];
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
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
      const { data } = await api.put(`/posts/${postData?.id}`, postData);

      // The API response omits likes/comments, so merge instead of replacing
      setPosts((prev) =>
        prev.map((p) => (p.id === postData?.id ? { ...p, ...data.post } : p)),
      );

      toast.success(data.message || "Post updated successfully!");
      return data.post as Post;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { data } = await api.delete(`/posts/${postId}`);
      toast.success(data.message || "Post updated successfully!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };
  // Flip the current user's like on a post locally (used for optimistic UI and rollback)
  const flipOwnLike = (postId: string, userId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likes.some((l) => l.userId === userId);
        return {
          ...p,
          likes: liked
            ? p.likes.filter((l) => l.userId !== userId)
            : [...p.likes, { id: `optimistic-${userId}`, userId }],
        };
      }),
    );
  };

  const toggleLike = async (
    postId: string,
  ): Promise<{ likes: { id: string; userId: string }[] }> => {
    const userId = user?.id;
    // One request per post at a time, so rapid clicks can't race on the server
    if (!userId || likesInFlight.current.has(postId)) {
      throw new Error("Like request already in progress");
    }

    likesInFlight.current.add(postId);
    flipOwnLike(postId, userId); // update UI instantly

    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      // Reconcile with the server's authoritative list
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: data.likes } : p)),
      );
      return data;
    } catch (error: unknown) {
      flipOwnLike(postId, userId); // roll back
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      likesInFlight.current.delete(postId);
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const getPostLikes = async (postId: string): Promise<PostOwner[]> => {
    try {
      const { data } = await api.get(`/posts/${postId}/likes`);
      return data.likes as PostOwner[];
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
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
