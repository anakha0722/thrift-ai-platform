import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Wishlist() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD WISHLIST =================
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/wishlist",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Filter out null products (IMPORTANT FIX)
        const validItems = (res.data.items || []).filter(
          (item) => item.product
        );

        setWishlist(validItems);
      } catch (err) {
        console.error("Wishlist load error", err);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [token]);

  // ================= ADD TO CART =================
  const handleAddToCart = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.dispatchEvent(new Event("storage"));
      alert("Added to cart 🛒");
    } catch (err) {
      console.error("Cart add error", err);
    }
  };

  // ================= REMOVE =================
  const handleRemove = async (productId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/wishlist/remove",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const validItems = (res.data.items || []).filter(
        (item) => item.product
      );

      setWishlist(validItems);
    } catch (err) {
      console.error("Wishlist remove error", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading wishlist…
      </div>
    );
  }

  if (!wishlist.length) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-cocoa mb-4">
          Your wishlist is empty 💔
        </h2>
        <button
          onClick={() => navigate("/buy")}
          className="px-6 py-3 rounded-full bg-rose text-white"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-24">
      <h1 className="text-4xl font-extrabold text-cocoa mb-12 text-center">
        Your <span className="text-rose">Wishlist</span> 💕
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {wishlist.map((item) => {
          const product = item.product;

          if (!product) return null; // Extra safety

          return (
            <div
              key={product._id}
              className="bg-softpink rounded-[2rem] shadow overflow-hidden"
            >
              <img
                src={
                  product.images?.length
                    ? `http://localhost:5000/uploads/${product.images[0]}`
                    : "/placeholder.png"
                }
                alt={product.title}
                className="w-full h-64 object-cover"
              />

              <div className="p-6">
                <h3 className="font-semibold mb-1">
                  {product.title}
                </h3>
                <p className="text-rose font-bold mb-4">
                  ₹{product.price}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleAddToCart(product._id)
                    }
                    className="w-1/2 py-2 rounded-full bg-rose text-white"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={() =>
                      handleRemove(product._id)
                    }
                    className="w-1/2 py-2 rounded-full border border-rose text-rose"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Wishlist;