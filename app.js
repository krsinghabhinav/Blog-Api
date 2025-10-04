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

const userRoute = require("./routes/user_route");
const categoriesRoutes = require("./routes/categories_route");
const blogRoutes = require("./routes/blog_route");
const reviewRoutes = require("./routes/review_routes");
const commentRoutes = require("./routes/commnet_route");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Routes
app.use("/user", userRoute);
app.use("/categories", categoriesRoutes);
app.use("/blog", blogRoutes);
app.use("/review", reviewRoutes);
app.use("/comment", commentRoutes);

module.exports = app;
