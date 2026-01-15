// src/utils/cart.js

export const getCart = () => {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product) => {
  const cart = getCart();

  const exists = cart.find((item) => item._id === product._id);
  if (exists) return cart;

  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  return cart;
};

export const removeFromCart = (id) => {
  const cart = getCart().filter((item) => item._id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem("cart");
};
