import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "field to get the user " });
  }
};
export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "field to get the user " });
  }
};
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized" });
  }

  let updatedpassword = null;
  try {
    if (password) {
      updatedpassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...inputs,
        ...(updatedpassword && { password: updatedpassword }),
        ...(avatar && { avatar: avatar }),
      },
    });

    const { password: userPassword, ...rest } = updatedUser;
    res.status(200).json(rest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "field to get the user " });
  }
};
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized" });
  }

  try {
    await prisma.user.delete({
      where: {
        id,
      },
    });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "field to get the user " });
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post removed from save list" });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (error) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "Post already saved" });
    } else {
      console.log(error);
      res.status(500).json({ message: "Failed to save the post" });
    }
  }
};

export const profilePost = async (req, res) => {
  const tokenUserid = req.params.userid;
  try {
    const userPosts = await prisma.post.findMany({
      where: {
        userId: tokenUserid,
      },
    });
    const saved = await prisma.savedPost.findMany({
      where: {
        userId: tokenUserid,
      },
      include: {
        post: true,
      },
    });

    const savedPosts = saved.map((item) => item.post);
    res.status(200).json({ userPosts, savedPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "field to get the profile posts " });
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const number = await prisma.chat.count({
      where: {
        userIds: {
          hasSome: [tokenUserId],
        },
        NOT:{
          seenBy:{
            hasSome: [tokenUserId]
          }
        }
      },
    });
    res.status(200).json(number)
  } catch (error) {
    console.error(error);
    if (error.code === 'P2010') {
      res.status(500).json({ error: "Database connection error. Please try again later." });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
