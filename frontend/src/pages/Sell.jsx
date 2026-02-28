import { useState } from "react";
import axios from "axios";

function Sell() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    size: "",
    gender: "",
    category: "",
    quantity: 1,
    biddingEnabled: false,
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.price ||
      !form.size ||
      !form.gender ||
      !form.category
    ) {
      alert("All required fields must be filled");
      return;
    }

    setLoading(true);

    const data = new FormData();

    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });

    if (image) data.append("image", image);

    try {
      await axios.post(
        "http://localhost:5000/api/products/upload",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Product uploaded successfully");

      setForm({
        title: "",
        description: "",
        price: "",
        size: "",
        gender: "",
        category: "",
        quantity: 1,
        biddingEnabled: false,
      });

      setImage(null);
    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err.message);
      alert(
        err.response?.data?.message || "❌ Upload failed. Check inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex justify-center items-center px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-softpink p-10 rounded-[2rem] w-full max-w-md shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-rose">
          Sell an Item ✨
        </h2>

        {/* TITLE */}
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full mb-4 p-4 rounded-full"
        />

        {/* PRICE */}
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full mb-4 p-4 rounded-full"
        />

        {/* GENDER DROPDOWN */}
       <select
  name="gender"
  value={form.gender}
  onChange={handleChange}
  required
  className="w-full mb-4 p-4 rounded-full"
>
  <option value="">Select Gender</option>
  <option value="men">Men</option>
  <option value="women">Women</option>
  <option value="unisex">Unisex</option>
</select>

        {/* CATEGORY DROPDOWN */}
       <select
  name="category"
  value={form.category}
  onChange={handleChange}
  required
  className="w-full mb-4 p-4 rounded-full"
>
  <option value="">Select Category</option>
  <option value="topwear">Topwear</option>
  <option value="bottomwear">Bottomwear</option>
  <option value="dress">Dress</option>
  <option value="accessories">Accessories</option>
</select>

        {/* SIZE DROPDOWN */}
        <select
          name="size"
          value={form.size}
          onChange={handleChange}
          required
          className="w-full mb-4 p-4 rounded-full"
        >
          <option value="">Select Size</option>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </select>

        {/* QUANTITY */}
        <input
          name="quantity"
          type="number"
          min="1"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
          className="w-full mb-4 p-4 rounded-full"
        />

        {/* DESCRIPTION */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full mb-4 p-4 rounded-xl"
        />

        {/* BIDDING CHECKBOX */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            name="biddingEnabled"
            checked={form.biddingEnabled}
            onChange={handleChange}
          />
          <label className="text-sm font-medium">
            Enable Bidding
          </label>
        </div>

        {/* IMAGE */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-rose text-white rounded-full font-semibold"
        >
          {loading ? "Uploading…" : "Upload ✨"}
        </button>
      </form>
    </div>
  );
}

export default Sell;