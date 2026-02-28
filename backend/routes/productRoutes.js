const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =======================
// MULTER CONFIG
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"), false);
    }
    cb(null, true);
  },
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
        quantity,
        biddingEnabled,
      } = req.body;

      if (!title || !price || !size || !gender || !category) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const product = await Product.create({
        title,
        description,
        price,
        size,
        gender,
        category,
        quantity: quantity ? Number(quantity) : 1,
        biddingEnabled: biddingEnabled === "true",
        isSold: false,
        images: req.file ? [req.file.filename] : [],
        seller: req.user._id,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

// =======================
// GET ALL PRODUCTS
// =======================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});


// =======================
// GET SELLER PRODUCTS
// =======================
router.get("/my-products", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch {
    res.status(500).json({ message: "Failed to fetch seller products" });
  }
});


// =======================
// PRODUCT RECOMMENDATIONS
// =======================
router.get("/recommend/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const recommendations = await Product.find({
      _id: { $ne: product._id },
      gender: product.gender,
      category: { $ne: product.category },
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.json(recommendations);
  } catch {
    res.status(500).json({ message: "Recommendation failed" });
  }
});


// =======================
// AI STYLIST CHAT RESPONSE (SMART CHAT)
// =======================
router.post("/stylist", async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message)
      return res.json({
        text: "Tell me what style you're looking for!",
        products: [],
      });

    const keywords = message.toLowerCase();

    let query = {};
    let text = "";

    // ---------- STYLE LOGIC ----------
    if (keywords.includes("party")) {
      text =
        "For a party look, try bold colors, fitted dresses, or stylish shirts with jackets. Add minimal accessories and clean shoes for a confident vibe.";

      query.category = {
        $regex: "dress|shirt|jacket",
        $options: "i",
      };
    }

    else if (
      keywords.includes("college") ||
      keywords.includes("casual")
    ) {
      text =
        "For college, keep it comfy and stylish — oversized tees, jeans, sneakers, or hoodies always work. Layering adds personality.";

      query.category = {
        $regex: "tshirt|jeans|hoodie",
        $options: "i",
      };
    }

    else if (keywords.includes("date")) {
      text =
        "For a date, keep it clean and confident. Neutral colors, well-fitted tops, and subtle accessories work best.";

      query.category = {
        $regex: "dress|shirt",
        $options: "i",
      };
    }

    else if (keywords.includes("winter")) {
      text =
        "Winter outfits shine with layering — hoodies, jackets, boots, and scarves give both warmth and style.";

      query.category = {
        $regex: "jacket|hoodie",
        $options: "i",
      };
    }

    else if (keywords.includes("summer")) {
      text =
        "Summer outfits should be breathable and light — cotton tees, shorts, and loose fits keep you stylish and cool.";

      query.category = {
        $regex: "tshirt|top",
        $options: "i",
      };
    }

    else {
      text =
        "Fashion tip: balance comfort and confidence. Neutral basics mixed with one standout piece always look great. Tell me where you're going or what vibe you want!";
    }

    // ---------- OPTIONAL PRODUCT SUGGESTIONS ----------
    let products = [];

    if (Object.keys(query).length > 0) {
      products = await Product.find(query)
        .limit(4)
        .sort({ createdAt: -1 });
    }

    res.json({
      text,
      products,
    });
  } catch {
    res.status(500).json({ message: "Stylist failed" });
  }
});



// =======================
// UPDATE PRODUCT
// =======================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      title,
      price,
      size,
      gender,
      description,
      category,
    } = req.body;

    product.title = title ?? product.title;
    product.price = price ?? product.price;
    product.size = size ?? product.size;
    product.gender = gender ?? product.gender;
    product.description = description ?? product.description;
    product.category = category ?? product.category;

    await product.save();
    res.json(product);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});


// =======================
// DELETE PRODUCT
// =======================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});


// =======================
// GET PRODUCT BY ID
// =======================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Not found" });

    res.json(product);
  } catch {
    res.status(500).json({ message: "Error loading product" });
  }
});

module.exports = router;
