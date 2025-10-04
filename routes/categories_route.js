const express = require("express");
const route = express.Router();
const blogCategories = require("../models/categories_model");
const checkAuth = require("../middleware/check_auth");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const blogUser = require("../models/user_model");

// POST: Add Blog Category
// http://localhost:3000/categories/blogCategories

route.post("/blogCategories", checkAuth, async (req, res) => {
  try {
    const { CategoriesTitle, imageUrl } = req.body;

    if (!CategoriesTitle) {
      return res.status(400).json({ message: "Title is required!" });
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

    // ✅ Check if category already exists (case-insensitive, same user)
    const existCategories = await blogCategories.findOne({
      CategoriesTitle: { $regex: new RegExp(`^${CategoriesTitle}$`, "i") },
      userId: verify.userId,
    });

    if (existCategories) {
      return res.status(400).json({ message: "Category already exists!" });
    }

    const newCategory = new blogCategories({
      _id: new mongoose.Types.ObjectId(),
      userId: verify.userId,
      CategoriesTitle: CategoriesTitle.trim(),
      imageUrl: imageUrl || "",
    });

    await newCategory.save();

    return res.status(201).json({
      message: "Category added successfully!",
      data: newCategory,
    });
  } catch (err) {
    console.error("Error while adding category:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});
/* route.post("/blogCategories", checkAuth, async (req, res) => {
  try {
    const { CategoriesTitle, imageUrl } = req.body;

    if (!CategoriesTitle) {
      return res.status(400).json({ message: "Title is required!" });
    }

    // ✅ check if category already exists (await is required)
    const existCategories = await blogCategories.findOne({
      CategoriesTitle: CategoriesTitle,
    });

    if (existCategories) {
      return res.status(400).json({ message: "Category already exists!" });
    }
    const token = req.headers.authorization.split(" ")[1];
    const varify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");
    // ✅ take userId from JWT (set in checkAuth middleware)
    const newCategory = new blogCategories({
      _id: new mongoose.Types.ObjectId(),
      userId: varify.userId, // from JWT payload
      CategoriesTitle: CategoriesTitle.trim(),
      imageUrl: imageUrl || "",
    });

    await newCategory.save();

    return res.status(201).json({
      message: "Category added successfully!",
      data: newCategory,
    });
  } catch (err) {
    console.error("Error while adding category:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
}); */

// POST: Add Blog Category
// http://localhost:3000/categories/blogCategories
/* route.post("/blogCategories", checkAuth, async (req, res) => {
  try {
    const { CategoriesTitle, imageUrl } = req.body;

    if (!CategoriesTitle) {
      return res.status(400).json({ message: "Title is required!" });
    }

    // ✅ check if category already exists
    const existCategories = await blogCategories.findOne({
      CategoriesTitle: CategoriesTitle,
      userId: req.user.userId, // uniqueness per user
    });

    if (existCategories) {
      return res.status(400).json({ message: "Category already exists!" });
    }

    // ✅ take userId from req.user (set in checkAuth middleware)
    const newCategory = new blogCategories({
      _id: new mongoose.Types.ObjectId(),
      userId: req.user.userId,
      CategoriesTitle,
      imageUrl: imageUrl || "",
    });

    await newCategory.save();

    return res.status(201).json({
      message: "Category added successfully!",
      data: newCategory,
    });
  } catch (err) {
    console.error("Error while adding category:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
}); */

// // get all categories
// // GET: All Blog Categories
route.get("/blogCategoriesAll", checkAuth, async (req, res) => {
  try {
    const allCategories = await blogCategories.find({}); // ✅ await is required

    if (allCategories.length === 0) {
      return res.status(404).json({ message: "No categories found!" });
    }

    return res.status(200).json({
      message: "All categories fetched successfully!",
      data: allCategories,
    });
  } catch (err) {
    console.error("Error while getting categories:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// GET: User-specific Blog Categories
// get categories by user id
route.get("/blogCategoriesByUserId", checkAuth, async (req, res) => {
  try {
    // ✅ Filter categories by userId from JWT

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");
    // ✅ Check if user exists and is not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    const userCategories = await blogCategories.find({
      userId: verify.userId,
    });

    if (userCategories.length === 0) {
      return res
        .status(404)
        .json({ message: "No categories found for this user!" });
    }

    return res.status(200).json({
      message: "User categories fetched successfully!",
      data: userCategories,
    });
  } catch (err) {
    console.error("Error while getting user categories:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// DELETE: Blog Category by ID  KOI BHI USER DELETE KR SKTA H
/* route.delete("/blogCategories/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ delete category
    const deletedCategory = await blogCategories.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found!" });
    }

    return res.status(200).json({
      message: "Category deleted successfully!",
      data: deletedCategory, // return deleted category details
    });
  } catch (err) {
    console.error("Error while deleting category:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
}); */

// DELETE: Blog Category by ID (Only creator can delete)
/* route.delete("/blogCategories/:id", checkAuth, async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ Find category first
    const category = await blogCategories.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }
    const token = req.headers.authorization.split(" ")[1];
    const varify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");
    // ✅ Check ownership
    // if (category.userId.toString() !== req.user.userId) {
    //   return res
    //     .status(403)
    //     .json({ message: "Not authorized to delete this category!" });
    // }
    if (category.userId.toString() !== varify.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this category!" });
    }

    // ✅ Delete if user is owner
    await blogCategories.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Category deleted successfully!",
      data: category,
    });
  } catch (err) {
    console.error("Error while deleting category:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});
 */

// DELETE: Blog Category by ID (Only creator can delete)

/* route.delete("/blogCategories/:id", checkAuth, async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ Find category first
    const category = await blogCategories.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const varify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Check ownership
    if (category.userId.toString() !== varify.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this category!" });
    }

    // ✅ Delete if user is owner (using deleteOne)
    // await blogCategories.deleteOne({ _id: id, userId: varify.userId });
    await blogCategories.deleteOne({ _id: id });

    return res.status(200).json({
      message: "Category deleted successfully!",
      data: category,
    });
  } catch (err) {
    console.error("Error while deleting category:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
}); */
route.delete("/blogCategories/:id", checkAuth, async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ Find category first
    const category = await blogCategories.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
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
    if (category.userId.toString() !== verify.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this category!" });
    }

    // ✅ Delete if user is owner
    const result = await blogCategories.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Category not available or already deleted!" });
    }

    return res.status(200).json({
      message: "Category deleted successfully!",
      data: category,
    });
  } catch (err) {
    console.error("Error while deleting category:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------ PATCH: Partial Update Blog Category ------------------
//  http://localhost:3000/categories/blogCategories/68e07e10899e82382da33bb7
route.patch("/blogCategories/:id", checkAuth, async (req, res) => {
  try {
    const { CategoriesTitle, imageUrl } = req.body;
    const id = req.params.id;

    if (!CategoriesTitle && !imageUrl) {
      return res
        .status(400)
        .json({ message: "At least one field (title or image) is required!" });
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

    // Find category
    const category = await blogCategories.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }

    // Check ownership
    if (category.userId.toString() !== verify.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this category!" });
    }

    // Partial update
    if (CategoriesTitle) category.CategoriesTitle = CategoriesTitle.trim();
    if (imageUrl) category.imageUrl = imageUrl;

    await category.save();

    return res.status(200).json({
      message: "Category updated successfully!",
      data: category,
    });
  } catch (err) {
    console.error("Error while updating category (PATCH):", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------ PATCH: Partial Update Blog Category ------------------
/* route.patch("/blogCategories/:id", checkAuth, async (req, res) => {
  try {
    const { CategoriesTitle, imageUrl } = req.body;
    const id = req.params.id;

    if (!CategoriesTitle && !imageUrl) {
      return res.status(400).json({
        message: "At least one field (title or image) is required!",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Check user exists and not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    // ✅ Prepare update object dynamically
    let updateFields = {};
    if (CategoriesTitle) updateFields.CategoriesTitle = CategoriesTitle.trim();
    if (imageUrl) updateFields.imageUrl = imageUrl;

    // ✅ Update using findOneAndUpdate
    const updatedCategory = await blogCategories.findOneAndUpdate(
      { _id: id, userId: verify.userId }, // condition with ownership
      updateFields,
      { new: true } // return updated document
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ message: "Category not found or not authorized!" });
    }

    return res.status(200).json({
      message: "Category updated successfully!",
      data: updatedCategory,
    });
  } catch (err) {
    console.error("Error while updating category (PATCH):", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
}); */

// ------------------ PUT: Full Update Blog Category ------------------
// route.put("/blogCategories/:id", checkAuth, async (req, res) => {
//   try {
//     const { CategoriesTitle, imageUrl } = req.body;
//     const id = req.params.id;

//     // Full update requires both fields
//     if (!CategoriesTitle || !imageUrl) {
//       return res.status(400).json({
//         message: "Both title and image are required for full update!",
//       });
//     }

//     const token = req.headers.authorization.split(" ")[1];
//     const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

//     // Check user exists and not deleted
//     const user = await blogUser.findById(verify.userId);
//     if (!user || user.isDeleted) {
//       return res
//         .status(403)
//         .json({ message: "User account is deleted or inactive!" });
//     }

//     // Find category
//     const category = await blogCategories.findById(id);
//     if (!category) {
//       return res.status(404).json({ message: "Category not found!" });
//     }

//     // Check ownership
//     if (category.userId.toString() !== verify.userId) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to update this category!" });
//     }

//     // Full update
//     category.CategoriesTitle = CategoriesTitle.trim();
//     category.imageUrl = imageUrl;

//     updateData = category({

//     })

//     await category.save();

//     return res.status(200).json({
//       message: "Category fully updated successfully!",
//       data: category,
//     });
//   } catch (err) {
//     console.error("Error while updating category (PUT):", err);
//     return res.status(500).json({ message: "Server Error: " + err.message });
//   }
// });

// ------------------ PUT: Full Update Blog Category ------------------
route.put("/blogCategories/:id", checkAuth, async (req, res) => {
  try {
    const { CategoriesTitle, imageUrl } = req.body;
    const id = req.params.id;

    // Full update requires both fields
    if (!CategoriesTitle || !imageUrl) {
      return res.status(400).json({
        message: "Both title and image are required for full update!",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Check user exists and not deleted
    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    // ✅ Update category directly (without $set)
    const updatedCategory = await blogCategories.findOneAndUpdate(
      { _id: id, userId: verify.userId }, // condition with ownership
      {
        CategoriesTitle: CategoriesTitle.trim(),
        imageUrl: imageUrl,
      },
      { new: true } // return updated doc
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ message: "Category not found or not authorized!" });
    }

    return res.status(200).json({
      message: "Category fully updated successfully!",
      data: updatedCategory,
    });
  } catch (err) {
    console.error("Error while updating category (PUT):", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

//localhost:3000/categories/blogCategories/68e07e10899e82382da33bb7/update
route.post("/blogCategories/:id/update", checkAuth, async (req, res) => {
  try {
    const { CategoriesTitle, imageUrl } = req.body;
    const id = req.params.id;

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    const user = await blogUser.findById(verify.userId);
    if (!user || user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted or inactive!" });
    }

    const category = await blogCategories.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found!" });

    if (category.userId.toString() !== verify.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this category!" });
    }

    if (CategoriesTitle) category.CategoriesTitle = CategoriesTitle.trim();
    if (imageUrl) category.imageUrl = imageUrl;

    await category.save();

    return res
      .status(200)
      .json({ message: "Category updated successfully!", data: category });
  } catch (err) {
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = route;
