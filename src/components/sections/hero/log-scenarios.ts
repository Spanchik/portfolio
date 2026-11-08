/**
 * Synthetic demo events. Every line mirrors a real code path in the projects
 * (verified against the HR_Platform status and the HR Assistant server code),
 * but no line is a real system event: all entities carry the DEMO- prefix and
 * nothing here talks to any external system.
 */
import type { NodeId, ProjectId } from "./console-data";

export type LogLevel = "SYS" | "INFO" | "OK" | "STAT";

export type LogEntry = {
  level: LogLevel;
  scope: string;
  msg: string;
  /** Which system map the event belongs to. */
  project?: ProjectId;
  /** Node the event is about (highlighted on the map). */
  node?: NodeId;
  /** Edge a packet travels along when the event is emitted. */
  edge?: string;
};

export const SCENARIO: readonly LogEntry[] = [
  { level: "SYS", scope: "demo.start", msg: "synthetic replay · not connected to real systems" },

  // HR_PLATFORM
  { level: "INFO", scope: "hr-platform", msg: "DEMO-CAND-017 status: offer accepted → hired", project: "platform", node: "recruit", edge: "recruit-core" },
  { level: "INFO", scope: "hr-platform", msg: "onboarding process started → DEMO-CAND-017", project: "platform", node: "hrproc", edge: "hrproc-core" },
  { level: "OK", scope: "1c", msg: "http-service on 1C side: configured", project: "platform", node: "c1" },
  { level: "STAT", scope: "1c", msg: "platform ↔ 1C integration: IN PROGRESS", project: "platform", node: "c1" },
  { level: "STAT", scope: "analytics", msg: "management reports: IN DEVELOPMENT", project: "platform", node: "analytics" },

  // HR_ASSISTANT — AI agent + employee self-service
  { level: "INFO", scope: "ai-agent", msg: "incoming request → DEMO-USER-017", project: "assistant", node: "agent", edge: "tg-agent" },
  { level: "INFO", scope: "access", msg: "role resolved → employee", project: "assistant", node: "rbac", edge: "rbac-agent" },
  { level: "INFO", scope: "ai-agent", msg: "tool call → get_my_salary", project: "assistant", node: "tools", edge: "agent-tools" },
  { level: "INFO", scope: "1c-utp", msg: "employee data read (read-only) → DEMO-USER-017", project: "assistant", node: "utp", edge: "tools-utp" },

  // HR_ASSISTANT — approval workflow
  { level: "INFO", scope: "approval", msg: "vacation request received → DEMO-REQ-204", project: "assistant", node: "approval", edge: "tools-approval" },
  { level: "INFO", scope: "routing", msg: "employee → department head", project: "assistant", node: "approval" },
  { level: "OK", scope: "approval", msg: "approver resolved → DEMO-MANAGER-12", project: "assistant", node: "sqlite", edge: "approval-sqlite" },

  // HR_ASSISTANT — HR operations
  { level: "INFO", scope: "hr-tools", msg: "headcount report requested → DEMO-REPORT-01", project: "assistant", node: "tools", edge: "agent-tools" },
  { level: "INFO", scope: "sheets", msg: "staffing data retrieved → DEMO-REPORT-01", project: "assistant", node: "sheets", edge: "tools-sheets" },

  // HR_ASSISTANT — admin panel
  { level: "INFO", scope: "admin-panel", msg: "approval routing settings opened", project: "assistant", node: "web", edge: "web-api" },

  { level: "SYS", scope: "demo.loop", msg: "replaying synthetic scenario" },
];

/** Lines rendered on the server before the stream starts (fixed, hydration-safe times). */
export const INITIAL_COUNT = 5;
const SNAPSHOT_STEP_MS = 680;

export type LogLine = LogEntry & { id: number; t: number; animate: boolean };

export const snapshot = (count: number): LogLine[] =>
  SCENARIO.slice(0, count).map((entry, i) => ({ ...entry, id: i, t: i * SNAPSHOT_STEP_MS, animate: false }));

export const INITIAL_LINES = snapshot(INITIAL_COUNT);
/** Full static view used when the visitor prefers reduced motion. */
export const FULL_SNAPSHOT = snapshot(SCENARIO.length);

const pad = (n: number, w: number) => String(n).padStart(w, "0");

/** Relative demo clock: +MM:SS.mmm */
export function formatOffset(ms: number) {
  const total = Math.max(0, Math.floor(ms));
  const m = Math.floor(total / 60000) % 100;
  const s = Math.floor(total / 1000) % 60;
  return `+${pad(m, 2)}:${pad(s, 2)}.${pad(total % 1000, 3)}`;
}

export const LEVEL_WIDTH = 5;
export const SCOPE_WIDTH = 13; // longest scope "[admin-panel]"
export const TYPE_MS_PER_CHAR = 10;

/** Columns of a rendered line, padded so every line is a fixed-width monospace string. */
export function lineColumns(line: LogLine) {
  const time = formatOffset(line.t);
  const level = line.level.padEnd(LEVEL_WIDTH);
  const scope = `[${line.scope}]`.padEnd(SCOPE_WIDTH);
  return { time, level, scope, msg: line.msg, length: time.length + 2 + level.length + 1 + scope.length + 1 + line.msg.length };
}
