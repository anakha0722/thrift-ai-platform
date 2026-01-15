import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../utils/cart";

function Buy() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const token = localStorage.getItem("token");
  const productsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/products",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [token]);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-cream text-cocoa min-h-screen">
      {/* 🌸 HERO — editorial & calm */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-blush/60 rounded-full blur-[160px]" />
        <div className="absolute top-24 right-0 w-[420px] h-[420px] bg-rose/40 rounded-full blur-[160px]" />

        <div className="relative z-10 text-center max-w-4xl px-6">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
            Re<span className="text-rose">Wear</span>
          </h1>

          <p className="text-xl md:text-2xl text-cocoa/70 mb-10">
            Soft fashion. Sustainable finds.
          </p>

          <div className="flex justify-center gap-6">
            <button
              onClick={scrollToProducts}
              className="px-8 py-3 rounded-full
                         bg-rose text-white font-semibold
                         hover:opacity-90 transition"
            >
              Explore Collection
            </button>

            <button
              onClick={() => navigate("/stylist")}
              className="px-8 py-3 rounded-full
                         border border-rose text-rose
                         hover:bg-blush transition"
            >
              AI Stylist
            </button>
          </div>
        </div>
      </section>

      {/* 🌷 FEATURED SECTION */}
      <section
        ref={productsRef}
        className="max-w-7xl mx-auto px-6 py-24"
      >
        <h2 className="text-4xl font-bold mb-2">
          Featured <span className="text-rose">Drop</span>
        </h2>
        <p className="text-cocoa/60 mb-14">
          Hand‑picked pieces our community loves
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {products.map((product) => (
            <div
              key={product._id}
              className="group bg-softpink rounded-[2rem] overflow-hidden
                         shadow-[0_25px_45px_rgba(0,0,0,0.08)]
                         transition-all duration-500
                         hover:-translate-y-1"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden">
                {product.images?.length ? (
                  <img
                    src={`http://localhost:5000/uploads/${product.images[0]}`}
                    alt={product.title}
                    className="w-full h-64 object-cover
                               transition-transform duration-700
                               group-hover:scale-105"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center bg-blush">
                    No Image
                  </div>
                )}

                {/* 🌱 Pills */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs
                                   bg-cream/80 text-cocoa">
                    ✨ Verified
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs
                                   bg-cream/80 text-cocoa">
                    🌱 Sustainable
                  </span>
                </div>
              </div>

              {/* DETAILS */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-1">
                  {product.title}
                </h3>

                <p className="text-rose font-bold mb-1">
                  ₹{product.price}
                </p>

                <p className="text-sm text-cocoa/60 mb-5">
                  {product.size} • {product.gender}
                </p>

                {/* ACTIONS */}
                <div className="flex gap-3 opacity-0
                                group-hover:opacity-100
                                transition-opacity duration-300">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-1/2 py-2 rounded-full
                               bg-rose text-white font-semibold
                               hover:opacity-90 transition"
                  >
                    Buy
                  </button>

                  <button
                    onClick={() => {
                      addToCart(product);
                      alert("Added to cart 🛒");
                    }}
                    className="w-1/2 py-2 rounded-full
                               border border-rose text-rose
                               hover:bg-blush transition"
                  >
                    Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🌸 BUY MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-cream rounded-[2rem] p-8 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-rose">
              Order Placed 💕
            </h2>

            <p className="text-cocoa/70 mb-4">
              AI verified • Demo checkout
            </p>

            <p className="font-semibold">{selectedProduct.title}</p>
            <p className="text-rose font-bold mb-6">
              ₹{selectedProduct.price}
            </p>

            <button
              onClick={() => setSelectedProduct(null)}
              className="w-full py-3 rounded-full
                         bg-rose text-white font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Buy;
