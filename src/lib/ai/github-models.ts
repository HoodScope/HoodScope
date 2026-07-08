import type { ScanReport } from "@/lib/types/scan";
import { generateDeterministicSummary } from "@/lib/ai-summary";
import { buildFormattedFindings } from "@/lib/finding-formatter";

const GITHUB_MODELS_URL =
  "https://models.github.ai/inference/chat/completions";

export async function generateAiSummary(report: ScanReport): Promise<{
  summary: string;
  source: "github-models" | "deterministic";
}> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return {
      summary: generateDeterministicSummary(report),
      source: "deterministic",
    };
  }

  try {
    const prompt = buildPrompt(report);
    const res = await fetch(GITHUB_MODELS_URL, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are HoodScope, a token security analyst. Explain scan results in plain language. Be factual, concise, no hype. Only reference data provided. 3-5 sentences.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      return {
        summary: generateDeterministicSummary(report),
        source: "deterministic",
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return {
        summary: generateDeterministicSummary(report),
        source: "deterministic",
      };
    }

    return { summary: content, source: "github-models" };
  } catch {
    return {
      summary: generateDeterministicSummary(report),
      source: "deterministic",
    };
  }
}

function buildPrompt(report: ScanReport): string {
  const findings = buildFormattedFindings(report)
    .filter((f) => f.severity === "DANGER" || f.severity === "WARN" || f.severity === "INFO")
    .slice(0, 12)
    .map((f) => `${f.severity}: ${f.title} — ${f.description}`)
    .join("\n");

  return [
    `Token: ${report.address} on ${report.chain}`,
    `Security score: ${report.riskScore}/100 (higher is safer)`,
    `Status: ${report.verdictLabel}`,
    `Key findings:\n${findings}`,
    report.dangerFindings.length
      ? `Danger signals: ${report.dangerFindings.map((d) => d.label).join(", ")}`
      : "No danger-level signals flagged",
  ].join("\n");
}
