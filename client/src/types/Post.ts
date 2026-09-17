export interface PostImage {
  id: string;
  publicId: string;
  url: string;
  postId: string;
}

export interface PostOwner {
  id: string;
  name: string;
  avatar?: { url: string } | null;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: PostOwner;
}

export interface Post {
  id: string;
  caption: string;
  image: PostImage | null;
  owner: PostOwner;
  likes: { id: string; userId: string }[];
  comments: Comment[];
  createdAt: string;
}

export interface UpdatePostPayload {
  id: string;
  caption: string;
  image?: string;
}

export interface PostContextType {
  posts: Post[];
  loading: boolean;
  fetchFeedPosts: () => Promise<void>;
  createPost: (caption: string, avatar: string) => Promise<Post>;
  updatePost: (payload: UpdatePostPayload) => Promise<Post>;
  getPostByUserId: (id: string) => Promise<Post[]>;
  deletePost: (postId: string) => Promise<void>;
  removePostsByUserId: (userId: string) => void;
  toggleLike: (
    postId: string,
  ) => Promise<{ likes: { id: string; userId: string }[] }>;
  clearPosts: () => void;
  addComment: (postId: string, text: string) => Promise<Comment>;
  getPostLikes: (postId: string) => Promise<PostOwner[]>;
  updateComment: (commentId: string, text: string) => Promise<Comment>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
}
