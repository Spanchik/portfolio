/**
 * Isometric geometry for the hero "machine" — an illustration of a typical automation
 * architecture (channels → API → AI agent gated by access rules → integrations →
 * 1C / database / workflow). Not a diagram of any specific project.
 */
export type StationId = "tg" | "web" | "api" | "rbac" | "agent" | "tools" | "c1" | "sheets" | "approval";

export type Station = {
  id: StationId;
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  tag: string;
  core?: boolean;
};

export const STATIONS: Station[] = [
  { id: "tg", x: 0, y: 1, w: 2.2, d: 2.2, h: 1.1, tag: "Telegram" },
  { id: "web", x: 0, y: 6, w: 2.2, d: 2.2, h: 1.1, tag: "Web app" },
  { id: "api", x: 3.4, y: 6.3, w: 1.6, d: 1.6, h: 0.8, tag: "REST API" },
  { id: "rbac", x: 5.5, y: -1.6, w: 2.2, d: 1.6, h: 1.2, tag: "Access" },
  { id: "agent", x: 5, y: 3.2, w: 3.2, d: 3.2, h: 2.6, tag: "AI agent", core: true },
  { id: "tools", x: 10.5, y: 3.7, w: 2.2, d: 2.2, h: 1.4, tag: "Integrations" },
  { id: "c1", x: 15, y: 0.2, w: 2.2, d: 2.2, h: 2.4, tag: "1C" },
  { id: "sheets", x: 15, y: 4.4, w: 2.6, d: 2.2, h: 0.5, tag: "Database" },
  { id: "approval", x: 10.5, y: 8.4, w: 2.2, d: 2.2, h: 1.0, tag: "Workflow" },
];

export const station = (id: StationId) => STATIONS.find((s) => s.id === id)!;

export const ROUTES: [StationId, StationId][] = [
  ["tg", "agent"],
  ["web", "api"],
  ["api", "agent"],
  ["rbac", "agent"],
  ["agent", "tools"],
  ["tools", "c1"],
  ["tools", "sheets"],
  ["tools", "approval"],
];

/** Order in which packets are sent — each pair must exist in ROUTES. */
export const FLOWS: [StationId, StationId][] = [
  ["tg", "agent"],
  ["rbac", "agent"],
  ["agent", "tools"],
  ["tools", "c1"],
  ["web", "api"],
  ["api", "agent"],
  ["agent", "tools"],
  ["tools", "approval"],
  ["agent", "tools"],
  ["tools", "sheets"],
];

export const UNIT = 30;
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

export const project = (x: number, y: number, z = 0): [number, number] => [(x - y) * COS * UNIT, (x + y) * SIN * UNIT - z * UNIT];

export const pts = (list: [number, number, number][]) =>
  list.map(([x, y, z]) => project(x, y, z).map((v) => v.toFixed(1)).join(",")).join(" ");

export const centre = (s: Station): [number, number] => [s.x + s.w / 2, s.y + s.d / 2];

/** Orthogonal ground route between two station centres. */
export function route(a: StationId, b: StationId): [number, number][] {
  const [x1, y1] = centre(station(a));
  const [x2, y2] = centre(station(b));
  return [
    [x1, y1],
    [x2, y1],
    [x2, y2],
  ];
}

export function faces(s: Station) {
  const { x, y, w, d, h } = s;
  return {
    left: pts([[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]]),
    right: pts([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]]),
    top: pts([[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]]),
  };
}

export function viewBox(pad = 34) {
  const corners = STATIONS.flatMap((s) => [
    project(s.x, s.y, s.h + 1.6),
    project(s.x + s.w, s.y + s.d),
    project(s.x + s.w, s.y),
    project(s.x, s.y + s.d),
  ]);
  const xs = corners.map((p) => p[0]);
  const ys = corners.map((p) => p[1]);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  return `${minX.toFixed(0)} ${minY.toFixed(0)} ${(Math.max(...xs) - minX + pad).toFixed(0)} ${(Math.max(...ys) - minY + pad).toFixed(0)}`;
}

/** Back-to-front painter's order. */
export const DRAW_ORDER = [...STATIONS].sort((a, b) => a.x + a.y - (b.x + b.y));
