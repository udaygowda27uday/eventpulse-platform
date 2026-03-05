const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateToken = require("../middlewares/validateToken");

// ─── Validation helpers ───────────────────────────────────────────────────────

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password) => {
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/;
  return passwordRegex.test(password);
};

// ─── User Registration ────────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&#^()_+-=)",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({ name, email, password: hashedPassword });
    return res.status(200).json({ message: "User Registered Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ─── User Login ───────────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ token, message: "Login Successfull" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ─── User Logout ──────────────────────────────────────────────────────────────

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ─── Get Current User ─────────────────────────────────────────────────────────

router.get("/current-user", validateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ data: user, message: "User Fetched Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ─── Get All Users (Admin only) ───────────────────────────────────────────────

router.get("/get-all-users", validateToken, async (req, res) => {
  try {
    // Admin guard — only admins can view all users
    const requestingUser = await User.findById(req.user._id);
    if (!requestingUser || !requestingUser.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ data: users, message: "Users fetched successfully" });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// ─── Update Own Profile (Authenticated user updates their own details) ────────
// Users can only update their own name and email.
// They cannot change their own isAdmin status.

router.put("/update-profile", validateToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ message: "Provide at least one field to update (name or email)" });
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if the new email is already taken by another user
    if (email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (emailTaken) {
        return res.status(400).json({ message: "Email is already in use by another account" });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      req.user._id,   // Always use logged-in user's own ID — not from URL
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ data: user, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// ─── Admin: Toggle isAdmin status only ───────────────────────────────────────
// Admins can only change another user's isAdmin status (promote/demote).
// They CANNOT change name, email, or password of other users.

router.put("/update-user-role/:id", validateToken, async (req, res) => {
  try {
    // Admin guard
    const requestingUser = await User.findById(req.user._id);
    if (!requestingUser || !requestingUser.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own admin status" });
    }

    const { isAdmin } = req.body;
    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ message: "isAdmin must be a boolean value (true or false)" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      data: user,
      message: `User ${isAdmin ? "promoted to admin" : "demoted from admin"} successfully`,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// ─── Delete User (Admin only) ─────────────────────────────────────────────────

router.delete("/delete-user/:id", validateToken, async (req, res) => {
  try {
    // Admin guard
    const requestingUser = await User.findById(req.user._id);
    if (!requestingUser || !requestingUser.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;