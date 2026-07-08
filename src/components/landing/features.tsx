"use client";

import { motion } from "framer-motion";
import { Shield, Percent, Droplets, FileCode, Key, BarChart3 } from "lucide-react";

const features = [
  {
    icon: FileCode,
    title: "Contract Security",
    description:
      "Permissions, ownership, verification, upgradeability, mint functions, and hidden admin privileges.",
  },
  {
    icon: Shield,
    title: "Trading Restrictions",
    description:
      "Honeypots, transfer limits, trading locks, and mechanisms that block selling.",
  },
  {
    icon: Percent,
    title: "Token Economics",
    description:
      "Buy and sell taxes, supply mechanics, mint permissions, and transaction limits.",
  },
  {
    icon: Droplets,
    title: "Liquidity Health",
    description:
      "Liquidity depth, LP ownership, price impact, and market stability.",
  },
  {
    icon: Key,
    title: "Ownership Analysis",
    description:
      "Whether ownership is renounced, multisig-controlled, or retains admin control.",
  },
  {
    icon: BarChart3,
    title: "Live Market Intelligence",
    description:
      "Real-time price, market cap, liquidity, volume, and trading activity.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-cream py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display font-bold text-3xl text-black sm:text-4xl">
            What HoodScope Analyzes
          </h2>
          <p className="mt-4 text-base text-black/60">
            Blockchain analysis, security intelligence, and live market data — verifiable findings only.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-black/8 bg-white p-6"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-hood-green">
                <feature.icon className="h-4 w-4 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="font-display font-bold text-base text-black">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
