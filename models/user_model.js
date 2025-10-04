// const mongoose = require("mongoose");

// const blogUserSchema = new mongoose.Schema(
//   {
//     _id: mongoose.Schema.Types.ObjectId,
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     userName: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//   },
//   { timestamps: true } // ✅ Correct option
// );

// module.exports = mongoose.model("blogUser", blogUserSchema);

const mongoose = require("mongoose");

const blogUserSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ Soft delete fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt
);

module.exports = mongoose.model("blogUser", blogUserSchema);
