import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
export const getPosts = async (req, res) => {
  const query = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 1000000,
        },
      },
    });
    setTimeout(() => {
      res.status(200).json(posts);
    }, 3000);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to get the post " });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetails: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          res.status(200).json({...post, isSaved: saved ? true : false });
        }
      });
    }
    res.status(200).json({ ...post, isSaved: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to get the post " });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;
  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetails: {
          create: body.postDetail,
        },
      },
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to add the post " });
  }
};

export const updatePost = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to update the post " });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res
        .status(403)
        .json({ message: "you are not allowed to delete this post " });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "post deleted successfully " });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to delete the post " });
  }
};
