"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function ROICalculator() {
  const [codOrders, setCodOrders] = useState(200);
  const [aov, setAov] = useState(800);
  const [carts, setCarts] = useState(150);

  const results = useMemo(() => {
    const rtoSaving    = Math.round(codOrders * 0.25) * aov * 0.2;
    const cartRevenue  = Math.round(carts * 0.38) * aov;
    const reorderRev   = Math.round(codOrders * 0.12) * aov;
    const total        = rtoSaving + cartRevenue + reorderRev;
    const roi          = Math.round((total / 799) * 100);
    return { rtoSaving, cartRevenue, reorderRev, total, roi };
  }, [codOrders, aov, carts]);

  const sliders = [
    { label: "Monthly COD orders",     value: codOrders, setter: setCodOrders, min: 10,  max: 2000, step: 10, display: codOrders.toString() },
    { label: "Average order value (₹)", value: aov,       setter: setAov,       min: 200, max: 5000, step: 50, display: `₹${aov}` },
    { label: "Monthly abandoned carts", value: carts,     setter: setCarts,     min: 10,  max: 2000, step: 10, display: carts.toString() },
  ];

  return (
    <section className="section-cream py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="label mb-4">ROI Calculator</p>
          <h2 className="heading-xl text-[var(--text-dark)] leading-tight mb-4">
            Want more revenue from your WhatsApp list?
          </h2>
          <p className="body-lg max-w-lg mx-auto">
            See how much Tellero can generate for your brand in the first 30 days.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          {/* Inputs */}
          <div className="card p-8 flex flex-col gap-8">
            <p className="label">Your store numbers</p>
            {sliders.map((field) => (
              <div key={field.label}>
                <div className="flex justify-between mb-3">
                  <label className="body-sm">{field.label}</label>
                  <span className="body-sm font-bold" style={{ color: "var(--text-dark)" }}>
                    {field.display}
                  </span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={field.value}
                  onChange={(e) => field.setter(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--text-dark) 0%, var(--text-dark) ${
                      ((field.value - field.min) / (field.max - field.min)) * 100
                    }%, var(--cream-3) ${
                      ((field.value - field.min) / (field.max - field.min)) * 100
                    }%, var(--cream-3) 100%)`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Results */}
          <div
            className="card-burgundy p-8 flex flex-col gap-5"
          >
            <p className="label-lime">Estimated monthly impact</p>

            {[
              { label: "COD return losses prevented",     value: results.rtoSaving  },
              { label: "Recovered abandoned cart revenue", value: results.cartRevenue },
              { label: "Reorder reminder revenue",         value: results.reorderRev },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between pb-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="body-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {row.label}
                </span>
                <span className="font-bold text-white text-base">
                  ₹{row.value.toLocaleString("en-IN")}
                </span>
              </div>
            ))}

            <div className="pt-2">
              <p className="label-lime mb-2">Total monthly value</p>
              <p className="heading-xl" style={{ color: "var(--lime)", lineHeight: 1 }}>
                ₹{results.total.toLocaleString("en-IN")}
              </p>
              <p className="body-sm mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                vs ₹799/month = {results.roi}% ROI
              </p>
            </div>

            <a href="#" className="btn btn-lime mt-auto">
              Calculate my ROI →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
