const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  console.log("🔥 LOGIN ROUTE HIT");
  console.log("📥 Incoming Body:", req.body);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    console.log("🔍 User Found:", user);

    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("🔑 Password Match:", isMatch);

    if (!isMatch) {
      console.log("❌ Password incorrect");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login successful");

    res.json({ token });
  } catch (err) {
    console.log("💥 ERROR:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;