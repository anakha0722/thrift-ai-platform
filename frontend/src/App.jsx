import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Buy from "./pages/Buy";
import Sell from "./pages/Sell";
import Stylist from "./pages/Stylist";
import Cart from "./pages/Cart";


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
        <Navbar />

        <div className="p-8">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/buy"
              element={
                <ProtectedRoute>
                  <Buy />
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

            <Route
              path="/stylist"
              element={
                <ProtectedRoute>
                  <Stylist />
                </ProtectedRoute>
              }
            />

            {/* default route */}
            <Route path="*" element={<Login />} />
            <Route path="/cart" element={<Cart />} />

          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
