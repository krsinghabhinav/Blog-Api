// const express = require("express");
// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// const userRoute = require("./routes/user_route");
// const categoriesRoutes = require("./routes/categories_route");
// const blogRoutes = require("./routes/blog_route");
// const reviewRoutes = require("./routes/review_routes");
// const commentRoutes = require("./routes/commnet_route");

// app.use("/user", userRoute);
// app.use("/categories", categoriesRoutes);
// app.use("/blog", blogRoutes);
// app.use("/review", reviewRoutes);
// app.use("/comment", commentRoutes);

// // app.use("*", (req, res) => {
// //   res.status(200).json({ message: "Bad request!!!" });
// // });

// module.exports = app;
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const fileUpload = require("express-fileupload");

// Routes
const userRoute = require("./routes/user_route");
const categoriesRoutes = require("./routes/categories_route");
const blogRoutes = require("./routes/blog_route");
const reviewRoutes = require("./routes/review_routes");
const commentRoutes = require("./routes/commnet_route");

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI) // simplified for Mongoose 6+
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/user", userRoute);
app.use("/categories", categoriesRoutes);
app.use("/blog", blogRoutes);
app.use("/review", reviewRoutes);
app.use("/comment", commentRoutes);

// Optional: handle undefined routes
// app.use("*", (req, res) => {
//   res.status(404).json({ message: "Route not found!" });
// });

module.exports = app;
