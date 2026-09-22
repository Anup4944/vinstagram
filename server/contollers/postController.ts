import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";

// GET /api/posts
export const getAllPosts = async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany();
  if (posts.length === 0) {
    return res.status(404).json({ error: "No posts found" });
  }
  res.json({ posts });
};

// POST /api/posts
export const createPost = async (req: Request, res: Response) => {
  const { caption, avatar } = req.body;

  if (!caption) {
    return res.status(400).json({ error: "Caption is required" });
  }

  const ownerId = req.user?.id;

  if (!ownerId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!avatar) {
    return res.status(400).json({ error: "Post image is required" });
  }

  let avatarData: { publicId: string; url: string } | null = null;

  if (avatar) {
    const myCloud = await cloudinary.uploader.upload(avatar, {
      folder: "socialTwo",
    });

    avatarData = {
      publicId: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const post = await prisma.post.create({
    data: {
      caption,
      ownerId,
      image: avatarData ? { create: avatarData } : undefined,
    },
    include: {
      owner: {
        select: { id: true, name: true, avatar: true },
      },
      image: true,
    },
  });

  res.status(201).json({
    message: "Post created successfully",
    post: post,
  });
};

export const getPostByUserId = async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  console.log(userId);

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const userExists = await prisma.user.findUnique({
    where: { id: userId as string },
    select: { id: true },
  });

  if (!userExists) {
    return res.status(404).json({ error: "User not found" });
  }

  const posts = await prisma.post.findMany({
    where: { ownerId: userId as string },
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      image: true,
      likes: true,
      comments: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const totalPosts = await prisma.post.count({
    where: { ownerId: userId as string },
  });

  res.status(200).json({
    posts,
    totalPosts,
  });
};

// PUT /api/posts/:id
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { caption, image, id: postId } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { image: true },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.ownerId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this post" });
    }

    let imageUpsert = undefined;

    const oldPublicId = existingPost.image?.publicId;

    if (image) {
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (cloudErr) {
          console.error("Failed to delete old postimage:", cloudErr);
        }
      }

      const myCloud = await cloudinary.uploader.upload(image, {
        folder: "socialTwo",
      });

      imageUpsert = {
        upsert: {
          create: { publicId: myCloud.public_id, url: myCloud.secure_url },
          update: { publicId: myCloud.public_id, url: myCloud.secure_url },
        },
      };
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(caption !== undefined && { caption }),
        ...(imageUpsert && { image: imageUpsert }), // ✅ field name matches schema
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        image: true,
      },
    });
    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// DELETE /api/posts/:id
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Valid post id is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.ownerId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this post" });
    }

    if (post.image?.publicId) {
      try {
        await cloudinary.uploader.destroy(post.image.publicId);
      } catch (cloudErr) {
        console.error("Failed to delete image from Cloudinary:", cloudErr);
      }
    }

    await prisma.post.delete({ where: { id } });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// controllers/postController.ts
export const getFeedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get the list of user IDs the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    const posts = await prisma.post.findMany({
      where: { ownerId: { in: [...followingIds, userId] } },
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        image: true,
        likes: true,
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Get feed posts error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// togle like for a post /api/posts/:postId/like
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const postId = req.params.postId;
    if (!postId || typeof postId !== "string") {
      return res.status(400).json({ error: "Valid post id is required" });
    }
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.like.create({ data: { userId, postId } });
    }

    const likes = await prisma.like.findMany({ where: { postId } });

    res.status(200).json({ likes });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// add comment to a post /api/posts/:postId/comments
export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const postId = req.params.postId;
    const { text } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!postId || typeof postId !== "string") {
      return res.status(400).json({ error: "Valid post id is required" });
    }

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    // Confirm the post actually exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId,
        postId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// delete a comment of a post /api/posts/:postId/comments/:commentId
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const commentId = req.params.commentId;

    if (!commentId || typeof commentId !== "string") {
      return res.status(400).json({ error: "Valid comment id is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: { ownerId: true },
        },
      },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const isCommentAuthor = existingComment.userId === userId;
    const isPostOwner = existingComment.post.ownerId === userId;

    if (!isCommentAuthor && !isPostOwner) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// get post likes /api/posts/:postId/likes
export const getPostLikes = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    if (!postId || typeof postId !== "string") {
      return res.status(400).json({ error: "Valid post id is required" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const likes = await prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      likes: likes.map((l) => l.user),
    });
  } catch (error) {
    console.error("Get post likes error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// update comment /api/posts/comments/:commentId
export const updateComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const commentId = req.params.commentId;
    const { text } = req.body;

    if (!commentId || typeof commentId !== "string") {
      return res.status(400).json({ error: "Valid comment id is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this comment" });
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { text: text.trim() },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
