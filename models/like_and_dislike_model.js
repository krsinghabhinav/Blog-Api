// models/likeDislike_model.js
const mongoose = require("mongoose");

const likeDislikeSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogUser",
      required: true,
    },
    isLike: {
      type: Boolean, // true = Like, false = Dislike
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Ensure a user can only have one entry per blog
likeDislikeSchema.index({ blogId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("LikeDislike", likeDislikeSchema);
