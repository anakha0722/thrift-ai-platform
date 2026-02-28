const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const auth = require("../middleware/authMiddleware");

// GET user cart
router.get("/", auth, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate("items.product");

  if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

  res.json(cart);
});

// ADD item
router.post("/add", auth, async (req, res) => {
  const { productId } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart)
    cart = await Cart.create({ user: req.user.id, items: [] });

  const itemIndex = cart.items.findIndex(
    (i) => i.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += 1;
  } else {
    cart.items.push({ product: productId });
  }

  await cart.save();
  res.json(cart);
});

// REMOVE item
router.post("/remove", auth, async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== productId
  );

  await cart.save();
  res.json(cart);
});

module.exports = router;
