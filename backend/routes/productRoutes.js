const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =======================
// MULTER CONFIG
// =======================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// =======================
// UPLOAD PRODUCT
// =======================
router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        size,
        gender,
        category,
      } = req.body;

      if (!title || !price || !size || !gender) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      const product = await Product.create({
        title,
        description,
        price,
        size,
        gender,
        category,
        images: req.file ? [req.file.filename] : [],
        seller: req.user._id, // ✅ SAFE
      });

      res.status(201).json({
        message: "Product uploaded successfully",
        product,
      });
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =======================
// GET ALL PRODUCTS
// =======================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("FETCH PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
