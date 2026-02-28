import { useEffect, useState } from "react";
import axios from "axios";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/orders/seller-orders",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setOrders(res.data);
      } catch (err) {
        console.error("Seller orders error", err);
      }
    };

    loadOrders();
  }, [token]);

  return (
    <div className="min-h-screen bg-cream px-6 py-28 text-cocoa">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">
          Orders for Your Products
        </h1>

        {orders.length === 0 ? (
          <div className="bg-softpink p-10 rounded-3xl text-center">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-softpink p-6 rounded-3xl"
              >
                <div className="flex justify-between mb-4">
                  <p>
                    Buyer: {order.user?.name} (
                    {order.user?.email})
                  </p>

                  <p className="text-sm">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                {order.items.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex gap-4 items-center mb-3"
                  >
                    {item.product.images?.length ? (
                      <img
                        src={`http://localhost:5000/uploads/${item.product.images[0]}`}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blush rounded-xl" />
                    )}

                    <div className="flex-1">
                      <p>{item.product.title}</p>
                      <p className="text-sm">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-bold text-rose">
                      ₹{item.price}
                    </p>
                  </div>
                ))}

                <p className="mt-3 text-sm">
                  Status: {order.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerOrders;
