export const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  black: "\x1b[30m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
  hoodGreen: "\x1b[38;2;204;255;0m",
  teal: "\x1b[38;2;0;200;200m",
};

export type Severity = "ok" | "info" | "warn" | "danger";

export function sevColor(sev: Severity): string {
  switch (sev) {
    case "ok":
      return c.green;
    case "info":
      return c.cyan;
    case "warn":
      return c.yellow;
    case "danger":
      return c.red;
  }
}

export function statusBg(verdict: string): string {
  switch (verdict) {
    case "CLEAR":
      return c.bgGreen + c.black;
    case "REVIEW":
      return c.bgYellow + c.black;
    default:
      return c.bgRed + c.white;
  }
}

export function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-4)}`;
}

export function padEnd(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + " ".repeat(len - str.length);
}
