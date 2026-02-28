import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { useEffect } from "react";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Buy from "./pages/Buy";
import Sell from "./pages/Sell";
import Stylist from "./pages/Stylist";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import SellerDashboard from "./pages/SellerDashboard";
import EditProduct from "./pages/EditProduct";
import Orders from "./pages/Orders";
import SellerOrders from "./pages/SellerOrders";
import SellerAnalytics from "./pages/SellerAnalytics";

/* ================= SCROLL FIX ================= */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="min-h-screen bg-cream text-cocoa">
      <ScrollToTop />

      {!hideNavbar && <Navbar />}

      <div className={hideNavbar ? "" : "pt-24"}>
        <Routes>

          {/* ================= AUTH ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ================= PUBLIC ================= */}
          <Route path="/" element={<Navigate to="/buy" replace />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />

          {/* ================= LOGIN REQUIRED ================= */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stylist"
            element={
              <ProtectedRoute>
                <Stylist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <Sell />
              </ProtectedRoute>
            }
          />

          {/* ================= SELLER ONLY ================= */}
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute sellerOnly>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-product/:id"
            element={
              <ProtectedRoute sellerOnly>
                <EditProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller-orders"
            element={
              <ProtectedRoute sellerOnly>
                <SellerOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller-analytics"
            element={
              <ProtectedRoute sellerOnly>
                <SellerAnalytics />
              </ProtectedRoute>
            }
          />

          {/* ================= 404 ================= */}
          <Route path="*" element={<Navigate to="/buy" replace />} />

        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}