import { useEffect, useState } from "react";
import axios from "axios";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const token = localStorage.getItem("token");

  // ======================
  // LOAD CART FROM DB
  // ======================
  const loadCart = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/cart",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCartItems(res.data.items);
    } catch (err) {
      console.error("Cart load error", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  // ======================
  // REMOVE ITEM
  // ======================
  const handleRemove = async (productId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/cart/remove",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems(res.data.items);
    } catch (err) {
      console.error("Remove error", err);
    }
  };

  // ======================
  // REAL CHECKOUT
  // ======================
  const handleCheckout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/orders/checkout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Order placed successfully!");
      loadCart(); // cart cleared
    } catch (err) {
      console.error("Checkout error", err);
      alert("Checkout failed");
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="bg-cream min-h-screen text-cocoa px-6 py-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">
          Your <span className="text-rose">Cart</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-softpink rounded-3xl p-12 text-center">
            Cart is empty 🌷
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.product._id}
                className="flex items-center gap-6 bg-softpink rounded-3xl p-6"
              >
                {item.product.images?.length ? (
                  <img
                    src={`http://localhost:5000/uploads/${item.product.images[0]}`}
                    alt={item.product.title}
                    className="w-24 h-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blush rounded-2xl" />
                )}

                <div className="flex-1">
                  <h3 className="font-semibold">
                    {item.product.title}
                  </h3>
                  <p className="text-sm text-cocoa/60">
                    {item.product.size} • {item.product.gender}
                  </p>
                  <p className="text-sm">
                    Qty: {item.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-rose mb-2">
                    ₹{item.product.price}
                  </p>

                  <button
                    onClick={() =>
                      handleRemove(item.product._id)
                    }
                    className="text-sm hover:text-rose"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-12 bg-blush rounded-3xl p-8 flex justify-between">
              <p className="text-xl font-semibold">Total</p>
              <p className="text-2xl font-bold text-rose">
                ₹{total}
              </p>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 py-4 rounded-full bg-rose text-white"
            >
              Checkout ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
