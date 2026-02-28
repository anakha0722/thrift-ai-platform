import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Hero from "../components/Hero";

function Buy() {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id || user?._id;

  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  // ================= LOAD WISHLIST =================
  useEffect(() => {
    if (!token) return;

    const loadWishlist = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/wishlist",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const ids = res.data.items
          .filter(item => item.product !== null)
          .map(item => item.product._id);

        setWishlistIds(ids);
      } catch (err) {
        console.error("Wishlist error:", err);
      }
    };

    loadWishlist();
  }, [token]);

  // ================= SEARCH FROM URL =================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search");
    if (query) setSearch(query);
  }, [location.search]);

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/products"
        );
        setProducts(res.data || []);
        setFilteredProducts(res.data || []);
      } catch (err) {
        console.error("Product load error:", err);
      }
    };

    fetchProducts();
  }, []);

  // ================= FILTER + SORT =================
  useEffect(() => {
    let temp = [...products];

    if (search)
      temp = temp.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase())
      );

    if (category)
      temp = temp.filter(
        p => p.category?.toLowerCase() === category.toLowerCase()
      );

    if (size)
      temp = temp.filter(
        p => p.size?.toLowerCase() === size.toLowerCase()
      );

    if (maxPrice)
      temp = temp.filter(p => p.price <= Number(maxPrice));

    if (sort === "low") temp.sort((a,b)=>a.price-b.price);
    if (sort === "high") temp.sort((a,b)=>b.price-a.price);
    if (sort === "new")
      temp.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

    setFilteredProducts(temp);
  }, [search, category, size, maxPrice, products, sort]);

  // ================= ADD TO CART =================
  const handleAddToCart = async (product) => {
    if (product.quantity <= 0 || product.isSold) {
      alert("This product is sold out");
      return;
    }

    if (product.seller === userId) {
      alert("You cannot buy your own product");
      return;
    }

    if (!token) {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = localCart.find(i => i.product._id === product._id);

      if (existing) existing.quantity += 1;
      else localCart.push({ product, quantity: 1 });

      localStorage.setItem("cart", JSON.stringify(localCart));
      window.dispatchEvent(new Event("storage"));
      alert("Added to cart");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart");
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  return (
    <div className="bg-cream min-h-screen text-cocoa">
      <Hero />

      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">

        {/* FILTER SIDEBAR */}
        <div className="w-64 space-y-6">

          <div>
            <label className="block mb-2 font-semibold">Category</label>
            <select
              value={category}
              onChange={(e)=>setCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All</option>
              <option value="topwear">Topwear</option>
              <option value="bottomwear">Bottomwear</option>
              <option value="dress">Dress</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Size</label>
            <select
              value={size}
              onChange={(e)=>setSize(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Max Price</label>
            <select
              value={maxPrice}
              onChange={(e)=>setMaxPrice(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">No Limit</option>
              <option value="500">₹500</option>
              <option value="1000">₹1000</option>
              <option value="2000">₹2000</option>
              <option value="5000">₹5000</option>
            </select>
          </div>

        </div>

        {/* PRODUCT GRID */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const isOutOfStock =
                product.quantity <= 0 || product.isSold;

              return (
                <div
                  key={product._id}
                  className="relative bg-softpink rounded-xl overflow-hidden shadow cursor-pointer"
                  onClick={()=> {
                    if (!isOutOfStock)
                      navigate(`/product/${product._id}`);
                  }}
                >
                  {isOutOfStock && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full z-10">
                      SOLD OUT
                    </div>
                  )}

                  <img
                    src={
                      product.images?.length
                        ? `http://localhost:5000/uploads/${product.images[0]}`
                        : "/placeholder.png"
                    }
                    className={`w-full h-60 object-cover ${
                      isOutOfStock ? "opacity-60" : ""
                    }`}
                    alt=""
                  />

                  <div className="p-4">
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-rose font-bold">₹{product.price}</p>
                    <p className="text-sm">Stock: {product.quantity}</p>
                  </div>

                  <button
                    onClick={(e)=>{
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={isOutOfStock}
                    className={`w-full py-3 text-white ${
                      isOutOfStock
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-rose"
                    }`}
                  >
                    {isOutOfStock ? "Sold Out" : "Add to Cart"}
                  </button>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Buy;