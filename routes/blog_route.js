const express = require("express");
const route = express.Router();
const Blog = require("../models/bolg_model");
const checkAuth = require("../middleware/check_auth");
const jwt = require("jsonwebtoken");
const blogUser = require("../models/user_model");
const cloudinary = require("cloudinary").v2;
const Category = require("../models/categories_model");
cloudinary.config({
  cloud_name: "dyit1jjef",
  api_key: "743564427533897",
  api_secret: "TR9TvJlNF5Blp6AcyZ0plQ0kqkQ",
});
// POST: Add new Blog
// http://localhost:3000/blog/addBlog
/* route.post("/addBlog", checkAuth, async (req, res) => {
  try {
    const {
      Title,
      imageUrl,
      CategoryTitle,
      CategoryId,
      CategoryDescription,
      userName,
    } = req.body;
    const file = req.files?.image;
    // ✅ Validate required fields
    if (
      !Title ||
      !CategoryTitle ||
      !CategoryId ||
      !CategoryDescription ||
      userName
    ) {
      return res.status(400).json({
        message:
          "All required fields (Title, CategoryTitle, CategoryId, CategoryDescription) must be provided!",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath);

    // ✅ Check if user exists and is not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    const exitstBlog = await Blog.findOne({
      Title: { $regex: new RegExp(`^${Title}$`, "i") },
      userId: verify.userId,
    });
    if (exitstBlog) {
      return res.status(400).json({ message: "Blog already exists!" });
    }
    // ✅ Create new Blog
    const newBlog = new Blog({
      userId: verify.userId, // assign current user as owner
      Title: Title.trim(),
      imageUrl: result.secure_url || "",
      CategoryTitle: CategoryTitle.trim(),
      CategoryId: CategoryId,
      CategoryDescription: CategoryDescription.trim(),
      userName: verify.firstName + " " + verify.lastName,
    });

    await newBlog.save();

    return res.status(201).json({
      message: "Blog added successfully!",
      Blog: newBlog,
    });
  } catch (err) {
    console.error("Error while adding Blog:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
}); */

/* route.post("/addBlog", checkAuth, async (req, res) => {
  try {
    const { Title, CategoryTitle, CategoryId, CategoryDescription } = req.body;
    const file = req.files?.image;

    // ✅ Validate required fields
    if (!Title || !CategoryTitle || !CategoryId || !CategoryDescription) {
      return res.status(400).json({
        message:
          "All required fields (Title, CategoryTitle, CategoryId, CategoryDescription) must be provided!",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Check if user exists and is not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    // ✅ Check if blog with same Title already exists for this user
    const existBlog = await Blog.findOne({
      Title: Title, // case-insensitive
      userId: verify.userId,
    });

    if (existBlog) {
      return res
        .status(400)
        .json({ message: `Blog with title "${Title}" already exists!` });
    }

    // ✅ Upload image only if file is provided
    let imageUrl = "";
    if (file) {
      const result = await cloudinary.uploader.upload(file.tempFilePath);
      imageUrl = result.secure_url;
    }

    // ✅ Create new Blog
    const newBlog = new Blog({
      userId: verify.userId, // assign current user as owner
      Title: Title.trim(),
      imageUrl: imageUrl,
      CategoryTitle: CategoryTitle.trim(),
      CategoryId: CategoryId,
      CategoryDescription: CategoryDescription.trim(),
      userName: verify.firstName + " " + verify.lastName,
    });

    await newBlog.save();

    return res.status(201).json({
      message: "Blog added successfully!",
      Blog: newBlog,
    });
  } catch (err) {
    console.error("Error while adding Blog:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});
 */
route.post("/addBlog", checkAuth, async (req, res) => {
  try {
    const { Title, CategoryTitle, CategoryId, CategoryDescription } = req.body;
    const file = req.files?.image;

    // ✅ Validate required fields
    if (!Title || !CategoryTitle || !CategoryId || !CategoryDescription) {
      return res.status(400).json({
        message:
          "All required fields (Title, CategoryTitle, CategoryId, CategoryDescription) must be provided!",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Check if user exists and is not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    // ✅ Check if blog with same Title already exists (case-insensitive)
    const existBlog = await Blog.findOne({
      Title: { $regex: new RegExp(`^${Title}$`, "i") },
      userId: verify.userId,
    });

    if (existBlog) {
      return res
        .status(400)
        .json({ message: `Blog with title "${Title}" already exists!` });
    }

    // ✅ Check if Category exists for this user
    const catTitle = await Category.findOne({
      CategoriesTitle: CategoryTitle,
      userId: verify.userId,
    });

    if (!catTitle) {
      return res.status(400).json({
        message: `Category "${CategoryTitle}" does not exist for this user!`,
      });
    }

    // ✅ Upload image only if file is provided
    let imageUrl = "";
    if (file) {
      const result = await cloudinary.uploader.upload(file.tempFilePath);
      imageUrl = result.secure_url;
    }

    // ✅ Create new Blog
    const newBlog = new Blog({
      userId: verify.userId, // assign current user as owner
      Title: Title.trim(),
      imageUrl: imageUrl,
      CategoryTitle: CategoryTitle.trim(),
      CategoryId: CategoryId,
      CategoryDescription: CategoryDescription.trim(),
      userName: verify.firstName + " " + verify.lastName,
    });

    await newBlog.save();

    return res.status(201).json({
      message: "Blog added successfully!",
      Blog: newBlog,
    });
  } catch (err) {
    console.error("Error while adding Blog:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// GET: Fetch all blogs (no login required)
route.get("/getAllBlogs", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 }); // latest blogs first

    if (!allBlogs || allBlogs.length === 0) {
      return res.status(404).json({ message: "No blogs found!" });
    }

    return res.status(200).json({
      message: "All blogs fetched successfully!",
      data: allBlogs,
    });
  } catch (err) {
    console.error("Error while fetching blogs:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// GET: Fetch all blogs (no login required)
route.get("/getAllBlogs", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 }); // latest blogs first

    if (!allBlogs || allBlogs.length === 0) {
      return res.status(404).json({ message: "No blogs found!" });
    }

    return res.status(200).json({
      message: "All blogs fetched successfully!",
      data: allBlogs,
    });
  } catch (err) {
    console.error("Error while fetching blogs:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------- Get all blogs of logged-in user -------------------
// GET: http://localhost:3000/blog/getBlogUserLoggedIn
route.get("/getBlogUserLoggedIn", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Check if user exists and is not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    // ✅ Fetch only blogs of this logged-in user
    const allBlogs = await Blog.find({ userId: verify.userId }).sort({
      createdAt: -1,
    });

    if (!allBlogs || allBlogs.length === 0) {
      return res.status(404).json({ message: "No blogs found!" });
    }

    return res.status(200).json({
      message: "All blogs fetched successfully!",
      data: allBlogs,
    });
  } catch (err) {
    console.error("Error while fetching blogs:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

route.delete("/:id", checkAuth, async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ Find blog first
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found!" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Check if user exists and is not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    // ✅ Check ownership
    if (blog.userId.toString() !== verify.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this blog!" });
    }

    // ✅ Delete the blog
    await blog.deleteOne();
    // await Blog.deleteOne({ _id: id });

    return res.status(200).json({
      message: "Blog deleted successfully!",
      data: blog, // return the deleted blog info
    });
  } catch (err) {
    console.error("Error while deleting Blog:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});
// ------------------ PUT: Full Update Blog  ------------------
route.put("/updateBlog/:id", checkAuth, async (req, res) => {
  try {
    const { Title, imageUrl, CategoryTitle, CategoryId, CategoryDescription } =
      req.body;
    const id = req.params.id;

    // ✅ Validate required fields
    if (!Title || !CategoryTitle || !CategoryId || !CategoryDescription) {
      return res.status(400).json({
        message:
          "All required fields (Title, CategoryTitle, CategoryId, CategoryDescription) must be provided for full update!",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Check if user exists and is not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    // ✅ Update blog directly, only if user owns it
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: id, userId: verify.userId },
      {
        Title: Title.trim(),
        imageUrl: imageUrl || "",
        CategoryTitle: CategoryTitle.trim(),
        CategoryId: CategoryId,
        CategoryDescription: CategoryDescription.trim(),
      },
      { new: true } // return updated document
    );

    if (!updatedBlog) {
      return res.status(404).json({
        message: "Blog not found or you are not authorized to update it!",
      });
    }

    return res.status(200).json({
      message: "Blog fully updated successfully!",
      data: updatedBlog,
    });
  } catch (err) {
    console.error("Error while updating Blog (PUT):", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------ PATCH: Partial Update Blog ------------------
route.patch("/updateBlog/:id", checkAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const { Title, imageUrl, CategoryTitle, CategoryId, CategoryDescription } =
      req.body;

    // Check if at least one field is provided
    if (
      !Title &&
      !imageUrl &&
      !CategoryTitle &&
      !CategoryId &&
      !CategoryDescription
    ) {
      return res.status(400).json({
        message:
          "At least one field (Title, imageUrl, CategoryTitle, CategoryId, CategoryDescription) must be provided for partial update!",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // Check user exists and not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }
    const updateData = await Blog.findById(id);
    if (!updateData) {
      return res.status(404).json({ message: "Blog not found!" });
    }
    // Check ownership
    if (updateData.userId.toString() !== verify.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this category!" });
    }
    // Build update object dynamically
    // const updateData = {};
    if (Title) updateData.Title = Title.trim();
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (CategoryTitle) updateData.CategoryTitle = CategoryTitle.trim();
    if (CategoryId) updateData.CategoryId = CategoryId;
    if (CategoryDescription)
      updateData.CategoryDescription = CategoryDescription.trim();

    // // Update blog if user owns it
    // const updatedBlog = await Blog.findOneAndUpdate(
    //   { _id: id, userId: verify.userId },
    //   updateData,
    //   { new: true }
    // );

    // if (!updatedBlog) {
    //   return res.status(404).json({
    //     message: "Blog not found or you are not authorized to update it!",
    //   });
    // }
    await updateData.save();
    return res.status(200).json({
      message: "Blog updated successfully!",
      data: updateData,
    });
  } catch (err) {
    console.error("Error while updating Blog (PATCH):", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});
// ✅ Get Blogs by Category
route.get("/getByCategory/:id", checkAuth, async (req, res) => {
  try {
    const categoryId = req.params.id;

    // ✅ User from checkAuth middleware
    const userId = req.user.userId;
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");
    // ✅ Check user exists and not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    if (user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    // ✅ Fetch blogs by category
    const blogs = await Blog.find({ CategoryId: categoryId }).sort({
      createdAt: -1,
    });

    if (!blogs || blogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No Blogs found in this category!" });
    }

    return res.status(200).json({
      message: "Blogs fetched by category successfully!",
      data: blogs,
    });
  } catch (err) {
    console.error("Error fetching blogs by category:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = route;
