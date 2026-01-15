import { useEffect, useState } from "react";
import { removeFromCart } from "../utils/cart";

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const cart = localStorage.getItem("cart");
    setCartItems(cart ? JSON.parse(cart) : []);
  }, []);

  const handleRemove = (id) => {
    removeFromCart(id);
    const updatedCart = JSON.parse(localStorage.getItem("cart"));
    setCartItems(updatedCart);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return (
    <div className="bg-cream min-h-screen text-cocoa px-6 py-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          Your <span className="text-rose">Cart</span>
        </h1>

        <p className="text-cocoa/60 mb-10">
          Soft finds you’re about to love 💕
        </p>

        {cartItems.length === 0 ? (
          <div className="bg-softpink rounded-3xl p-12 text-center">
            <p className="text-lg text-cocoa/70">
              Your cart is empty 🌷
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-6
                           bg-softpink rounded-3xl p-6
                           shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
              >
                {item.images?.length ? (
                  <img
                    src={`http://localhost:5000/uploads/${item.images[0]}`}
                    alt={item.title}
                    className="w-24 h-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blush rounded-2xl" />
                )}

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-cocoa/60">
                    {item.size} • {item.gender}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-rose mb-2">
                    ₹{item.price}
                  </p>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="text-sm text-cocoa/60
                               hover:text-rose transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* 🌸 TOTAL */}
            <div className="mt-12 bg-blush rounded-3xl p-8
                            flex justify-between items-center">
              <p className="text-xl font-semibold">
                Total
              </p>
              <p className="text-2xl font-bold text-rose">
                ₹{total}
              </p>
            </div>

            {/* 🌷 CHECKOUT */}
            <button
              onClick={() =>
                alert(
                  "✨ Demo checkout complete!\nPayments are disabled for this project."
                )
              }
              className="w-full mt-6 py-4 rounded-full
                         bg-rose text-white
                         font-semibold text-lg
                         hover:opacity-90 transition"
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
