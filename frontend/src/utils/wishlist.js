const WISHLIST_KEY = "wishlist";

export const getWishlist = () => {
  const data = localStorage.getItem(WISHLIST_KEY);
  return data ? JSON.parse(data) : [];
};

export const addToWishlist = (product) => {
  const wishlist = getWishlist();
  const exists = wishlist.find((p) => p._id === product._id);

  if (!exists) {
    wishlist.push(product);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }
};

export const removeFromWishlist = (id) => {
  const wishlist = getWishlist().filter((p) => p._id !== id);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
};

export const isWishlisted = (id) => {
  return getWishlist().some((p) => p._id === id);
};
