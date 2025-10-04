const mongoose = require("mongoose");

const blogCommentSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    comment: { type: String, required: true },
    blogId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blogComment", blogCommentSchema);
