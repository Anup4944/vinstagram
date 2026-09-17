import { Router } from "express";
import {
  changePassword,
  getUserProfile,
  updateProfile,
  getAllUsers,
  deleteAccount,
  toggleFollow,
  getFollowers,
  getFollowing,
} from "../contollers/userContoller.js";
import auth from "../middleware/auth.js";

const userRouter = Router();

userRouter.get("/", auth, getAllUsers);
userRouter.get("/:id", auth, getUserProfile);
userRouter.put("/profile/:id", auth, updateProfile);
userRouter.delete("/profile/:id", auth, deleteAccount);
userRouter.put("/password/:id", auth, changePassword);
userRouter.post("/follow/:id", auth, toggleFollow);
userRouter.get("/:userId/followers", auth, getFollowers);
userRouter.get("/:userId/following", auth, getFollowing);

export default userRouter;
