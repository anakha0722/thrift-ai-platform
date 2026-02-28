import { useEffect, useState } from "react";
import axios from "axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [confirmingOrder, setConfirmingOrder] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const token = localStorage.getItem("token");

  const steps = ["Awaiting Confirmation", "Placed", "Shipped", "Delivered"];

  useEffect(() => {
    loadOrders();
  }, [token]);

  const loadOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/orders/my-orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (err) {
      console.error("Orders load error", err);
    }
  };

  const handleConfirm = async (orderId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/confirm/${orderId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfirmingOrder(null);
      setForm({ fullName: "", phone: "", address: "" });
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Confirmation failed");
    }
  };

  const getProgressIndex = (status) =>
    Math.max(steps.indexOf(status), 0);

  const getStatusStyle = (status) => {
    if (status === "Awaiting Confirmation")
      return "bg-purple-100 text-purple-700";
    if (status === "Placed")
      return "bg-yellow-100 text-yellow-700";
    if (status === "Shipped")
      return "bg-blue-100 text-blue-700";
    if (status === "Delivered")
      return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-cream min-h-screen px-6 py-28 text-cocoa">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">
          Your <span className="text-rose">Orders</span>
        </h1>

        {orders.length === 0 ? (
          <div className="bg-softpink rounded-3xl p-12 text-center">
            No orders yet 🛍️
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const progress = getProgressIndex(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-softpink rounded-3xl p-6 shadow"
                >
                  <div className="flex justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <p className="font-semibold">
                        Order ID: {order._id.slice(-6)}
                      </p>
                      <p className="text-sm text-cocoa/60">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="text-rose font-bold">
                      ₹{order.totalAmount}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex justify-between mb-6 text-sm">
                    {steps.map((step, index) => (
                      <div key={step} className="flex-1 text-center">
                        <div
                          className={`h-2 mb-2 rounded-full ${
                            index <= progress
                              ? "bg-rose"
                              : "bg-gray-300"
                          }`}
                        />
                        <p
                          className={
                            index <= progress
                              ? "text-rose font-semibold"
                              : "text-cocoa/60"
                          }
                        >
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.product._id}
                        className="flex gap-4 items-center"
                      >
                        {item.product.images?.length ? (
                          <img
                            src={`http://localhost:5000/uploads/${item.product.images[0]}`}
                            alt={item.product.title}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blush rounded-xl" />
                        )}

                        <div className="flex-1">
                          <p className="font-medium">
                            {item.product.title}
                          </p>
                          <p className="text-sm text-cocoa/60">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="font-semibold text-rose">
                          ₹{item.price}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Status + Confirmation */}
                  <div className="mt-5 flex justify-between items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    {order.status === "Awaiting Confirmation" && (
                      <button
                        onClick={() => setConfirmingOrder(order._id)}
                        className="bg-rose text-white px-4 py-2 rounded-full text-sm"
                      >
                        Complete Purchase
                      </button>
                    )}
                  </div>

                  {/* Confirmation Form */}
                  {confirmingOrder === order._id && (
                    <div className="mt-6 bg-white p-4 rounded-xl space-y-3">
                      <input
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                      />
                      <input
                        placeholder="Phone"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                      />
                      <textarea
                        placeholder="Address"
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                      />

                      <button
                        onClick={() => handleConfirm(order._id)}
                        className="bg-rose text-white px-4 py-2 rounded"
                      >
                        Confirm Order
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;