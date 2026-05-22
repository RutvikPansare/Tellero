"use client";

const brands = [
  "Glow Naturals","Rang Collective","The Herb Box","Kama Ayurveda",
  "Mamaearth","Bombay Shaving Co.","Plum","mCaffeine","Juicy Chemistry",
  "Sugar Cosmetics","Wow Skin Science","Nykaa D2C","The Moms Co.","Beardo","Minimalist",
];

export default function Marquee() {
  const doubled = [...brands, ...brands];
  return (
    <section className="section-cream-2 py-14 border-y" style={{ borderColor: "rgba(26,20,17,0.07)" }}>
      <p className="label text-center mb-10">
        Trusted by India&apos;s fastest-growing D2C brands
      </p>
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {doubled.map((brand, i) => (
            <span key={i} className="inline-flex items-center px-8 font-semibold text-base whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
              {brand}
              <span className="mx-8" style={{ color: "var(--cream-3)" }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
