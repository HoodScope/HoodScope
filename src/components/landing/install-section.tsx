"use client";

import { motion } from "framer-motion";
import { CodeBlock } from "@/components/landing/code-block";

import { GITHUB_CLONE_URL } from "@/lib/project";

/** Demo token on Robinhood Chain — same as hero terminal & README */
const EXAMPLE_TOKEN = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";
const EXAMPLE_CHAIN = "robinhood";

const STEPS = [
  {
    step: "1",
    title: "Clone & install agent",
    description:
      "One command builds the CLI, links hoodscope globally, and optionally installs the Cursor agent skill.",
    lines: [
      { text: "# clone the repo", comment: true },
      { text: `git clone ${GITHUB_CLONE_URL}` },
      { text: "cd HoodScope && npm install" },
      { text: "npm run install:agent -- --skill" },
    ],
  },
  {
    step: "2",
    title: "Scan a token (live)",
    description:
      "Output matches the web terminal — live Robinhood Chain data via RPC, Blockscout, and DexScreener.",
    lines: [
      {
        text: `hoodscope scan ${EXAMPLE_TOKEN} --chain ${EXAMPLE_CHAIN}`,
      },
    ],
  },
  {
    step: "3",
    title: "Without global install",
    description:
      "From the repo root — same live engine, no npm link required.",
    lines: [
      { text: `npm run cli -- scan ${EXAMPLE_TOKEN} --chain ${EXAMPLE_CHAIN}` },
      { text: `npm run cli -- scan 0x... --chain ${EXAMPLE_CHAIN}` },
      { text: "npm run cli -- chains" },
      { text: "npm run cli -- skills" },
    ],
  },
  {
    step: "+",
    title: "Optional: AI summaries",
    description:
      "Add a GitHub token (models:read) for plain-language briefs alongside findings.",
    optional: true,
    lines: [
      { text: "export GITHUB_TOKEN=ghp_..." },
      {
        text: `hoodscope scan ${EXAMPLE_TOKEN} --chain ${EXAMPLE_CHAIN}`,
      },
    ],
  },
] as const;

export function InstallSection() {
  return (
    <section id="install" className="scroll-mt-20 bg-white py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-[#CCFF00] px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
            Install the agent
          </span>
          <h2 className="mt-5 font-display font-black text-4xl text-black sm:text-5xl">
            Running in under a minute.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-black/50">
            Node.js 18+ is the only requirement. Installs the global{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-sm">hoodscope</code>{" "}
            command and optional Cursor skill.
          </p>
        </div>

        <div className="mt-14 space-y-12">
          {STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06 }}
              className="grid grid-cols-[2.75rem_1fr] gap-x-4 gap-y-0 sm:grid-cols-[3.25rem_1fr] sm:gap-x-5"
            >
              <div className="flex justify-center pt-0.5">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#CCFF00] font-display text-lg font-bold text-black"
                  aria-hidden
                >
                  {item.step}
                </span>
              </div>

              <div className="min-w-0 w-full">
                <h3 className="font-display font-bold text-xl text-black sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-black/50 sm:text-base">
                  {item.description}
                </p>
                <div className="mt-3.5 w-full">
                  <CodeBlock lines={[...item.lines]} />
                </div>
                {"optional" in item && item.optional && (
                  <p className="mt-3 text-xs text-black/40">
                    Windows:{" "}
                    <code className="rounded bg-black/5 px-1 py-0.5">
                      npm run install:agent:skill
                    </code>{" "}
                    or{" "}
                    <code className="rounded bg-black/5 px-1 py-0.5">
                      scripts/install-cli.ps1
                    </code>
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
