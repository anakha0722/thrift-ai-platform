import { useState } from "react";
import axios from "axios";

function Sell() {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    size: "",
    gender: "",
    category: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) =>
      data.append(key, formData[key])
    );
    if (image) data.append("image", image);

    try {
      await axios.post(
        "http://localhost:5000/api/products",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✨ Product uploaded successfully!");
      setFormData({
        title: "",
        description: "",
        price: "",
        size: "",
        gender: "",
        category: "",
      });
      setImage(null);
    } catch (err) {
      alert("Upload failed 😔");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-28 text-cocoa">
      <div className="max-w-xl mx-auto bg-softpink rounded-[2.5rem]
                      shadow-[0_30px_60px_rgba(0,0,0,0.08)]
                      p-10">

        {/* 🌸 HEADER */}
        <h1 className="text-4xl font-bold mb-2">
          Sell on <span className="text-rose">ReWear</span>
        </h1>
        <p className="text-cocoa/70 mb-10">
          Share your piece with the community 🌷
        </p>

        {/* 🌷 FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="title"
            placeholder="Item title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-full
                       bg-cream border border-blush
                       focus:outline-none focus:ring-2
                       focus:ring-rose"
            required
          />

          <textarea
            name="description"
            placeholder="Short description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-5 py-4 rounded-3xl
                       bg-cream border border-blush
                       focus:outline-none focus:ring-2
                       focus:ring-rose"
            required
          />

          <input
            name="price"
            type="number"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-full
                       bg-cream border border-blush
                       focus:outline-none focus:ring-2
                       focus:ring-rose"
            required
          />

          {/* 🌸 DROPDOWNS */}
          <div className="grid grid-cols-2 gap-4">
            <select
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="px-5 py-4 rounded-full bg-cream border border-blush"
              required
            >
              <option value="">Size</option>
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
            </select>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="px-5 py-4 rounded-full bg-cream border border-blush"
              required
            >
              <option value="">Gender</option>
              <option>Men</option>
              <option>Women</option>
              <option>Unisex</option>
            </select>
          </div>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-full bg-cream border border-blush"
            required
          >
            <option value="">Category</option>
            <option>Topwear</option>
            <option>Bottomwear</option>
            <option>Dresses</option>
            <option>Outerwear</option>
          </select>

          {/* 🌷 FILE UPLOAD */}
          <label className="block">
            <div className="w-full px-5 py-4 rounded-full
                            bg-blush text-cocoa text-center
                            cursor-pointer hover:bg-rose
                            hover:text-white transition">
              {image ? "Image selected ✨" : "Upload product image"}
            </div>
            <input
              type="file"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </label>

          {/* 🌸 SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full
                       bg-rose text-white
                       font-semibold text-lg
                       hover:opacity-90 transition"
          >
            {loading ? "Uploading…" : "Upload Item ✨"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Sell;
