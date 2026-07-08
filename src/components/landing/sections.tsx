"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const stats = [
  { value: "25+", label: "Security Signals" },
  { value: "3", label: "Trusted Data Sources" },
  { value: "8", label: "Supported Networks" },
  { value: "100%", label: "Read-only Analysis" },
];

export function StatsBar() {
  return (
    <div className="border-y border-black/8 bg-white py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <p className="font-display font-black text-4xl text-black">{stat.value}</p>
            <p className="mt-1 text-sm text-black/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function CtaSection() {
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-black text-4xl text-black sm:text-5xl">
            See Every Risk Before You Trade.
          </h2>
          <p className="mt-4 text-base text-black/60">
            Transparent blockchain intelligence with trusted security data and AI explanations.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="#install" className="btn-pill-primary">
              Install Agent
            </Link>
            <Link href="#how-it-works" className="btn-pill-secondary">
              View Documentation
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const steps = [
  {
    step: "Step 1",
    title: "Install CLI",
    description:
      "Run hoodscope scan from your terminal. Same engine powers the live analyzer on this page.",
  },
  {
    step: "Step 2",
    title: "Collect",
    description:
      "On-chain data from chain RPC, GoPlus Security, and DexScreener. Read-only — no wallet or transactions.",
  },
  {
    step: "Step 3",
    title: "Report",
    description:
      "Risk score, CLEAR/REVIEW/FLAGGED verdict, full findings table, and AI summary — all in terminal output.",
  },
];

const statusLabels = [
  { label: "CLEAR", description: "Low security risk.", color: "#CCFF00" },
  { label: "REVIEW", description: "Findings need attention.", color: "#F5A623" },
  { label: "FLAGGED", description: "Significant concerns detected.", color: "#FF3B30" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-black/40">
            Documentation
          </p>
          <h2 className="mt-3 font-display font-bold text-3xl text-black sm:text-4xl">
            How HoodScope Works
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-black/8 bg-cream p-6"
            >
              <span className="font-mono text-xs font-semibold text-black/40">
                {item.step}
              </span>
              <h3 className="mt-3 font-display font-bold text-lg text-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/60">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-10">
          {statusLabels.map((level) => (
            <div key={level.label} className="text-center">
              <div className="flex items-center justify-center gap-3">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: level.color }}
                />
                <span className="font-display font-bold text-sm text-black">{level.label}</span>
              </div>
              <p className="mt-1 text-sm text-black/40">{level.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
