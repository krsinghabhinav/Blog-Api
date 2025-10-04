const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, trim: true, required: true },
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "blogUser", required: true }
    blogId: { type: String, trim: true, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
