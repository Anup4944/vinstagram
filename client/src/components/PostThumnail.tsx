import type { Post } from "../types";

interface PostThumbnailProps {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenComments: () => void;
}

export default function PostThumbnail({
  post,
  onEdit,
  onDelete,
  onOpenComments,
}: PostThumbnailProps) {
  const isOwner = !!onEdit || !!onDelete;

  return (
    <div
      className="relative aspect-square overflow-hidden rounded group"
      onClick={onOpenComments}
    >
      {post.image?.url && (
        <img
          src={post.image.url}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-black/20 md:bg-black/0 md:group-hover:bg-black/50 md:opacity-0 md:group-hover:opacity-100 transition-colors flex flex-col justify-between">
        {isOwner && (
          <div className="flex items-center justify-end gap-2 p-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors cursor-pointer"
                aria-label="Edit post"
              >
                <svg
                  className="w-4 h-4 text-body"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 rounded-full bg-white/90 hover:bg-danger hover:text-white transition-colors"
                aria-label="Delete post"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {!isOwner && (
          <p className="text-xs text-white p-2 line-clamp-2">{post.caption}</p>
        )}

        <div className="flex-1 flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {post?.likes?.length}
          </span>
          <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {post?.comments?.length}
          </span>
        </div>
      </div>
    </div>
  );
}
