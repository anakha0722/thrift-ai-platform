import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Hero from "../components/Hero";

function Buy() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
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
  const [addingId, setAddingId] = useState(null);

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

        setLoadingProducts(true);

        const res = await axios.get(
          "http://localhost:5000/api/products"
        );

        setProducts(res.data || []);
        setFilteredProducts(res.data || []);

      } catch (err) {
        console.error("Product load error:", err);
      } finally {
        setLoadingProducts(false);
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

    if (addingId === product._id) return;

    if (product.quantity <= 0 || product.isSold) {
      alert("This product is sold out");
      return;
    }

    if (product.seller === userId) {
      alert("You cannot buy your own product");
      return;
    }

    setAddingId(product._id);

    // ================= LOCAL CART =================
    if (!token) {

      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

      const existing = localCart.find(
        i => i.product._id === product._id
      );

      if (existing) {

        const newQty = existing.quantity + 1;

        if (newQty > product.quantity) {
          alert(`Only ${product.quantity} item(s) available in stock`);
          setAddingId(null);
          return;
        }

        existing.quantity = newQty;

      } else {

        if (product.quantity < 1) {
          alert("Item out of stock");
          setAddingId(null);
          return;
        }

        localCart.push({
          product,
          quantity: 1
        });

      }

      localStorage.setItem("cart", JSON.stringify(localCart));
      window.dispatchEvent(new Event("storage"));

      alert("Added to cart");

      setAddingId(null);
      return;
    }

// ================= SERVER CART =================
try {

  const res = await axios.post(
    "http://localhost:5000/api/cart/add",
    { productId: product._id },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  alert(res.data?.message || "Added to cart");

} catch (err) {

  if (err.response?.data?.message) {
    alert(err.response.data.message);
  } else {
    alert("Failed to add to cart");
  }

  console.error("Cart error:", err);
}

setAddingId(null);
  };

  const getProductImage = (product) => {
    const rawImage =
      Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : (product?.image || "");

    if (!rawImage || typeof rawImage !== "string") {
      return "/placeholder.png";
    }

    if (
      rawImage.startsWith("http://") ||
      rawImage.startsWith("https://") ||
      rawImage.startsWith("data:")
    ) {
      return rawImage;
    }

    const cleanPath = rawImage
      .replace(/\\/g, "/")
      .replace(/^(\/)?uploads\//, "")
      .replace(/^\/+/, "");

    return `http://localhost:5000/uploads/${cleanPath}`;
  };

  return (
    <div className="bg-cream min-h-screen text-cocoa">
      <Hero />

      <div
  id="products"
  className="max-w-7xl mx-auto px-6 py-12 flex gap-10"
>

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

          {/* 🔥 SEARCH BAR */}
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-4 border rounded-full bg-white"
          />

          {!loadingProducts && (
            <p className="mb-4 text-sm text-cocoa/70">
              {filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""} found
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-20 text-cocoa/60">
                <h2 className="text-2xl font-semibold mb-2">
                  No products found 👀
                </h2>
                <p>
                  Try changing your filters or search keywords.
                </p>
              </div>
            )}

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
                    src={getProductImage(product)}
                    onError={(e) => {
                      if (e.currentTarget.src !== window.location.origin + "/placeholder.png") {
                        e.currentTarget.src = "/placeholder.png";
                      }
                    }}
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
                    disabled={isOutOfStock || addingId === product._id}
                    className={`w-full py-3 text-white ${
                      isOutOfStock || addingId === product._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-rose"
                    }`}
                  >
                    {isOutOfStock
                      ? "Sold Out"
                      : addingId === product._id
                      ? "Adding..."
                      : "Add to Cart"}
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