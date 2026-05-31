"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const stages = [
  {
    name: "New Lead",
    leads: [
      { name: "Priya M.", tag: "Course Buyer" },
      { name: "Rahul S.", tag: "Warm Lead" },
      { name: "Ananya K.", tag: "High Intent" },
    ],
  },
  {
    name: "Qualified",
    leads: [
      { name: "Vikram P.", tag: "Business Owner" },
      { name: "Sneha R.", tag: "Fitness Goal" },
    ],
  },
  {
    name: "Call Booked",
    leads: [
      { name: "Arjun D.", tag: "High Intent" },
      { name: "Meera T.", tag: "Course Buyer" },
    ],
  },
  {
    name: "Proposal Sent",
    leads: [
      { name: "Karthik N.", tag: "Business Owner" },
      { name: "Divya L.", tag: "Warm Lead" },
    ],
  },
  {
    name: "Won",
    leads: [
      { name: "Aditya G.", tag: "Course Buyer" },
      { name: "Ritu V.", tag: "High Intent" },
      { name: "Sanjay M.", tag: "Business Owner" },
    ],
  },
];

export default function CreatorsPipeline() {
  return (
    <section className="section-cream py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="label mb-4">Lead Pipeline</p>
          <h2 className="heading-xl text-[var(--text-dark)] max-w-2xl">
            Visualize Your Entire Sales Pipeline
          </h2>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card-cream p-6 sm:p-8 rounded-[var(--radius-card)] overflow-x-auto"
        >
          <div className="flex gap-4 min-w-[900px]">
            {stages.map((stage, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                className="flex-1 flex flex-col gap-3"
              >
                {/* Stage header */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: "rgba(37,211,102,0.08)" }}
                >
                  <span
                    className="body-sm font-bold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    {stage.name}
                  </span>
                  <span
                    className="body-sm"
                    style={{ color: "var(--text-muted)", fontSize: 11 }}
                  >
                    {stage.leads.length}
                  </span>
                </div>

                {/* Lead cards */}
                <div className="flex flex-col gap-2">
                  {stage.leads.map((lead, j) => (
                    <div
                      key={j}
                      className="card p-3 flex flex-col gap-1.5"
                      style={{ borderRadius: "0.75rem" }}
                    >
                      <span
                        className="body-sm font-medium"
                        style={{ color: "var(--text-dark)", fontSize: 13 }}
                      >
                        {lead.name}
                      </span>
                      <span
                        className="inline-block self-start px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          background: "rgba(37,211,102,0.1)",
                          color: "#1a8a47",
                        }}
                      >
                        {lead.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
