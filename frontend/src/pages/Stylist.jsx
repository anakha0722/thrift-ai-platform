import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Stylist() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const chatRef = useRef(null);

  // ======================
  // AUTO SCROLL
  // ======================
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);


  useEffect(() => {
    const saved = localStorage.getItem("stylist_chat");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        console.warn("Failed to parse saved stylist chat", e);
        localStorage.removeItem("stylist_chat");
      }
    }

    const tip = `✨ Style Tip:
Mix neutral basics with one standout piece (like a bold jacket or statement sneakers) for an effortless look. What vibe are you going for today?`;

    setMessages([
      {
        type: "bot",
        text: tip,
        products: [],
      },
    ]);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("stylist_chat", JSON.stringify(messages));
    }
  }, [messages]);

  // ======================
  // QUICK PROMPTS
  // ======================
  const quickPrompt = (prompt) => {
    if (loading) return;
    askStylist(prompt);
  };

  const clearChat = () => {
    const tip = `✨ Style Tip:
Mix neutral basics with one standout piece for an effortless look. What vibe are you going for today?`;
    const defaultMessages = [
      {
        type: "bot",
        text: tip,
        products: [],
      },
    ];
    setMessages(defaultMessages);
    localStorage.setItem("stylist_chat", JSON.stringify(defaultMessages));
  };

  // ======================
  // SEND MESSAGE
  // ======================
  const askStylist = async (customText) => {
    const text = (customText || input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const formattedMessages = [
        ...messages
          .filter((m) => m && typeof m.text === "string" && m.text.trim())
          .map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.text.trim(),
          })),
        { role: "user", content: text },
      ];

      const res = await axios.post(
        "http://localhost:5000/api/products/stylist",
        { messages: formattedMessages },
        { timeout: 20000 }
      );

      const botReply =
        res.data?.text ||
        res.data?.message ||
        "Fashion tip: Pair neutral basics with one standout statement piece! What vibe are you going for today?";

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: botReply,
          products: Array.isArray(res.data?.products) ? res.data.products : [],
        },
      ]);
    } catch (err) {
      console.error("Stylist error:", err);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Oops, something went wrong while talking to the stylist. Try again in a moment!",
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">AI Stylist ✨</h1>

          <button
            onClick={clearChat}
            className="px-4 py-2 bg-gray-200 rounded-full text-sm hover:bg-gray-300"
          >
            Clear Chat
          </button>
        </div>

        {/* QUICK PROMPTS */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            "College outfit idea",
            "Date night outfit",
            "Summer casual look",
            "Streetwear style",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => quickPrompt(prompt)}
              className="px-4 py-2 bg-softpink text-cocoa rounded-full text-sm hover:bg-rose hover:text-white transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* CHAT AREA */}
        <div
          ref={chatRef}
          className="bg-white rounded-3xl shadow p-6 h-[60vh] overflow-y-auto space-y-6"
        >
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
                <div className="inline-block bg-rose text-white px-4 py-2 rounded-2xl whitespace-pre-wrap">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={i} className="space-y-3">
                {/* BOT MESSAGE */}
                <div className="inline-block bg-gray-100 px-4 py-3 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>

                {/* PRODUCT SUGGESTIONS */}
                {msg.products?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {msg.products.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => navigate(`/product/${item._id}`)}
                        className="cursor-pointer bg-softpink rounded-xl p-3 shadow hover:shadow-lg"
                      >
                        {item.images?.length ? (
                          <img
                            src={`http://localhost:5000/uploads/${item.images[0]}`}
                            alt={item.title}
                            onError={(e) => {
                              if (e.currentTarget.src !== window.location.origin + "/placeholder.png") {
                                e.currentTarget.src = "/placeholder.png";
                              }
                            }}
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

          {/* TYPING ANIMATION */}
          {loading && (
            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="flex gap-4 mt-6">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask stylist..."
            className="flex-1 p-4 border rounded-full"
            onKeyDown={(e) => e.key === "Enter" && !loading && askStylist()}
          />

          <button
            onClick={() => askStylist()}
            disabled={loading}
            className={`px-6 rounded-full text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-rose"
            }`}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Stylist;