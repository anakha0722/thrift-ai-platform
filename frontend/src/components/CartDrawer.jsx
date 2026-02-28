import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CartDrawer({ open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // LOAD CART
  const loadCart = async () => {
    try {
      setLoading(true);

      // ✅ Guest cart from localStorage
      if (!token) {
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setItems(localCart);
        return;
      }

      // ✅ Logged user cart from backend
      const res = await axios.get(
        "http://localhost:5000/api/cart",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadCart();
  }, [open]);

  useEffect(() => {
    const refresh = () => loadCart();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  // REMOVE ITEM
  const removeItem = async (productId) => {
    try {
      if (!token) {
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const updated = localCart.filter(
          (item) => item.product._id !== productId
        );
        localStorage.setItem("cart", JSON.stringify(updated));
        setItems(updated);
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/cart/remove",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ CHECKOUT FIXED
  const checkout = async () => {
    // 🔴 Force login
    if (!token) {
      alert("Please login to proceed to checkout.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/orders/checkout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems([]);
      localStorage.removeItem("cart");
      alert("Order placed successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    }
  };

  // TOTAL
  const total = items.reduce((sum, i) => {
    if (!i.product) return sum;
    return sum + i.product.price * (i.quantity || 1);
  }, 0);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl
                    transform transition-transform duration-300 z-50
                    flex flex-col
                    ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 flex justify-between border-b">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loading && (
            <p className="text-gray-500">Loading cart...</p>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center mt-20">
              <p className="text-gray-500 mb-4">
                Your cart is empty 🛒
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-rose text-white rounded-full"
              >
                Continue Shopping
              </button>
            </div>
          )}

          {items.map((item) => {
            if (!item.product) return null;

            return (
              <div
                key={item.product._id}
                className="flex gap-3 items-center"
              >
                {item.product.images?.length > 0 && (
                  <img
                    src={`http://localhost:5000/uploads/${item.product.images[0]}`}
                    className="w-16 h-16 object-cover rounded"
                    alt=""
                  />
                )}

                <div className="flex-1">
                  <p className="font-medium">
                    {item.product.title}
                  </p>
                  <p className="text-sm">
                    ₹{item.product.price} × {item.quantity || 1}
                  </p>
                </div>

                <button
                  onClick={() =>
                    removeItem(item.product._id)
                  }
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t">
          <p className="font-bold mb-4">
            Total: ₹{total}
          </p>

          <button
            onClick={checkout}
            disabled={items.length === 0}
            className="w-full bg-rose text-white py-3 rounded-full disabled:opacity-50"
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}

export default CartDrawer;