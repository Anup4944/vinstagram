import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  updatePost,
  getPostByUserId,
  getFeedPosts,
  toggleLike,
  addComment,
  deleteComment,
  getPostLikes,
  updateComment,
} from "../contollers/postController.js";
import auth from "../middleware/auth.js";

const postRouter = express.Router();

postRouter.get("/", auth, getAllPosts);
postRouter.get("/feed", auth, getFeedPosts);
postRouter.get("/user/:id", auth, getPostByUserId);
postRouter.post("/", auth, createPost);
postRouter.put("/:id", auth, updatePost);
postRouter.delete("/:id", auth, deletePost);
postRouter.post("/:postId/like", auth, toggleLike);
postRouter.post("/:postId/comments", auth, addComment);
postRouter.delete("/comments/:commentId", auth, deleteComment);
postRouter.get("/:postId/likes", auth, getPostLikes);
postRouter.put("/comments/:commentId", auth, updateComment);

export default postRouter;
