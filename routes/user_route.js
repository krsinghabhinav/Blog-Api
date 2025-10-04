const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const blogUser = require("../models/user_model");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check_auth");
// http://localhost:3000/user/signup
// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, userName, email, password } = req.body;

    // 1. Check required fields
    if (!firstName || !lastName || !userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // 2. Password validation
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long!" });
    }

    // 3. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address!" });
    }

    // 4. Check if email already exists
    // const existingUser = await blogUser.findOne({ email });
    const existingUser = await blogUser.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create new user
    const newUser = new blogUser({
      _id: new mongoose.Types.ObjectId(),
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
    });

    // 7. Save to DB
    await newUser.save();

    // 8. Send response
    res.status(201).json({
      message: "User registered successfully!",
      user: newUser,
      //   user: {
      //     id: newUser._id,
      //     firstName: newUser.firstName,
      //     lastName: newUser.lastName,
      //     userName: newUser.userName,
      //     email: newUser.email,
      //     createdAt: newUser.createdAt,
      //   },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

//http://localhost:3000/user/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required!" });
    }

    // 2. Find user by email
    const user = await blogUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // ✅ Check if account is soft deleted
    if (user.isDeleted) {
      return res.status(403).json({
        message:
          "Your account is marked for deletion and cannot login. It will be permanently deleted after 10 days.",
      });
    }
    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
      },
      "yourSecretKey", // 🔐 use process.env.JWT_SECRET in production
      { expiresIn: "365d" }
    );

    // 5. Send response
    res.status(200).json({
      message: "User login successfully!",
      token,
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------- Forgot Password -------------------
// http://localhost:3000/user/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    const user = await blogUser.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email!" });
    }

    // ✅ Check if account is soft deleted
    if (user.isDeleted) {
      return res.status(403).json({
        message:
          "Your account is marked for deletion and cannot reset password. It will be permanently deleted after 10 days.",
      });
    }

    // ✅ Generate reset token (short expiry)

    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "yourSecretKey",
      { expiresIn: "1m" } // 15 minutes valid
    );

    // In real app → send via email. Here we return it in response.
    return res.status(200).json({
      message: "Password reset token generated!",
      resetToken,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------- Update Password -------------------
// http://localhost:3000/user/update-password

router.post("/update-password", checkAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required!" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long!" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const varify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");
    // ✅ Find user from JWT
    // const user = await blogUser.findById(req.user.userId);
    const user = await blogUser.findById(varify.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    // ✅ Prevent soft-deleted users from updating password
    if (user.isDeleted) {
      return res.status(403).json({
        message:
          "Your account is marked for deletion and cannot update password.",
      });
    }

    // ✅ Hash new password directly (old password check removed)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------- Delete Account -------------------
// http://localhost:3000/user/delete-account
router.delete("/delete-account", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const varify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Find user
    const user = await blogUser.findById(varify.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // ✅ Check if already soft deleted
    if (user.isDeleted) {
      return res.status(400).json({
        message:
          "Your account is already marked for deletion. It will be permanently deleted after 10 days.",
      });
    }

    // ✅ Soft delete user (set isDeleted and deletedAt)
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    return res.status(200).json({
      message:
        "Your account has been marked for deletion. It will be permanently deleted after 10 days.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error: " + err.message,
    });
  }
});

// ------------------- Get User Details -------------------
// http://localhost:3000/user/userDetail
router.get("/userDetail", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    const user = await blogUser.findById(verify.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // ✅ Soft delete check
    if (user.isDeleted) {
      return res.status(403).json({
        message:
          "Your account is marked for deletion and cannot access details. It will be permanently deleted after 10 days.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------- Update User (POST) -------------------
// Not recommended for updates, but possible
// http://localhost:3000/user/update-user
router.post("/update-user", checkAuth, async (req, res) => {
  try {
    const { firstName, lastName, userName } = req.body; // Removed email

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Find user
    const user = await blogUser.findById(verify.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // ✅ Prevent updating if soft deleted
    if (user.isDeleted) {
      return res.status(403).json({
        message: "Cannot update. Account is deleted or inactive.",
      });
    }

    // ✅ Update only if this is the same user
    if (user._id.toString() !== verify.userId) {
      return res.status(403).json({
        message: "Not authorized to update this user!",
      });
    }

    // ✅ Update allowed fields only
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (userName) user.userName = userName.trim();

    await user.save();

    return res.status(200).json({
      message: "User updated successfully!",
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------- Get User By ID -------------------
// http://localhost:3000/user/68e083c2250a6c71a7c9b995
router.get("/:id", checkAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Authorization check: only self can fetch details
    if (verify.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this user!" });
    }

    const user = await blogUser.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.isDeleted) {
      return res.status(403).json({
        message: "This account is deleted and cannot be accessed.",
      });
    }

    return res.status(200).json({ message: "User fetched successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------- Update User (PATCH - Partial Update) -------------------
//http://localhost:3000/user/update-user/68e083c2250a6c71a7c9b995
router.patch("/update-user/:id", checkAuth, async (req, res) => {
  try {
    const { firstName, lastName, userName } = req.body; // remove email
    const userId = req.params.id;

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Authorization check
    if (verify.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user!" });
    }

    const user = await blogUser.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(403).json({
        message: "Cannot update. Account is deleted or inactive.",
      });
    }

    // ✅ Update only allowed fields
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (userName) user.userName = userName.trim();

    await user.save();

    return res
      .status(200)
      .json({ message: "User updated successfully!", user });
  } catch (err) {
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ------------------- Update User (PUT - Full Update) -------------------
router.put("/update-user/:id", checkAuth, async (req, res) => {
  try {
    const { firstName, lastName, userName } = req.body; // remove email
    const userId = req.params.id;

    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Authorization check
    if (verify.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user!" });
    }

    if (!firstName || !lastName || !userName) {
      return res
        .status(400)
        .json({ message: "All fields are required for PUT." });
    }

    const user = await blogUser.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(403).json({
        message: "Cannot update. Account is deleted or inactive.",
      });
    }

    // ✅ Update only allowed fields
    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.userName = userName.trim();

    await user.save();

    return res
      .status(200)
      .json({ message: "User fully updated successfully!", user });
  } catch (err) {
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

/* router.delete("/delete-account", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const varify = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    // ✅ Find user
    const user = await blogUser.findById(varify.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // ✅ Delete account
    const result = await blogUser.deleteOne({ _id: varify.userId });

    if (result.deletedCount === 0) {
      return res.status(400).json({ message: "Failed to delete account!" });
    }

    return res.status(200).json({
      message: "Account deleted successfully!",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error: " + err.message,
    });
  }
}); */

/* router.post("/update-password", checkAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new password required!" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long!" });
    }

    // ✅ Find user from JWT
    const user = await blogUser.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // ✅ Check old password match
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect!" });
    }

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
}); */

module.exports = router;
