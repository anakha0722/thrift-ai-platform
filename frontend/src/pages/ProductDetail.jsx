import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = storedUser?._id || storedUser?.id || null;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");

  const [addingToCart, setAddingToCart] = useState(false);

  // ================= LOAD BIDS =================
  const loadBids = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/bids/${id}`
      );
      setBids(res.data || []);
    } catch {
      setBids([]);
    }
  };

  // ================= LOAD PRODUCT =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );

        setProduct(productRes.data);
        setImageIndex(0);

        if (token) {
          try {
            const wishlistRes = await axios.get(
              "http://localhost:5000/api/wishlist",
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const exists = wishlistRes.data.items?.some(
              (item) => item.product?._id === productRes.data._id
            );

            setWishlisted(exists);
          } catch {}
        }

        try {
          const recRes = await axios.get(
            `http://localhost:5000/api/products/recommend/${id}`
          );
          setRecommendations(recRes.data || []);
        } catch {
          setRecommendations([]);
        }

        await loadBids();
      } catch {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ================= PLACE BID =================
  const placeBid = async () => {
    if (!bidAmount || !token) return;

    const amount = Number(bidAmount);

    const minBid =
      bids.length > 0
        ? Math.max(...bids.map((b) => b.amount))
        : product.price;

    if (amount <= minBid) {
      alert(`Bid must be greater than ₹${minBid}`);
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/bids/place",
        { productId: id, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBidAmount("");
      loadBids();
    } catch {
      alert("Bid failed");
    }
  };

  const highestBid =
    bids.length > 0
      ? Math.max(...bids.map((b) => b.amount))
      : null;

  // ================= ADD TO CART =================
  const handleAddToCart = async () => {
  console.log("ADD TO CART CLICKED");

  if (addingToCart) return;
  if (!product) return;

  if (product.quantity <= 0 || product.isSold) {
    alert("This product is sold out");
    return;
  }

  if (product.seller === userId) {
    alert("You cannot buy your own item");
    return;
  }

  try {
    setAddingToCart(true);

    // ================= GUEST USER =================
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

      const existingIndex = localCart.findIndex(
        (item) => item.product._id === product._id
      );

     if (existingIndex !== -1) {
  if (localCart[existingIndex].quantity >= product.quantity) {
    alert("Cannot add more than available stock");
    return;
  }

  localCart[existingIndex].quantity += 1;
} else {
  if (product.quantity < 1) {
    alert("Out of stock");
    return;
  }

  localCart.push({
    product,
    quantity: 1,
  });
}

      localStorage.setItem("cart", JSON.stringify(localCart));

      alert("Added to cart");

      window.dispatchEvent(new Event("storage"));
      return;
    }

    // ================= LOGGED IN USER =================
    const res = await axios.post(
      "http://localhost:5000/api/cart/add",
      { productId: product._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(res.data?.message || "Added to cart");

    window.dispatchEvent(new Event("storage"));

  } catch (err) {
    if (err.response?.data?.message) {
      alert(err.response.data.message);
    } else {
      alert("Failed to add to cart");
    }
  } finally {
    setAddingToCart(false);
  }
};
  // ================= WISHLIST =================
 const toggleWishlist = async () => {
  if (!token) {
    navigate("/login", {
      state: { from: { pathname: `/product/${id}` } },
    });
    return;
  }

  const url = wishlisted
    ? "/api/wishlist/remove"
    : "/api/wishlist/add";

  try {
    await axios.post(
      `http://localhost:5000${url}`,
      { productId: product._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setWishlisted(!wishlisted);
  } catch {}
};

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading product…
      </div>
    );

  if (!product || error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate("/buy")}
          className="px-6 py-3 rounded-full bg-rose text-white"
        >
          Back to Shop
        </button>
      </div>
    );

  const isSeller = product.seller === userId;
  const isOutOfStock = product.quantity <= 0 || product.isSold;

  return (
    <div className="min-h-screen bg-cream px-6 py-24">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">

        {/* IMAGE */}
        <div className="bg-white rounded-3xl p-6 shadow relative">
          <img
            src={
              product.images?.length
                ? `http://localhost:5000/uploads/${product.images[imageIndex]}`
                : "/placeholder.png"
            }
            className="w-full rounded-2xl object-cover mb-4"
            alt=""
          />

          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000/uploads/${img}`}
                  onClick={() => setImageIndex(index)}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border ${
                    imageIndex === index ? "border-rose" : "border-gray-300"
                  }`}
                  alt=""
                />
              ))}
            </div>
          )}

          <button
            onClick={toggleWishlist}
            className="absolute top-6 right-6 text-3xl"
          >
            {wishlisted ? "♥" : "♡"}
          </button>
        </div>

        {/* DETAILS */}
        <div>
          <h1 className="text-4xl font-bold mb-4">
            {product.title}
          </h1>
          <p className="text-sm text-gray-500 mb-2">
  Sold by: {product.seller?.name}
</p>

          <p className="text-3xl text-rose font-bold mb-3">
            ₹{product.price}
          </p>

          {highestBid && (
            <p className="mb-4 font-semibold">
              Highest Bid: ₹{highestBid}
            </p>
          )}

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          {!isSeller && (
            <>
              {product.biddingEnabled && (
                <div className="flex gap-3 mb-6">
                  <input
                    type="number"
                    placeholder="Your bid"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="border p-3 rounded w-40"
                  />

                  <button
                    onClick={placeBid}
                    className="px-6 bg-rose text-white rounded"
                  >
                    Place Bid
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={`px-10 py-4 rounded-full text-white ${
                  isOutOfStock || addingToCart
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-rose"
                }`}
              >
                {isOutOfStock
                  ? "Sold Out"
                  : addingToCart
                  ? "Adding..."
                  : "Add to Cart"}
              </button>
            </>
          )}

          {isSeller && (
            <p className="text-gray-600 mt-4">
              You are selling this product.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}

export default ProductDetail;