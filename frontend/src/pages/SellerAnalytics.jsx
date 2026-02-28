import { useEffect, useState } from "react";
import axios from "axios";

function SellerAnalytics() {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/orders/seller-analytics",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadStats();
  }, [token]);

  if (!stats)
    return <p className="pt-32 text-center">Loading...</p>;

  return (
    <div className="bg-cream min-h-screen px-6 py-28 text-cocoa">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">
          Seller Analytics
        </h1>

        {/* SUMMARY */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-softpink p-6 rounded-3xl text-center">
            <p>Total Revenue</p>
            <p className="text-2xl font-bold text-rose">
              ₹{stats.totalRevenue}
            </p>
          </div>

          <div className="bg-softpink p-6 rounded-3xl text-center">
            <p>Items Sold</p>
            <p className="text-2xl font-bold">
              {stats.totalItemsSold}
            </p>
          </div>

          <div className="bg-softpink p-6 rounded-3xl text-center">
            <p>Total Orders</p>
            <p className="text-2xl font-bold">
              {stats.totalOrders}
            </p>
          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className="bg-softpink p-6 rounded-3xl">
          <h2 className="text-xl font-semibold mb-4">
            Top Selling Products
          </h2>

          {stats.topProducts.length === 0 ? (
            <p>No sales yet.</p>
          ) : (
            stats.topProducts.map((p, i) => (
              <div
                key={i}
                className="flex justify-between mb-2"
              >
                <p>{p.title}</p>
                <p>Sold: {p.quantity}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerAnalytics;
