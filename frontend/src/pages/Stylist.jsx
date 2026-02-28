import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Stylist() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ======================
  // SEND MESSAGE
  // ======================
  const askStylist = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      { type: "user", text },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/products/stylist",
        { message: text }
      );

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: res.data.text,
          products: res.data.products || [],
        },
      ]);
    } catch (err) {
      console.error("Stylist error:", err);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Oops, something went wrong. Try again.",
          products: [],
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          AI Stylist ✨
        </h1>

        {/* CHAT AREA */}
        <div className="bg-white rounded-3xl shadow p-6 h-[60vh] overflow-y-auto space-y-6">
          {messages.length === 0 && (
            <p className="text-cocoa/60">
              Ask things like:
              <br />• Outfit for college
              <br />• Party outfit ideas
              <br />• Casual summer clothes
            </p>
          )}

          {messages.map((msg, i) =>
            msg.type === "user" ? (
              <div key={i} className="text-right">
                <div className="inline-block bg-rose text-white px-4 py-2 rounded-2xl">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={i} className="space-y-3">
                {/* Bot text */}
                <div className="inline-block bg-gray-100 px-4 py-3 rounded-2xl max-w-[80%]">
                  {msg.text}
                </div>

                {/* Optional products */}
                {msg.products?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {msg.products.map((item) => (
                      <div
                        key={item._id}
                        onClick={() =>
                          navigate(`/product/${item._id}`)
                        }
                        className="cursor-pointer bg-softpink rounded-xl p-3 shadow hover:shadow-lg"
                      >
                        {item.images?.length ? (
                          <img
                            src={`http://localhost:5000/uploads/${item.images[0]}`}
                            alt={item.title}
                            className="h-32 w-full object-cover rounded"
                          />
                        ) : (
                          <div className="h-32 bg-blush rounded" />
                        )}

                        <p className="mt-2 font-semibold text-sm">
                          {item.title}
                        </p>

                        <p className="text-rose font-bold text-sm">
                          ₹{item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {loading && (
            <p className="text-cocoa/60">
              Stylist thinking...
            </p>
          )}
        </div>

        {/* INPUT */}
        <div className="flex gap-4 mt-6">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask stylist..."
            className="flex-1 p-4 border rounded-full"
            onKeyDown={(e) =>
              e.key === "Enter" && askStylist()
            }
          />

          <button
            onClick={askStylist}
            className="px-6 bg-rose text-white rounded-full"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Stylist;
