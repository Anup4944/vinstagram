import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  bio: true,
  avatar: true,
  createdAt: true,
} as const;

// GET /api/users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    const users = await prisma.user.findMany({
      where: currentUserId ? { id: { not: currentUserId } } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        followers: currentUserId
          ? {
              where: { followerId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    const usersWithFollowStatus = users.map((u) => {
      const { followers, ...rest } = u;
      return {
        ...rest,
        isFollowing: currentUserId ? followers.length > 0 : false,
      };
    });

    res.status(200).json({ users: usersWithFollowStatus });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/:id
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Valid user id is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        _count: {
          select: { followers: true, following: true, posts: true },
        },
        followers: currentUserId
          ? {
              where: currentUserId
                ? { followerId: currentUserId }
                : { followerId: "" },
              select: { id: true },
            }
          : false,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { followers, ...rest } = user;

    res.status(200).json({
      user: {
        ...rest,
        isFollowing: currentUserId ? followers.length > 0 : false,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/users/profile/:id
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email, bio, avatar } = req.body;

    console.log(req.body);

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      include: { avatar: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }
    if (email && email.toLowerCase() !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }
    let avatarUpsert = undefined;

    if (avatar) {
      if (existing.avatar?.publicId) {
        try {
          await cloudinary.uploader.destroy(existing.avatar?.publicId);
        } catch (cloudErr) {
          console.error("Failed to delete old avatar:", cloudErr);
        }
      }
      const myCloud = await cloudinary.uploader.upload(avatar, {
        folder: "socialTwo",
      });

      avatarUpsert = {
        upsert: {
          create: { publicId: myCloud.public_id, url: myCloud.secure_url },
          update: { publicId: myCloud.public_id, url: myCloud.secure_url },
        },
      };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(bio !== undefined && { bio }),
        ...(avatarUpsert && { avatar: avatarUpsert }),
      },
      select: userSelect,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE  /api/users/:id
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        avatar: true,
        posts: {
          include: { image: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Collect every Cloudinary publicId that needs to be deleted
    const publicUrlToDelete: string[] = [];

    if (user.avatar?.publicId) {
      publicUrlToDelete.push(user.avatar?.publicId);
    }

    for (const post of user.posts) {
      if (post.image?.publicId) {
        publicUrlToDelete.push(post.image?.publicId);
      }
    }

    // Delete all images from Cloudinary in parallel
    if (publicUrlToDelete.length > 0) {
      const results = await Promise.allSettled(
        publicUrlToDelete.map((publicId) =>
          cloudinary.uploader.destroy(publicId),
        ),
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Failed to delete Cloudinary asset ${publicUrlToDelete[index]}:`,
            result.reason,
          );
        }
      });
    }

    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// PUT /api/users/password/:id
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res
        .status(400)
        .json({ message: "currentPassword and newPassword are required" });
      return;
    }

    if (newPassword.length < 8) {
      res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.params.id as string },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleFollow = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const followingId = req.params.id;

    if (!followerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!followingId || typeof followingId !== "string") {
      return res.status(400).json({ error: "Valid user id is required" });
    }

    if (followerId === followingId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: followerId,
            followingId: followingId,
          },
        },
      });
      const followerCount = await prisma.follow.count({
        where: { followingId },
      });
      return res.status(200).json({
        message: "Unfollowed successfully",
        followerCount,
        isFollowing: false,
      });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: followerId,
          followingId: followingId,
        },
      });
      const followerCount = await prisma.follow.count({
        where: { followingId },
      });
      return res.status(200).json({
        message: "Followed successfully",
        followerCount,
        isFollowing: true,
      });
    }
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const followers = await prisma.follow.findMany({
      where: { followingId: userId as string },
      select: {
        follower: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    res.status(200).json({
      followers: followers.map((f) => f.follower),
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const following = await prisma.follow.findMany({
      where: { followerId: userId as string },
      select: {
        following: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    res.status(200).json({
      following: following.map((f) => f.following),
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
