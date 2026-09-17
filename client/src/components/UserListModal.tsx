import { useEffect, useState } from "react";
import Modal from "./Modal";
import { useUser } from "../hooks/useUser";
import type { FollowUser } from "../types";

interface UserListModalProps {
  title: string;
  userId: string; // ✅ the profile owner's id, not the list itself
  type: "followers" | "following"; // ✅ which list to fetch
  onClose: () => void;
}

export default function UserListModal({
  title,
  userId,
  type,
  onClose,
}: UserListModalProps) {
  const { getFollowers, getFollowing } = useUser();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const data =
          type === "followers"
            ? await getFollowers(userId)
            : await getFollowing(userId);
        setUsers(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [userId, type]);

  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex flex-col gap-1">
        {loading ? (
          <p className="text-sm text-muted px-2 py-4">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted px-2 py-4">
            No {type === "followers" ? "followers" : "following"} yet.
          </p>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface-muted transition-colors"
            >
              {u.avatar?.url ? (
                <img
                  src={u.avatar.url}
                  alt={u.name}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-inverted text-sm font-semibold">
                  {u.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-medium text-body">{u.name}</span>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
