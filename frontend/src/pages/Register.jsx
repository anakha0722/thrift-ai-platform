import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isJoinSeller =
    searchParams.get("role") === "seller" ||
    location.state?.fromSeller;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(isJoinSeller ? "seller" : "buyer"); // 1️⃣ role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // register user
      const res = await axios.post(
        "https://thrift-ai-platform.vercel.app/api/auth/register",
        { name, email, password, role }
      );

      // 2️⃣ AUTO LOGIN AFTER SIGNUP
      localStorage.setItem("token", res.data.token);
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      window.dispatchEvent(new Event("storage"));

      // redirect based on flow
      if (isJoinSeller || role === "seller") {
        navigate("/sell", { replace: true });
      } else {
        navigate("/buy", { replace: true });
      }
    } catch (err) {
      setError("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 3️⃣ FADE ANIMATION
    <div className="min-h-screen bg-cream flex items-center justify-center px-6
                    animate-fadeIn">
      <div
        className="w-full max-w-md bg-softpink rounded-[2.5rem]
                   shadow-[0_30px_60px_rgba(0,0,0,0.08)]
                   p-10"
      >
        {/* 🌸 BRAND */}
        <h1 className="text-4xl font-extrabold text-center mb-2">
          Re<span className="text-rose">Wear</span>
        </h1>
        <p className="text-center text-cocoa/70 mb-10">
          Create your account ✨
        </p>

        {/* 🌷 FORM */}
        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 rounded-full
                       bg-cream border border-blush
                       focus:outline-none focus:ring-2
                       focus:ring-rose text-cocoa"
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-full
                       bg-cream border border-blush
                       focus:outline-none focus:ring-2
                       focus:ring-rose text-cocoa"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-full
                       bg-cream border border-blush
                       focus:outline-none focus:ring-2
                       focus:ring-rose text-cocoa"
            required
          />

          {/* 1️⃣ ROLE SELECT */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-5 py-4 rounded-full
                       bg-cream border border-blush
                       focus:outline-none focus:ring-2
                       focus:ring-rose text-cocoa"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>

          {error && (
            <p className="text-sm text-center text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full
                       bg-rose text-white font-semibold
                       text-lg hover:opacity-90 transition"
          >
            {loading ? "Creating account…" : "Sign Up ✨"}
          </button>
        </form>

        {/* 🌷 FOOTER */}
        <p className="text-center text-sm text-cocoa/60 mt-8">
          Already have an account?{" "}
          <span
            onClick={() =>
              navigate(isJoinSeller ? "/login?role=seller" : "/login", {
                state: isJoinSeller ? { fromSeller: true } : undefined,
              })
            }
            className="text-rose cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
