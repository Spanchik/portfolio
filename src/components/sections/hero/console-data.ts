/**
 * System map model for the hero console.
 *
 * Every node and edge reflects verified architecture:
 * - HR_ASSISTANT — audited against the server deployment (/opt/svgroup-stack).
 * - HR_PLATFORM — statuses as confirmed by the owner (1C integration in progress,
 *   analytics in development, LMS planned).
 * Coordinates live in a 640×400 design space; nodes are positioned in % of it.
 */
export type ProjectId = "assistant" | "platform";

export type StatusKey = "implemented" | "inProgress" | "inDevelopment" | "planned";

export type NodeId =
  // HR_ASSISTANT
  | "tg"
  | "web"
  | "api"
  | "rbac"
  | "agent"
  | "tools"
  | "utp"
  | "bas"
  | "sheets"
  | "approval"
  | "sqlite"
  // HR_PLATFORM
  | "recruit"
  | "hrproc"
  | "core"
  | "c1"
  | "analytics"
  | "lms";

export type MapNode = {
  id: NodeId;
  label: string;
  sub?: string;
  x: number;
  y: number;
  status?: StatusKey;
};

/** solid = working path, progress = being built, planned = not started. */
export type EdgeKind = "solid" | "progress" | "planned";

export type MapEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
  kind: EdgeKind;
  /** Orthogonal route, design-space points, from → to. */
  points: [number, number][];
};

export const VIEW = { w: 640, h: 360 } as const;

/** Layouts below are authored on a 640×400 grid and compressed vertically to 16:9. */
const SY = 360 / 400;

const RAW_MAPS: Record<ProjectId, { nodes: MapNode[]; edges: MapEdge[] }> = {
  assistant: {
    nodes: [
      { id: "tg", label: "Telegram Bot", sub: "interface", x: 78, y: 120 },
      { id: "web", label: "Web Panel", sub: "admin · Flask", x: 78, y: 290 },
      { id: "api", label: "HTTP Agent API", sub: "web → agent", x: 205, y: 290 },
      { id: "rbac", label: "Access · RBAC", sub: "Python", x: 330, y: 70 },
      { id: "agent", label: "LLM Agent", sub: "tool calling", x: 330, y: 200 },
      { id: "tools", label: "Tools", sub: "role-filtered", x: 455, y: 200 },
      { id: "approval", label: "Approval", sub: "routing", x: 455, y: 320 },
      { id: "utp", label: "1C UTP", sub: "read-only", x: 572, y: 70 },
      { id: "bas", label: "BAS Retail", sub: "read-only", x: 572, y: 150 },
      { id: "sheets", label: "Google Sheets", sub: "read", x: 572, y: 230 },
      { id: "sqlite", label: "SQLite", sub: "requests · audit", x: 572, y: 320 },
    ],
    edges: [
      { id: "tg-agent", from: "tg", to: "agent", kind: "solid", points: [[78, 120], [262, 120], [262, 200], [330, 200]] },
      { id: "web-api", from: "web", to: "api", kind: "solid", points: [[78, 290], [205, 290]] },
      { id: "api-agent", from: "api", to: "agent", kind: "solid", points: [[205, 290], [262, 290], [262, 200], [330, 200]] },
      { id: "rbac-agent", from: "rbac", to: "agent", kind: "solid", points: [[330, 70], [330, 200]] },
      { id: "rbac-tools", from: "rbac", to: "tools", kind: "solid", points: [[330, 70], [455, 70], [455, 200]] },
      { id: "agent-tools", from: "agent", to: "tools", kind: "solid", points: [[330, 200], [455, 200]] },
      { id: "tools-utp", from: "tools", to: "utp", kind: "solid", points: [[455, 200], [514, 200], [514, 70], [572, 70]] },
      { id: "tools-bas", from: "tools", to: "bas", kind: "solid", points: [[455, 200], [514, 200], [514, 150], [572, 150]] },
      { id: "tools-sheets", from: "tools", to: "sheets", kind: "solid", points: [[455, 200], [514, 200], [514, 230], [572, 230]] },
      { id: "tools-approval", from: "tools", to: "approval", kind: "solid", points: [[455, 200], [455, 320]] },
      { id: "approval-sqlite", from: "approval", to: "sqlite", kind: "solid", points: [[455, 320], [572, 320]] },
      { id: "api-sqlite", from: "api", to: "sqlite", kind: "solid", points: [[205, 290], [205, 372], [572, 372], [572, 320]] },
    ],
  },
  platform: {
    nodes: [
      { id: "recruit", label: "Recruitment", sub: "hiring", x: 110, y: 120, status: "implemented" },
      { id: "hrproc", label: "HR processes", sub: "onboarding", x: 110, y: 280, status: "implemented" },
      { id: "core", label: "HR_Platform", sub: "ecosystem", x: 310, y: 200 },
      { id: "c1", label: "1C HTTP service", sub: "configured", x: 520, y: 90, status: "inProgress" },
      { id: "analytics", label: "Mgmt analytics", sub: "reports", x: 520, y: 200, status: "inDevelopment" },
      { id: "lms", label: "LMS", sub: "next stage", x: 520, y: 310, status: "planned" },
    ],
    edges: [
      { id: "recruit-core", from: "recruit", to: "core", kind: "solid", points: [[110, 120], [220, 120], [220, 200], [310, 200]] },
      { id: "hrproc-core", from: "hrproc", to: "core", kind: "solid", points: [[110, 280], [220, 280], [220, 200], [310, 200]] },
      { id: "core-c1", from: "core", to: "c1", kind: "progress", points: [[310, 200], [415, 200], [415, 90], [520, 90]] },
      { id: "core-analytics", from: "core", to: "analytics", kind: "progress", points: [[310, 200], [520, 200]] },
      { id: "core-lms", from: "core", to: "lms", kind: "planned", points: [[310, 200], [415, 200], [415, 310], [520, 310]] },
    ],
  },
};

const squash = (m: { nodes: MapNode[]; edges: MapEdge[] }) => ({
  nodes: m.nodes.map((n) => ({ ...n, y: n.y * SY })),
  edges: m.edges.map((e) => ({ ...e, points: e.points.map(([x, y]) => [x, y * SY] as [number, number]) })),
});

export const MAPS: Record<ProjectId, { nodes: MapNode[]; edges: MapEdge[] }> = {
  assistant: squash(RAW_MAPS.assistant),
  platform: squash(RAW_MAPS.platform),
};

export const nodeProject = (id: NodeId): ProjectId =>
  MAPS.assistant.nodes.some((n) => n.id === id) ? "assistant" : "platform";

export const edgeById = (project: ProjectId, id: string) => MAPS[project].edges.find((e) => e.id === id);
