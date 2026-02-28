import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    size: "",
    gender: "",
    category: "",
  });

  // ======================
  // LOAD PRODUCT DATA
  // ======================
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );

        setFormData({
          title: res.data.title || "",
          description: res.data.description || "",
          price: res.data.price || "",
          size: res.data.size || "",
          gender: res.data.gender || "",
          category: res.data.category || "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Load product error", err);
        alert("Failed to load product");
      }
    };

    loadProduct();
  }, [id]);

  // ======================
  // HANDLE INPUT CHANGE
  // ======================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ======================
  // SUBMIT UPDATE
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/api/products/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Product updated successfully!");
      navigate("/seller-dashboard");
    } catch (err) {
      console.error("Update error", err);
      alert("Update failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-cream px-6 py-24">
      <h2 className="text-3xl font-bold text-center mb-8">
        Edit Product
      </h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-white p-6 rounded shadow"
      >
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          name="size"
          value={formData.size}
          onChange={handleChange}
          placeholder="Size"
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          placeholder="Gender"
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          className="w-full mb-4 p-2 border rounded"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Update Product
          </button>

          <button
            type="button"
            onClick={() => navigate("/seller-dashboard")}
            className="bg-gray-400 text-white px-4 py-2 rounded w-full"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProduct;
