"use client";

import { motion } from "framer-motion";

/* PLACEHOLDER testimonials — replace with real beta user quotes */
const testimonials = [
  { quote: "Our COD return rate dropped from 34% to 7% in the first month. Tellero paid for itself in week one.", name: "Priya S.", brand: "Glow Naturals", meta: "Skincare · Bangalore", stars: 5 },
  { quote: "I was paying ₹3,200/month for a tool that did half of what Tellero does. I switched and saved ₹28,000 in the first year.", name: "Rahul M.", brand: "Rang Collective", meta: "Fashion · Surat", stars: 5 },
  { quote: "The reorder reminder alone brings in ₹15,000 extra every month. I didn't have to do anything — it just runs.", name: "Sneha K.", brand: "The Herb Box", meta: "Organic food · Pune", stars: 5 },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4" style={{ color: "#7C6CE0" }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="section-cream-2 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="label mb-4">Proof</p>
          <h2 className="heading-xl text-[var(--text-dark)] max-w-xl">
            Don&apos;t take our word for it.{" "}
            <span style={{ color: "var(--text-mid)" }}>Take theirs.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-7 flex flex-col justify-between gap-6"
            >
              <div>
                <Stars count={t.stars} />
                <p className="body-md mt-4" style={{ color: "var(--text-dark)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div
                className="flex items-center gap-3 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "var(--cream-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-dark)",
                  }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="body-sm font-semibold" style={{ color: "var(--text-dark)" }}>
                    {t.name} · {t.brand}
                  </p>
                  <p className="body-sm" style={{ fontSize: 11 }}>{t.meta}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
