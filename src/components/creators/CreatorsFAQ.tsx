"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const faqs = [
  {
    q: "Can Tellero work for coaches?",
    a: "Absolutely. Tellero is built for coaches, consultants, course creators, and anyone who sells services or digital products through Instagram and WhatsApp.",
  },
  {
    q: "Can Tellero work without Shopify?",
    a: "Yes! Tellero works independently. You don't need an ecommerce store. If you sell courses, coaching, consulting, or any service — Tellero is for you.",
  },
  {
    q: "Can I automate Instagram DMs?",
    a: "Yes. When someone comments a trigger word on your post, Tellero automatically sends them a DM and captures them as a lead in your WhatsApp CRM.",
  },
  {
    q: "Can I track leads through a pipeline?",
    a: "Yes. Tellero includes a visual pipeline where you can track every lead from first touch to conversion.",
  },
  {
    q: "Can I send WhatsApp broadcasts?",
    a: "Yes. Send targeted broadcasts to segmented lists — perfect for course launches, webinar reminders, and promotions.",
  },
  {
    q: "Can I manage discovery call prospects?",
    a: "Yes. Tag leads as 'Discovery Call', track them through your pipeline, and automate follow-up sequences.",
  },
  {
    q: "Can I use Tellero as my CRM?",
    a: "Yes. Tellero replaces your Google Sheets and Notion databases with a purpose-built WhatsApp CRM designed for creators.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span
          className="body-md font-semibold"
          style={{ color: "var(--text-dark)" }}
        >
          {q}
        </span>
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{
            background: open ? "var(--text-dark)" : "rgba(26,20,17,0.06)",
            color: open ? "white" : "var(--text-dark)",
            transition: "all 0.2s",
          }}
        >
          {open ? "−" : "+"}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p
              className="body-sm pb-5"
              style={{ color: "var(--text-mid)" }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CreatorsFAQ() {
  return (
    <section className="section-cream-2 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="label mb-4">FAQ</p>
          <h2 className="heading-xl text-[var(--text-dark)]">
            Questions creators ask us
          </h2>
        </motion.div>

        <div>
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
