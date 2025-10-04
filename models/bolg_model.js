// const mongoose = require("mongoose");

// const blogSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "blogUser",
//       required: true,
//     },
//     Title: { type: String, required: true, trim: true },
//     imageUrl: { type: String, trim: true },
//     CategoryTitle: { type: String, required: true, trim: true },
//     CategoryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "blogCategories",
//       required: true,
//     },
//     CategoryDescription: { type: String, required: true, trim: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Blog", blogSchema);

const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    userId: { type: String, trim: true },
    Title: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    CategoryTitle: { type: String, required: true, trim: true },
    CategoryId: { type: String, trim: true },
    CategoryDescription: { type: String, required: true, trim: true },
    userName: { type: String, required: true, trim: true },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
