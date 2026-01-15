const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["men", "women", "unisex"],
      required: true,
    },

    category: {
      type: String,
      default: "unknown",
    },

    images: [
      {
        type: String,
      },
    ],

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
