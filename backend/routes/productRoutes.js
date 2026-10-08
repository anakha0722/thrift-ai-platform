const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const axios = require("axios");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const router = express.Router();


// ======================
// CLOUDINARY CONFIG
// ======================
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======================
// MULTER CONFIG
// ======================
const storage = multer.memoryStorage();

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

      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      // Upload image to Cloudinary
      const cloudinaryResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "rewear/products",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(req.file.buffer);
      });

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
        images: [cloudinaryResult.secure_url],
        seller: req.user._id,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      res.status(500).json({
        message: "Upload failed",
        error: error.message,
      });
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
      isSold: false,
      quantity: { $gt: 0 } // ✅ ensure stock exists
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.json(recommendations);
  } catch {
    res.status(500).json({ message: "Recommendation failed" });
  }
});


// =======================
// =======================
// CONTEXT-AWARE PRODUCT RANKING FOR AI STYLIST
// =======================
function scoreAndRankProducts(availableProducts, latestQuery = "", conversationHistory = "") {
  const q = (latestQuery || "").toLowerCase();
  const hist = (conversationHistory || "").toLowerCase();

  // Color keywords
  const colorList = [
    "black", "white", "blue", "red", "green", "olive", "pink", "grey", "gray", "cherry", "denim", "cream"
  ];
  const queryColors = colorList.filter((c) => q.includes(c));
  const historyColors = colorList.filter((c) => hist.includes(c));

  // Category intent
  const dressWords = [
    "dress", "dresses", "jumpsuit", "jumpsuits", "gown", "gowns", "frock", "one-piece", "romper"
  ];
  const topWords = [
    "top", "tops", "shirt", "shirts", "tshirt", "tshirts", "t-shirt", "t-shirts", "tee", "tees",
    "crop", "corset", "jacket", "jackets", "hoodie", "hoodies", "blouse", "topwear"
  ];
  const bottomWords = [
    "pants", "pant", "jeans", "jean", "trousers", "trouser", "bottom", "bottoms", "bottomwear",
    "shorts", "skirt", "skirts", "cargos", "cargo"
  ];

  const wantsDress = dressWords.some((w) => q.includes(w));
  const wantsTop = topWords.some((w) => q.includes(w));
  const wantsBottom = bottomWords.some((w) => q.includes(w));

  // Occasions / Styles
  const isFormalOrWedding =
    q.includes("wedding") || q.includes("reception") || q.includes("formal") ||
    q.includes("office") || q.includes("interview") || q.includes("elegant") || q.includes("cocktail");
  const isCasualOrCollege =
    q.includes("casual") || q.includes("college") || q.includes("campus") ||
    q.includes("everyday") || q.includes("daily") || q.includes("hangout");
  const isPartyOrDate =
    q.includes("party") || q.includes("night out") || q.includes("club") ||
    q.includes("date") || q.includes("dinner");
  const isStreetwear =
    q.includes("streetwear") || q.includes("urban") || q.includes("grunge") || q.includes("vintage");
  const isSummer =
    q.includes("summer") || q.includes("beach") || q.includes("sunny") || q.includes("vacation");

  // Gender intent
  const wantsMen = q.includes("men") || q.includes("man") || q.includes("guy") || q.includes("boy") || q.includes("male");
  const wantsWomen = q.includes("women") || q.includes("woman") || q.includes("girl") || q.includes("female") || q.includes("lady");

  // Query tokens
  const queryTokens = q.split(/[\s,.-]+/).filter((w) => w.length > 2);

  const ranked = availableProducts
    .map((p) => {
      let score = 0;
      const title = (p.title || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const gender = (p.gender || "").toLowerCase();

      // 1. Category Matching
      if (wantsDress) {
        if (cat === "dress") score += 60;
        else score -= 35;
      }
      if (wantsTop) {
        if (cat === "topwear") score += 50;
        else if (!wantsBottom && !wantsDress) score -= 25;
      }
      if (wantsBottom) {
        if (cat === "bottomwear") score += 50;
        else if (!wantsTop && !wantsDress) score -= 25;
      }

      // 2. Color Matching
      if (queryColors.length > 0) {
        const matchesQueryColor = queryColors.some(
          (c) => title.includes(c) || desc.includes(c)
        );
        if (matchesQueryColor) {
          score += 70;
        } else {
          const hasOtherColor = colorList.some(
            (c) => !queryColors.includes(c) && (title.includes(c) || desc.includes(c))
          );
          if (hasOtherColor) score -= 30;
        }
      } else if (historyColors.length > 0) {
        const matchesHistoryColor = historyColors.some(
          (c) => title.includes(c) || desc.includes(c)
        );
        if (matchesHistoryColor) score += 20;
      }

      // 3. Occasion / Style Affinity
      if (isFormalOrWedding) {
        if (cat === "dress") score += 40;
        if (title.includes("formal") || desc.includes("formal") || title.includes("buttoned shirt")) score += 40;
        if (title.includes("crop") || title.includes("t-shirt") || title.includes("tshirt") || title.includes("jeans")) score -= 35;
      }

      if (isCasualOrCollege) {
        if (title.includes("jeans") || title.includes("jacket") || title.includes("t-shirt") || title.includes("tshirt") || title.includes("crop")) score += 35;
        if (title.includes("formal") || desc.includes("laced")) score -= 20;
      }

      if (isPartyOrDate) {
        if (cat === "dress" || title.includes("corset") || desc.includes("laced") || title.includes("crop")) score += 35;
      }

      if (isStreetwear) {
        if (title.includes("jacket") || title.includes("wide leg") || title.includes("corset") || title.includes("crop") || title.includes("straight leg")) score += 35;
      }

      if (isSummer) {
        if (title.includes("crop") || title.includes("ruffle") || title.includes("dress") || title.includes("t-shirt") || title.includes("tshirt")) score += 30;
      }

      // 4. Gender Matching
      if (wantsMen) {
        if (gender === "men") score += 40;
        else if (gender === "unisex") score += 25;
        else if (gender === "women") score -= 50;
      } else if (wantsWomen) {
        if (gender === "women") score += 30;
        else if (gender === "unisex") score += 20;
        else if (gender === "men") score -= 50;
      }

      // 5. Keyword & Description match
      for (const token of queryTokens) {
        if (title.includes(token)) score += 20;
        if (desc.includes(token)) score += 15;
      }

      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score);

  // If top scores are all <= 0 (e.g. generic query), provide a balanced diverse mix
  if (!ranked[0] || ranked[0].score <= 0) {
    const dresses = availableProducts.filter((p) => p.category === "dress");
    const tops = availableProducts.filter((p) => p.category === "topwear");
    const bottoms = availableProducts.filter((p) => p.category === "bottomwear");
    const diverse = [];
    if (dresses.length > 0) diverse.push(dresses[0]);
    if (tops.length > 0) diverse.push(tops[0]);
    if (bottoms.length > 0) diverse.push(bottoms[0]);
    if (tops.length > 1) diverse.push(tops[1]);
    return diverse.slice(0, 4);
  }

  return ranked.slice(0, 4).map((item) => item.product);
}

// =======================
// AI STYLIST (HUGGINGFACE AI + CONTEXT-AWARE RECOMMENDATIONS)
// =======================
router.post("/stylist", async (req, res) => {
  try {
    let incomingMessages = req.body?.messages;

    // support single message format { message: "..." }
    if (!incomingMessages && req.body?.message) {
      incomingMessages = [{ role: "user", content: req.body.message }];
    }

    if (!incomingMessages || !Array.isArray(incomingMessages)) {
      incomingMessages = [];
    }

    // Normalize and clean messages
    const cleanMessages = incomingMessages
      .filter((m) => m && (m.content || m.text))
      .map((m) => ({
        role: m.role === "assistant" || m.type === "bot" ? "assistant" : "user",
        content: String(m.content || m.text).trim(),
      }))
      .filter((m) => m.content.length > 0);

    if (cleanMessages.length === 0) {
      return res.json({
        text: "Hey bestie ✨ tell me what outfit vibe you're going for today!",
        products: [],
      });
    }

    // Extract current user query and conversation history
    const lastUserMsgObj = cleanMessages
      .slice()
      .reverse()
      .find((m) => m.role === "user");
    const latestUserQuery = lastUserMsgObj ? lastUserMsgObj.content : "";
    const conversationHistory = cleanMessages.map((m) => m.content).join(" ");

    // Fetch actual available products from the database
    let availableProducts = [];
    try {
      availableProducts = await Product.find({
        isSold: false,
        quantity: { $gt: 0 },
      }).lean();
    } catch (dbErr) {
      console.warn("DB product fetch warning:", dbErr.message);
      availableProducts = [];
    }

    // Rank and select the most relevant products based on query & context
    const recommendedProducts = scoreAndRankProducts(
      availableProducts,
      latestUserQuery,
      conversationHistory
    );

    // Build product context for the AI prompt
    const productContext = recommendedProducts.length > 0
      ? `Curated ReWear thrift pieces selected for this look from our store:\n` +
      recommendedProducts
        .map(
          (p) =>
            `- ${p.title} (${p.category}${p.description ? ": " + p.description : ""}, ₹${p.price})`
        )
        .join("\n")
      : "";

    const systemPrompt = `You are a friendly, trendy Gen Z fashion stylist for an online thrift platform called ReWear.
Rules:
- Give a stylish, personalized outfit suggestion tailored to what the user asked for.
- Naturally recommend the available ReWear pieces listed below, explaining briefly why they fit the vibe.
- If the user asked for a specific item/color not in stock, highlight the selected close alternatives and explain why they make a great alternative.
- Keep response concise (4 to 6 lines max), upbeat, and casually stylish.
- End with ONE fun, engaging follow-up question.

${productContext}`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...cleanMessages.slice(-6),
    ];

    const apiKey = process.env.HF_API_KEY;
    const candidateModels = [
      "meta-llama/Llama-3.1-8B-Instruct",
      "meta-llama/Llama-3.3-70B-Instruct",
      "Qwen/Qwen2.5-72B-Instruct",
    ];

    let text = "";

    if (apiKey) {
      for (const model of candidateModels) {
        try {
          const response = await axios.post(
            "https://router.huggingface.co/v1/chat/completions",
            {
              model,
              messages: formattedMessages,
              temperature: 0.7,
              max_tokens: 350,
            },
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            }
          );

          text = response.data?.choices?.[0]?.message?.content?.trim();
          if (text) break;
        } catch (hfErr) {
          console.warn(
            `HF model ${model} error:`,
            hfErr.response?.data?.error?.message || hfErr.response?.data?.error || hfErr.message
          );
        }
      }
    }

    if (!text) {
      const titles = recommendedProducts.map((p) => p.title).join(", ");
      const qLower = latestUserQuery.toLowerCase();

      if (qLower.includes("dress") || qLower.includes("wedding") || qLower.includes("party")) {
        text = `For this look, you'll stun in our curated ReWear pieces: ${titles}! Pair them with clean footwear, dainty layered jewelry, and a sleek bag for an elevated vibe.\n\nWhat kind of accessories or footwear are you planning to pair it with?`;
      } else if (qLower.includes("college") || qLower.includes("casual")) {
        text = `For an effortless casual aesthetic, check out ${titles}! Style with comfy retro sneakers and an everyday tote bag for a relaxed, chic vibe.\n\nDo you want to layer this with a jacket or keep it lightweight?`;
      } else {
        text = `Here's a fresh outfit idea featuring our ReWear thrift pieces: ${titles}! Mix and match with clean basics for an effortless everyday look.\n\nWhat occasion or vibe are you styling for today?`;
      }
    }

    return res.json({
      text,
      products: recommendedProducts,
    });
  } catch (err) {
    console.error("Stylist error:", err.response?.data || err.message);
    return res.json({
      text: "Fashion tip: Mix neutral basics with one standout statement piece (like a bold jacket or fresh sneakers) and simple accessories! What vibe are you aiming for today?",
      products: [],
    });
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
    const product = await Product.findById(req.params.id)
      .populate("seller", "name email");

    if (!product)
      return res.status(404).json({ message: "Not found" });

    res.json(product);
  } catch {
    res.status(500).json({ message: "Error loading product" });
  }
});

module.exports = router;