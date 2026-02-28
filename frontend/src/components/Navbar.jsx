import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import CartDrawer from "./CartDrawer";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser());
  const token = localStorage.getItem("token");
  const role = user?.role;

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // Hide navbar on login/register
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  // Sync user on route change
  useEffect(() => {
    setUser(getStoredUser());
  }, [location]);

  // Update cart & wishlist count
  useEffect(() => {
    const updateCounts = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setCartCount(cart.length);
      setWishlistCount(wishlist.length);
    };

    updateCounts();
    window.addEventListener("storage", updateCounts);

    return () => window.removeEventListener("storage", updateCounts);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/buy", { replace: true });
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-cream/90 backdrop-blur-md border-b border-blush">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

          {/* LOGO */}
          <Link
            to="/buy"
            className="text-2xl font-extrabold tracking-wide text-cocoa"
          >
            Re<span className="text-rose">Wear</span>
          </Link>

          <div className="flex items-center gap-8 text-sm font-medium text-cocoa">

            {/* SHOP */}
            <Link to="/buy" className="hover:text-rose">
              Shop
            </Link>

            {/* NOT LOGGED IN */}
            {!token && (
              <>
                <button
                  onClick={() => navigate("/register?role=seller")}
                  className="hover:text-rose"
                >
                  Join as Seller
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="hover:text-rose"
                >
                  Login
                </button>
              </>
            )}

            {/* LOGGED IN BUYER */}
            {token && role === "buyer" && (
              <>
                <button
                  onClick={() => navigate("/register?role=seller")}
                  className="hover:text-rose"
                >
                  Join as Seller
                </button>
              </>
            )}

            {/* LOGGED IN SELLER */}
            {token && role === "seller" && (
              <>
                <Link to="/sell" className="hover:text-rose">
                  Sell
                </Link>

                <Link
                  to="/seller-dashboard"
                  className="hover:text-rose"
                >
                  Seller Dashboard
                </Link>
              </>
            )}

            {/* WISHLIST */}
            <Link to="/wishlist" className="relative">
              ❤️
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-rose text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* CART */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-rose text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* PROFILE */}
            {token && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="hover:text-rose"
                >
                  👤
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white shadow rounded-lg p-3 space-y-2">

                    {role === "buyer" && (
                      <>
                        <button
                          onClick={() => navigate("/orders")}
                          className="block w-full text-left hover:text-rose"
                        >
                          Orders
                        </button>

                        <button
                          onClick={() => navigate("/stylist")}
                          className="block w-full text-left hover:text-rose"
                        >
                          AI Stylist
                        </button>
                      </>
                    )}

                    {role === "seller" && (
                      <>
                        <button
                          onClick={() => navigate("/seller-dashboard")}
                          className="block w-full text-left hover:text-rose"
                        >
                          Seller Dashboard
                        </button>

                        <button
                          onClick={() => navigate("/seller-orders")}
                          className="block w-full text-left hover:text-rose"
                        >
                          Seller Orders
                        </button>

                        <button
                          onClick={() => navigate("/seller-analytics")}
                          className="block w-full text-left hover:text-rose"
                        >
                          Seller Analytics
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left text-red-500"
                    >
                      Logout
                    </button>

                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </nav>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}

export default Navbar;