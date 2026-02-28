function Hero() {
  const scrollToProducts = () => {
    const section = document.getElementById("featured-products");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="h-[75vh] flex items-center justify-center text-center
                 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative text-white px-6 max-w-2xl">
        <h1 className="text-6xl font-extrabold mb-4">
          Re<span className="text-rose">Wear</span>
        </h1>

        <p className="mb-6 text-lg text-white/90">
          Buy, sell & restyle pre-loved fashion.
          Smart sustainable shopping powered by AI.
        </p>

        <div className="flex justify-center gap-6 flex-wrap">
          <button
            onClick={scrollToProducts}
            className="px-8 py-3 bg-rose rounded-full hover:opacity-90"
          >
            Shop Now
          </button>

          <button
            onClick={() => (window.location.href = "/sell")}
            className="px-8 py-3 border border-white rounded-full hover:bg-white hover:text-black transition"
          >
            Sell Clothes
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
