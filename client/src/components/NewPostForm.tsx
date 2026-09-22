import { useState } from "react";
import { usePost } from "../hooks/usePosts";

const NewPostForm = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { createPost } = usePost();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const Reader = new FileReader();
    Reader.readAsDataURL(file);
    setImageFile(file);
    setImagePreview(Reader.result as string);

    Reader.onload = () => setImagePreview(Reader.result as string);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile || !caption.trim()) return;

    await createPost(caption, imagePreview);
    setSubmitted(true);
    setImageFile(null);
    setImagePreview("");
    setCaption("");
  };

  const canSubmit = imageFile !== null && caption.trim() !== "";

  return (
    <div className="bg-surface border border-surface-muted rounded-lg overflow-hidden mb-6 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        {/* Image upload */}
        <div>
          {!imagePreview ? (
            <label
              htmlFor="imageFile"
              className="flex flex-col items-center justify-center gap-2 w-full aspect-square rounded-md border-2 border-dashed border-surface-muted bg-surface-muted/50 hover:bg-surface-muted cursor-pointer transition-colors"
            >
              <svg
                className="w-8 h-8 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>
              <span className="text-xs text-muted px-4 text-center">
                Click to upload an image
              </span>
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-full">
              <div className="rounded-md overflow-hidden bg-surface-muted aspect-square w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 flex items-center justify-center h-7 w-7 rounded-full bg-surface-dark/70 text-inverted hover:bg-danger transition-colors"
                aria-label="Remove image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows={3}
            className="w-full px-3 py-2 text-sm bg-surface-muted rounded-md outline-none text-body placeholder:text-muted focus:ring-2 focus:ring-brand resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="self-end text-sm font-semibold text-inverted bg-brand hover:bg-brand-dark disabled:bg-surface-muted disabled:text-muted disabled:cursor-not-allowed px-4 py-2 rounded-md transition-colors"
        >
          {submitted ? "Posted!" : "Share post"}
        </button>
      </form>
    </div>
  );
};

export default NewPostForm;
