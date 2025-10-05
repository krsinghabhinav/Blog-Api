const mongoose = require("mongoose");

const blogCategoriesSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: String, required: true },
    CategoriesTitle: { type: String, required: true },
    imageUrl: { type: String },
    userName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blogCategories", blogCategoriesSchema);
