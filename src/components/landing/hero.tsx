"use client";

import { motion } from "framer-motion";
import { HeroTerminal } from "@/components/brand/hero-terminal";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hood-green pt-28 pb-16 sm:pb-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        {/* Left — copy & CTAs */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-black/80 px-4 py-1.5 text-xs font-medium text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]" aria-hidden />
              AI safety agent · Robinhood Chain
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 font-display font-black text-[2.75rem] leading-[1.02] text-black sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            See Every Risk.
            <br />
            Before Every Trade.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-black/75 sm:text-lg lg:mx-0"
          >
            HoodScope combines blockchain data, security signals, and live market
            intelligence into one transparent report helping you identify risks before
            interacting with any token.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <a href="#install" className="btn-pill-primary gap-2">
              <GithubIcon className="h-4 w-4" />
              Install Agent
            </a>
            <a href="#how-it-works" className="btn-pill-secondary">
              Read the docs
            </a>
            <a
              href="https://x.com/gohoodscope"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill-secondary gap-2"
            >
              <XIcon className="h-3.5 w-3.5" />
              Follow on X
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-black/45"
          >
            <a href="#analyze" className="underline-offset-4 hover:text-black/70 hover:underline">
              Run a live scan below ↓
            </a>
          </motion.p>
        </div>

        {/* Right — terminal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="w-full lg:justify-self-end"
        >
          <HeroTerminal />
        </motion.div>
      </div>
    </section>
  );
}
