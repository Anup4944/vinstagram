import express from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../contollers/authController.js";
import multer from "multer";

const authRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

authRouter.post("/register", upload.single("avatar"), registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
