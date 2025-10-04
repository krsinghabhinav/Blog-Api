const express = require("express");
const route = express.Router();
const Comment = require("../models/comment_model");
const checkAuth = require("../middleware/check_auth");
const jwt = require("jsonwebtoken");
const blogUser = require("../models/user_model");
const Blog = require("../models/bolg_model"); // fixed naming
const { mongo, default: mongoose } = require("mongoose");

// ✅ Add Comment API
route.post("/addComment", checkAuth, async (req, res) => {
  try {
    const { comment, blogId } = req.body;

    // Validation
    if (!comment || !blogId) {
      return res.status(400).json({
        message: "Comment and blogId are required!",
      });
    }

    // ✅ Decode token
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Check user exists and not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    if (user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    // ✅ Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found!" });
    }

    const exitingComment = await Comment.findOne({
      blogId,
      userId: verify.userId,
    });
    if (exitingComment)
      return res
        .status(400)
        .json({ message: "You have already comment this blog!" });
    // ✅ Save comment
    const newComment = new Comment({
      _id: new mongoose.Types.ObjectId(),
      userId: verify.userId,
      userName: verify.firstName + " " + verify.lastName,
      comment: comment,
      blogId: blogId,
    });

    await newComment.save();

    return res.status(201).json({
      message: "Comment added successfully!",
      data: newComment,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// POST: Get all comments of a blog using blogId in body
route.post("/getComments", checkAuth, async (req, res) => {
  try {
    const { blogId } = req.body;

    // Validation
    if (!blogId) {
      return res.status(400).json({ message: "blogId is required!" });
    }

    // Decode token
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // Check if user exists and not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.isDeleted)
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });

    // Fetch all comments for the blog
    const comments = await Comment.find({ blogId })
      .populate("userId", "firstName lastName userName") // show commenter info
      .sort({ createdAt: -1 });

    if (!comments || comments.length === 0)
      return res
        .status(404)
        .json({ message: "No comments found for this blog!" });

    return res.status(200).json({
      message: "Comments fetched successfully!",
      data: comments,
      totalComments: comments.length,
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});
// GET: Get all comment of a blog
route.get("/getComments/:id", checkAuth, async (req, res) => {
  try {
    const blogId = req.params.id;

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // Check if logged-in user exists
    const user = await blogUser.findById(verify.userId);
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.isDeleted)
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });

    const comment = await Comment.find({ blogId })
      .populate("userId", "firstName lastName userName, comment")
      .sort({ createdAt: -1 });

    if (!comment || comment.length === 0)
      return res
        .status(404)
        .json({ message: "No comment found for this blog!" });

    return res.status(200).json({
      message: "Comment fetched successfully!",
      data: comment,
    });
  } catch (err) {
    console.error("Error fetching comment:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// PATCH: Update comment (only by comment owner)
route.patch("/updateComment/:id", checkAuth, async (req, res) => {
  try {
    const commentId = req.params.id;
    const { comment } = req.body;

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // Check if user exists
    const user = await blogUser.findById(verify.userId);
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.isDeleted)
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });

    // Find comment
    const commentObj = await Comment.findById(commentId);
    if (!commentObj)
      return res.status(404).json({ message: "Comment not found!" });

    // Ownership check
    if (commentObj.userId.toString() !== verify.userId)
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment!" });

    // Update
    if (comment !== undefined) commentObj.comment = comment;

    await commentObj.save();

    return res.status(200).json({
      message: "Comment updated successfully!",
      data: commentObj,
    });
  } catch (err) {
    console.error("Error updating comment:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// DELETE: Delete comment (only by comment owner)
route.delete("/deleteComment/:id", checkAuth, async (req, res) => {
  try {
    const commentId = req.params.id;

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // Check if user exists
    const user = await blogUser.findById(verify.userId);
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.isDeleted)
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });

    // Find comment
    const commentDoc = await Comment.findById(commentId);
    if (!commentDoc)
      return res.status(404).json({ message: "Comment not found!" });

    // Ownership check
    if (commentDoc.userId.toString() !== verify.userId)
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment!" });

    await commentDoc.deleteOne();

    return res.status(200).json({ message: "Comment deleted successfully!" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = route;
