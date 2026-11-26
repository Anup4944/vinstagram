import { useEffect, useState } from "react";
import Modal from "./Modal";
import { usePost } from "../hooks/usePosts";
import type { PostOwner } from "../types";

interface LikesModalProps {
  postId: string;
  onClose: () => void;
}

// Full list of everyone who liked a post. Fetched fresh each time it opens,
// so it always matches the current like count.
export default function LikesModal({ postId, onClose }: LikesModalProps) {
  const { getPostLikes } = usePost();
  const [likers, setLikers] = useState<PostOwner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getPostLikes(postId);
        if (!cancelled) setLikers(data);
      } catch {
        // toast already shown by the provider
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  return (
    <Modal
      title={loading ? "Likes" : `Likes (${likers.length})`}
      onClose={onClose}
    >
      {loading ? (
        <p className="text-sm text-muted px-2 py-4">Loading...</p>
      ) : likers.length === 0 ? (
        <p className="text-sm text-muted px-2 py-4">No likes yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {likers.map((liker) => (
            <li
              key={liker.id}
              className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface-muted transition-colors"
            >
              {liker.avatar?.url ? (
                <img
                  src={liker.avatar.url}
                  alt={liker.name}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-inverted text-sm font-semibold">
                  {liker.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-medium text-body truncate">
                {liker.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
