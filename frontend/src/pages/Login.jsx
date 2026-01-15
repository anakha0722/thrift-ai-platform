import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      navigate("/buy");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-softpink rounded-[2.5rem]
                      shadow-[0_30px_60px_rgba(0,0,0,0.08)]
                      p-10">

        {/* 🌸 BRAND */}
        <h1 className="text-4xl font-extrabold text-center mb-2">
          Re<span className="text-rose">Wear</span>
        </h1>
        <p className="text-center text-cocoa/70 mb-10">
          Welcome back, beautiful ✨
        </p>

        {/* 🌷 FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
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
            {loading ? "Signing you in…" : "Login ✨"}
          </button>
        </form>

        {/* 🌷 FOOTER */}
        <p className="text-center text-sm text-cocoa/60 mt-8">
          New here?{" "}
          <span className="text-rose cursor-pointer hover:underline">
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
