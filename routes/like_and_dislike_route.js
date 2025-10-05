const express = require("express");
const route = express.Router();
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check_auth");
const LikeDislike = require("../models/like_and_dislike_model");
const Blog = require("../models/bolg_model");
const blogUser = require("../models/user_model");

// ✅ Like or Dislike a blog
route.post("/likeDislike/:blogId", checkAuth, async (req, res) => {
  try {
    const { blogId } = req.params;
    const { isLike } = req.body; // true or false

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found!" });
    }

    // ✅ Check if user already liked/disliked
    let likeDislike = await LikeDislike.findOne({
      blogId,
      userId: verify.userId,
    });

    if (likeDislike) {
      // If already same action, remove it (toggle off)
      if (likeDislike.isLike === isLike) {
        await LikeDislike.deleteOne({ _id: likeDislike._id });
        return res.status(200).json({
          message: isLike
            ? "Like removed successfully"
            : "Dislike removed successfully",
        });
      } else {
        // Update to new action (like -> dislike or dislike -> like)
        likeDislike.isLike = isLike;
        await likeDislike.save();
        return res.status(200).json({
          message: isLike
            ? "Changed to Like successfully"
            : "Changed to Dislike successfully",
        });
      }
    }

    // ✅ If not exists, create new like/dislike
    const newLikeDislike = new LikeDislike({
      blogId,
      userId: verify.userId,
      isLike,
    });
    await newLikeDislike.save();

    return res.status(201).json({
      message: isLike
        ? "Blog liked successfully!"
        : "Blog disliked successfully!",
      data: newLikeDislike,
    });
  } catch (err) {
    console.error("Error in likeDislike:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// Get blog with likes/dislikes count
route.get("/blogWithLikes/:blogId", checkAuth, async (req, res) => {
  try {
    const { blogId } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found!" });
    }

    const likes = await LikeDislike.countDocuments({ blogId, isLike: true });
    const dislikes = await LikeDislike.countDocuments({
      blogId,
      isLike: false,
    });

    // ✅ Check current user's status
    const userAction = await LikeDislike.findOne({
      blogId,
      userId: verify.userId,
    });

    return res.status(200).json({
      blog,
      likes,
      dislikes,
      userStatus: userAction
        ? userAction.isLike
          ? "liked"
          : "disliked"
        : "none",
    });
  } catch (err) {
    console.error("Error fetching blog with likes:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = route;
