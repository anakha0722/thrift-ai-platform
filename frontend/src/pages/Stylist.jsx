import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Stylist() {
  const navigate = useNavigate();

  const [mood, setMood] = useState("");
  const [occasion, setOccasion] = useState("");
  const [color, setColor] = useState("");
  const [result, setResult] = useState("");

  const generateStyle = () => {
    if (!mood || !occasion || !color) {
      setResult("Please select all options ✨");
      return;
    }

    setResult(
      `For a ${occasion.toLowerCase()} look, we recommend a ${color.toLowerCase()} outfit with a ${mood.toLowerCase()} silhouette. 
This combination flatters your vibe while keeping things sustainable and effortlessly stylish. 🌷✨`
    );
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-28 text-cocoa">
      <div className="max-w-3xl mx-auto">

        {/* 🌸 HEADER */}
        <h1 className="text-5xl font-extrabold mb-4 text-center">
          Your <span className="text-rose">AI Stylist</span>
        </h1>
        <p className="text-center text-cocoa/70 mb-16">
          Let AI curate a look just for you ✨
        </p>

        {/* 🌷 STYLIST CARD */}
        <div className="bg-softpink rounded-[2.5rem]
                        shadow-[0_30px_60px_rgba(0,0,0,0.08)]
                        p-10 space-y-6">

          {/* MOOD */}
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full px-6 py-4 rounded-full
                       bg-cream border border-blush
                       focus:outline-none focus:ring-2
                       focus:ring-rose"
          >
            <option value="">Choose your vibe</option>
            <option>Soft & Feminine</option>
            <option>Minimal & Clean</option>
            <option>Bold & Confident</option>
            <option>Casual & Cozy</option>
          </select>

          {/* OCCASION */}
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full px-6 py-4 rounded-full
                       bg-cream border border-blush
                       focus:outline-none focus:ring-2
                       focus:ring-rose"
          >
            <option value="">Select an occasion</option>
            <option>Everyday Wear</option>
            <option>College / Work</option>
            <option>Brunch / Outing</option>
            <option>Evening Event</option>
          </select>

          {/* COLOR */}
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full px-6 py-4 rounded-full
                       bg-cream border border-blush
                       focus:outline-none focus:ring-2
                       focus:ring-rose"
          >
            <option value="">Preferred color palette</option>
            <option>Neutral tones</option>
            <option>Soft pastels</option>
            <option>Bold colors</option>
            <option>Monochrome</option>
          </select>

          {/* BUTTON */}
          <button
            onClick={generateStyle}
            className="w-full py-4 rounded-full
                       bg-rose text-white
                       font-semibold text-lg
                       hover:opacity-90 transition"
          >
            Style Me ✨
          </button>

          {/* RESULT */}
          {result && (
            <div className="mt-8 bg-cream rounded-3xl p-6">
              <p className="text-cocoa leading-relaxed">
                {result}
              </p>

              <button
                onClick={() => navigate("/buy")}
                className="mt-6 px-6 py-3 rounded-full
                           bg-blush text-cocoa
                           hover:bg-rose hover:text-white
                           transition"
              >
                Shop This Look 💕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Stylist;
