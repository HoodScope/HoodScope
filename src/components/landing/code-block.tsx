"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CodeLine {
  text: string;
  comment?: boolean;
}

interface CodeBlockProps {
  lines: CodeLine[];
  className?: string;
}

const HIGHLIGHT =
  /\b(git clone|cd HoodScope|npm install|npm run|chmod|hoodscope|scan|--chain|export GITHUB_TOKEN|\.\/scripts\/install-cli\.sh)\b/g;

function renderLine(line: CodeLine): ReactNode {
  if (line.comment) {
    return <span className="text-white/35">{line.text}</span>;
  }

  const parts: ReactNode[] = [];
  let last = 0;
  const text = line.text;

  for (const match of text.matchAll(HIGHLIGHT)) {
    const idx = match.index ?? 0;
    if (idx > last) {
      parts.push(
        <span key={`t-${last}`} className="text-white/85">
          {text.slice(last, idx)}
        </span>
      );
    }
    parts.push(
      <span key={`k-${idx}`} className="text-[#CCFF00]">
        {match[0]}
      </span>
    );
    last = idx + match[0].length;
  }

  if (last < text.length) {
    parts.push(
      <span key={`t-${last}`} className="text-white/85">
        {text.slice(last)}
      </span>
    );
  }

  return parts.length ? parts : <span className="text-white/85">{text}</span>;
}

export function CodeBlock({ lines, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const copyText = lines.map((l) => l.text).join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative block w-full rounded-xl border border-white/[0.06] bg-[#111111] font-mono text-[12px] leading-[1.7] shadow-sm sm:text-[13px]",
        className
      )}
    >
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 rounded-md border border-white/10 bg-[#1a1a1a] px-2 py-0.5 text-[10px] text-white/55 transition-colors hover:bg-[#252525] hover:text-white/90"
        aria-label="Copy code"
      >
        {copied ? (
          <>
            <Check className="h-2.5 w-2.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-2.5 w-2.5" />
            Copy
          </>
        )}
      </button>

      <div className="overflow-x-auto px-4 py-3.5 pr-[4.5rem]">
        <div className="space-y-0.5">
          {lines.map((line, i) => (
            <div key={i} className="whitespace-nowrap">
              {renderLine(line)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
