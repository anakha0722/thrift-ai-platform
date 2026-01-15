import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = localStorage.getItem("cart");
    setCartCount(cart ? JSON.parse(cart).length : 0);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50
                    bg-cream/90 backdrop-blur-md
                    border-b border-blush">
      <div className="max-w-7xl mx-auto px-8 py-4
                      flex justify-between items-center">

        {/* 🌸 BRAND */}
        <Link
          to="/buy"
          className="text-2xl font-extrabold tracking-wide
                     text-cocoa"
        >
          Re<span className="text-rose">Wear</span>
        </Link>

        {/* 🌷 NAV LINKS */}
        {token && (
          <div className="flex items-center gap-8
                          text-sm font-medium text-cocoa">
            <Link
              to="/buy"
              className="hover:text-rose transition"
            >
              Shop
            </Link>

            <Link
              to="/sell"
              className="hover:text-rose transition"
            >
              Sell
            </Link>

            <Link
              to="/stylist"
              className="hover:text-rose transition"
            >
              AI Stylist
            </Link>

            {/* 🛒 CART */}
            <Link
              to="/cart"
              className="relative hover:text-rose transition"
            >
              Cart
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-3
                             bg-rose text-white
                             text-xs font-bold
                             w-5 h-5 rounded-full
                             flex items-center justify-center"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* 🌸 LOGOUT */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full
                         bg-blush text-cocoa
                         hover:bg-rose hover:text-white
                         transition"
            >
              Logout
            </button>
          </div>
        )}

        {!token && (
          <Link
            to="/login"
            className="px-5 py-2 rounded-full
                       bg-rose text-white
                       font-semibold
                       hover:opacity-90 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
