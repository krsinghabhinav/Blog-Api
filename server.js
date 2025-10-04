// const express = require("express");
// const app = require("./app");
// const mongoose = require("mongoose");
// const cron = require("node-cron");
// const blogUser = require("./models/user_model"); // ✅ Import your user model

// const PORT = process.env.PORT || 3000;
// mongoose
//   .connect(
//     "mongodb+srv://aksingh2000:aksingh2000@contactproject.f400bt3.mongodb.net/?retryWrites=true&w=majority&appName=contactproject"
//   )
//   .then(() => {
//     console.log("Connected to MongoDB........Done");
//   })
//   .catch((err) => {
//     console.error("Failed to connect to MongoDB", err);
//   });

// // ------------------- Cron Job for Permanent Delete -------------------
// cron.schedule("0 0 * * *", async () => {
//   // every day at midnight
//   try {
//     const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

//     const result = await blogUser.deleteMany({
//       isDeleted: true,
//       deletedAt: { $lte: tenDaysAgo },
//     });

//     console.log(`Permanent deleted users: ${result.deletedCount}`);
//   } catch (err) {
//     console.error("Error in cron job for deleting users:", err);
//   }
// });
// app.listen(PORT, () => {
//   console.log(`Server is running on port http://localhost:${PORT}`);
// });
const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const blogUser = require("./models/user_model");
require("dotenv").config();

const app = require("./app");
const PORT = process.env.PORT || 3000;

// ✅ Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => console.error("❌ MongoDB Connection Error:", err));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Cron Job: permanently delete users after 10 days
cron.schedule("0 0 * * *", async () => {
  try {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const result = await blogUser.deleteMany({
      isDeleted: true,
      deletedAt: { $lte: tenDaysAgo },
    });
    console.log(`🧹 Deleted ${result.deletedCount} users`);
  } catch (err) {
    console.error("Error in cron job:", err);
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
