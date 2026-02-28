import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [bids, setBids] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ================= LOAD PRODUCTS =================
  const loadProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/products/my-products",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(res.data || []);

      res.data.forEach(loadBids);
    } catch (err) {
      console.error("Load seller products error", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [token]);

  // ================= LOAD BIDS =================
  const loadBids = async (product) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/bids/${product._id}`
      );

      const sorted = (res.data || []).sort(
        (a, b) => b.amount - a.amount
      );

      setBids((prev) => ({
        ...prev,
        [product._id]: sorted,
      }));
    } catch {
      setBids((prev) => ({
        ...prev,
        [product._id]: [],
      }));
    }
  };

  // ================= ACCEPT BID =================
  const acceptBid = async (productId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/bids/accept/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Bid accepted. Order created.");

      loadProducts();
    } catch {
      alert("Failed to accept bid");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts((prev) =>
        prev.filter((p) => p._id !== productId)
      );
    } catch {
      alert("Delete failed");
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-24">
      <h1 className="text-4xl font-bold text-center mb-12">
        Seller <span className="text-rose">Dashboard</span>
      </h1>

      {products.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">No products uploaded yet.</p>
          <button
            onClick={() => navigate("/sell")}
            className="px-6 py-3 bg-rose text-white rounded-full"
          >
            Upload Product
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => {
            const isOutOfStock =
              product.quantity <= 0 || product.isSold;

            return (
              <div
                key={product._id}
                className="bg-softpink rounded-3xl overflow-hidden shadow"
              >
                <img
                  src={
                    product.images?.length
                      ? `http://localhost:5000/uploads/${product.images[0]}`
                      : "/placeholder.png"
                  }
                  alt={product.title}
                  className="w-full h-60 object-cover"
                />

                <div className="p-4">
                  <h3 className="font-semibold">
                    {product.title}
                  </h3>

                  <p className="text-rose font-bold">
                    ₹{product.price}
                  </p>

                  <p className="text-sm mt-1">
                    Stock: {product.quantity}
                  </p>

                  {isOutOfStock && (
                    <p className="text-red-600 font-semibold mt-1">
                      SOLD OUT
                    </p>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-3 mt-3 text-sm">
                    <button
                      onClick={() => handleEdit(product._id)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => navigate("/seller-orders")}
                      className="bg-rose text-white px-3 py-1 rounded"
                    >
                      Orders
                    </button>

                    <button
                      onClick={() =>
                        navigate("/seller-analytics")
                      }
                      className="bg-rose text-white px-3 py-1 rounded"
                    >
                      Analytics
                    </button>
                  </div>

                  {/* BIDS */}
                  {product.biddingEnabled && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">
                        Bids
                      </h4>

                      {bids[product._id]?.length > 0 ? (
                        bids[product._id].map((bid, index) => (
                          <div
                            key={bid._id}
                            className="flex justify-between items-center bg-white p-2 mb-2 rounded"
                          >
                            <span>
                              ₹{bid.amount}
                              {index === 0 && (
                                <span className="text-xs text-green-600 ml-2">
                                  (Highest)
                                </span>
                              )}
                            </span>

                            {!isOutOfStock && index === 0 && (
                              <button
                                onClick={() =>
                                  acceptBid(product._id)
                                }
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                              >
                                Accept
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No bids yet
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;