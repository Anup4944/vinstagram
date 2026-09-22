import { useState } from "react";
import Modal from "./Modal";
import type { User } from "../types";
import { useUser } from "../hooks/useUser";

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export default function EditProfileModal({
  user,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url);
  const { profileLoading, updateProfile } = useUser();
  const [avatarChanged, setAvatarChanged] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarChanged(true);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile({
        name,
        email,
        bio,
        avatar: avatarChanged ? avatarPreview : undefined,
      });
      onSave(updatedUser);
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex justify-center mb-1">
          <label htmlFor="avatarFile" className="relative cursor-pointer group">
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="absolute inset-0 rounded-full bg-surface-dark/0 group-hover:bg-surface-dark/50 flex items-center justify-center transition-colors">
              <svg
                className="w-5 h-5 text-inverted opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                />
              </svg>
            </div>
          </label>
          <input
            id="avatarFile"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface-muted rounded-md outline-none text-body focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface-muted rounded-md outline-none text-body focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm bg-surface-muted rounded-md outline-none text-body focus:ring-2 focus:ring-brand resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-body bg-surface-muted hover:bg-surface-muted/70 px-4 py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-sm font-semibold text-inverted bg-brand hover:bg-brand-dark px-4 py-2 rounded-md transition-colors"
          >
            {profileLoading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
