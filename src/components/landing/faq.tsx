"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "What is HoodScope?",
    a: "An AI token security platform that analyzes contracts, liquidity, ownership, and market activity before you trade.",
  },
  {
    q: "Does HoodScope connect to my wallet?",
    a: "No. Read-only analysis — no signatures, approvals, or private keys.",
  },
  {
    q: "Is HoodScope financial advice?",
    a: "No. Objective security analysis only. Trading decisions are yours.",
  },
  {
    q: "Where does the data come from?",
    a: "Robinhood Chain RPC, GoPlus Security API, and DexScreener API. Public sources only.",
  },
  {
    q: "How reliable are the results?",
    a: "Findings are deterministic from blockchain data. AI summarizes — never alters the analysis.",
  },
  {
    q: "Is HoodScope free?",
    a: "Yes. Free core analysis, no account or wallet required.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-black/40">FAQ</p>
          <h2 className="mt-3 font-display font-bold text-3xl text-black sm:text-4xl">
            Common questions.
          </h2>
        </div>

        <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="pr-4 font-medium text-black">{faq.q}</span>
                  {isOpen ? (
                    <Minus className="h-4 w-4 shrink-0 text-black/40" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-black/40" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-black/60">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
