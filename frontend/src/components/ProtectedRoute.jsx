import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, sellerOnly = false }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  let user = null;

  // Safe JSON parse
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Invalid user data in localStorage");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  /* ================= NOT LOGGED IN ================= */
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  /* ================= SELLER ONLY ================= */
  if (sellerOnly && user.role !== "seller") {
    return <Navigate to="/buy" replace />;
  }

  return children;
}

export default ProtectedRoute;