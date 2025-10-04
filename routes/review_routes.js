const express = require("express");
const route = express.Router();
const Review = require("../models/review_model");
const Blog = require("../models/bolg_model");
const blogUser = require("../models/user_model");
const checkAuth = require("../middleware/check_auth");
const jwt = require("jsonwebtoken");

// ⭐ Add Review
route.post("/addReview", checkAuth, async (req, res) => {
  try {
    const { rating, comment, blogId } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5!" });
    }
    if (!blogId) {
      return res.status(400).json({ message: "BlogId is required!" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // User check
    const user = await blogUser.findById(verify.userId);
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.isDeleted)
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });

    // Blog check
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found!" });

    // Prevent multiple reviews by same user
    const existingReview = await Review.findOne({
      blogId,
      userId: verify.userId,
    });
    if (existingReview)
      return res
        .status(400)
        .json({ message: "You have already reviewed this blog!" });

    // Create new review
    const newReview = new Review({
      userId: verify.userId,
      userName: `${user.firstName} ${user.lastName}`,
      blogId: blogId,
      rating: rating,
      comment: comment || "",
    });

    await newReview.save();

    return res.status(201).json({
      message: "Review added successfully!",
      data: newReview,
    });
  } catch (err) {
    console.error("Error adding review:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// GET: Get all reviews of a blog
route.get("/getreviews/:id", checkAuth, async (req, res) => {
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

    // Fetch all reviews for the blog
    const reviews = await Review.find({ blogId })
      .populate("userId", "firstName lastName userName")
      .sort({ createdAt: -1 });

    if (!reviews || reviews.length === 0)
      return res
        .status(404)
        .json({ message: "No reviews found for this blog!" });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    return res.status(200).json({
      message: "Reviews fetched successfully!",
      data: reviews,
      averageRating: avgRating.toFixed(1),
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// PATCH: Update Review (only by review owner)
route.patch("/updateReview/:id", checkAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // Check if user exists
    const user = await blogUser.findById(verify.userId);
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.isDeleted)
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found!" });

    // Ownership check
    if (review.userId.toString() !== verify.userId)
      return res
        .status(403)
        .json({ message: "Not authorized to update this review!" });

    // Update
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    return res.status(200).json({
      message: "Review updated successfully!",
      data: review,
    });
  } catch (err) {
    console.error("Error updating review:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// DELETE: Delete Review (only by review owner)
route.delete("/deleteReview/:id", checkAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // Check if user exists
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted)
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found!" });

    // Ownership check
    if (review.userId.toString() !== verify.userId)
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review!" });

    await Review.deleteOne({ _id: reviewId });

    return res.status(200).json({ message: "Review deleted successfully!" });
  } catch (err) {
    console.error("Error deleting review:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// POST: Get all reviews of a blog using blogId in body
route.post("/getreviews", checkAuth, async (req, res) => {
  try {
    const { blogId } = req.body;
    if (!blogId) {
      return res.status(400).json({ message: "blogId is required!" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // Check if logged-in user exists
    const user = await blogUser.findById(verify.userId);
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.isDeleted)
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });

    // Fetch all reviews for the blog
    const reviews = await Review.find({ blogId })
      .populate("userId", "firstName lastName userName")
      .sort({ createdAt: -1 });

    if (!reviews || reviews.length === 0)
      return res
        .status(404)
        .json({ message: "No reviews found for this blog!" });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    return res.status(200).json({
      message: "Reviews fetched successfully!",
      data: reviews,
      averageRating: avgRating.toFixed(1),
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});
module.exports = route;
