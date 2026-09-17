import express from "express";
import auth from "../middleware/auth.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const uploadRouter = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

uploadRouter.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "socialTwo",
      resource_type: "auto",
    });
    res
      .status(200)
      .json({ message: "File uploaded successfully", url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file" });
  }
});

export default uploadRouter;
