const express = require("express");
const Complaint = require("../models/Complaint");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE COMPLAINT
router.post("/", protect, async (req, res) => {
  try {
    const complaint = await Complaint.create({
      user: req.user.id,
      title: req.body.title,
      description: req.body.description,
    });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET USER COMPLAINTS
router.get("/my", protect, async (req, res) => {
  const complaints = await Complaint.find({ user: req.user.id });
  res.json(complaints);
});

// ADMIN: GET ALL
router.get("/", protect, adminOnly, async (req, res) => {
  const complaints = await Complaint.find().populate("user", "name email");
  res.json(complaints);
});

// UPDATE STATUS (ADMIN)
router.put("/:id", protect, adminOnly, async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ msg: "Not found" });
  }

  complaint.status = req.body.status || complaint.status;
  await complaint.save();

  res.json(complaint);
});

module.exports = router;