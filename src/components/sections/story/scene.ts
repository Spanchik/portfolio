/**
 * Three.js scene for the scroll story. Loaded lazily (dynamic import) so three.js
 * lives in its own chunk. Everything per-frame is imperative; React only provides
 * the DOM nodes. Illustration of a typical automation architecture — not a diagram
 * of any specific project.
 *
 * Prologue (step 0 → 1): office "routine" objects float around the headline, get
 * pulled into the AI agent by a vortex and turn into data packets; a flash and a
 * shockwave follow, and the machine grows out of its blueprint.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export type StationKey = "tg" | "web" | "rbac" | "agent" | "c1" | "db" | "wf";

export type StoryOptions = {
  canvas: HTMLCanvasElement;
  labelsEl: HTMLElement;
  flashEl: HTMLElement;
  track: HTMLElement;
  stepEls: HTMLElement[];
  railEls: HTMLElement[];
  subs: Record<StationKey, string>;
  reduced: boolean;
  /** Small DOM cursor (orange diamond) shown over the scene for fine pointers. */
  cursorEl: HTMLElement;
  /** "Click a block to switch it off" hint, shown once the machine is assembled. */
  hintEl: HTMLElement;
  /** Label sub-text for a switched-off block. */
  offlineLabel: string;
  /** Short tags shown over the blocks while the request passes through them. */
  tags: { role: string; balance: string; approved: string };
  /** Called when the story moves to another stage (0 = hero … 4 = whole system). */
  onStage: (stage: number) => void;
};

const ORANGE = 0xff6a1a;

const RAW: { id: StationKey; x: number; z: number; w: number; d: number; h: number; tag: string }[] = [
  { id: "tg", x: 0, z: 1.2, w: 2.2, d: 2.2, h: 1.1, tag: "Telegram" },
  { id: "web", x: 0, z: 5.6, w: 2.2, d: 2.2, h: 1.1, tag: "Web app" },
  { id: "rbac", x: 5.5, z: -2.4, w: 2.2, d: 1.6, h: 1.2, tag: "Access" },
  { id: "agent", x: 5, z: 2.3, w: 3.2, d: 3.2, h: 2.6, tag: "AI agent" },
  { id: "c1", x: 11.4, z: -0.6, w: 2.4, d: 2.4, h: 2.2, tag: "1C" },
  { id: "db", x: 11.3, z: 2.8, w: 2.6, d: 2.2, h: 0.6, tag: "Database" },
  { id: "wf", x: 11.4, z: 6.8, w: 2.4, d: 2.4, h: 1.1, tag: "Workflow" },
];

const ROUTES: [StationKey, StationKey][] = [
  ["tg", "agent"], ["web", "agent"], ["rbac", "agent"],
  ["agent", "c1"], ["agent", "db"], ["agent", "wf"],
];

const CX = 6.9;
const CZ = 3.9;
/** Scroll share per step transition: the prologue gets one screen, the rest 0.6 each. */
export const SEGMENTS = [1, 0.6, 0.6, 0.6];
/** Share of the track used by the transitions; the remainder holds the last step on screen. */
const TRACK_USE = 0.92;

type Station = (typeof RAW)[number] & {
  pivot: THREE.Group;
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  edges: THREE.LineSegments;
  el: HTMLElement;
  cx: number;
  cz: number;
  heat: number;
  dist: number;
  sub: HTMLElement;
  down: boolean;
  downK: number;
  lift: number;
};
type Shot = { pos: THREE.Vector3; target: THREE.Vector3 };
type Step = { cam: Shot; hot: StationKey[]; flows: string[] };

const ALL_FLOWS = ["tg-agent", "rbac-agent", "agent-c1", "web-agent", "agent-db", "agent-wf"];

const ease = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const bell = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2));

/* ───────────── chaos objects: chunky "toy" office items in the machine's style ───────────── */

function buildMakers() {
  const plastic = (c: number) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.25 });
  const M = { white: plastic(0xf7f8ff), paper: plastic(0xe9ecf7), orange: plastic(ORANGE), blue: plastic(0x2c47ff), sky: plastic(0xb9c6ff) };
  const RB = (w: number, h: number, d: number, r = 0.06) =>
    new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
  const part = (g: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    g.add(m);
    return m;
  };
  const tri = (p: [number, number][], depth: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(...p[0]);
    p.slice(1).forEach((q) => sh.lineTo(...q));
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
    geo.translate(0, 0, -depth / 2);
    return geo;
  };

  const makers: Record<string, () => THREE.Group> = {
    folder() {
      const g = new THREE.Group();
      part(g, RB(1.3, 0.95, 0.06), M.orange, 0, 0, -0.06);
      part(g, RB(0.45, 0.16, 0.06), M.orange, -0.38, 0.52, -0.06);
      part(g, RB(1.14, 0.9, 0.03), M.white, 0.03, 0.1, -0.01);
      part(g, RB(1.08, 0.86, 0.03), M.paper, -0.04, 0.16, 0.02);
      part(g, RB(1.3, 0.78, 0.06), M.white, 0, -0.09, 0.06);
      return g;
    },
    envelope() {
      const g = new THREE.Group();
      part(g, RB(1.25, 0.82, 0.12, 0.05), M.white);
      part(g, tri([[-0.6, 0.39], [0.6, 0.39], [0, -0.08]], 0.03), M.paper, 0, 0, 0.08);
      part(g, new THREE.CylinderGeometry(0.13, 0.13, 0.06, 32), M.orange, 0, 0, 0.1).rotation.x = Math.PI / 2;
      return g;
    },
    chat() {
      const g = new THREE.Group();
      part(g, RB(1.2, 0.78, 0.22, 0.2), M.white);
      part(g, tri([[-0.42, -0.3], [-0.12, -0.3], [-0.52, -0.62]], 0.18), M.white);
      [-0.28, 0, 0.28].forEach((x) => part(g, new THREE.SphereGeometry(0.075, 20, 20), M.orange, x, 0.02, 0.12));
      return g;
    },
    sheet() {
      const g = new THREE.Group();
      part(g, RB(0.98, 1.22, 0.08, 0.05), M.white);
      part(g, RB(0.82, 0.13, 0.03, 0.03), M.blue, 0, 0.44, 0.05);
      for (let r = 0; r < 5; r++)
        for (let c = 0; c < 3; c++) part(g, RB(0.24, 0.1, 0.025, 0.02), r === 2 && c === 1 ? M.orange : M.sky, -0.27 + c * 0.27, 0.24 - r * 0.15, 0.05);
      part(g, tri([[0.49, 0.61], [0.25, 0.61], [0.49, 0.37]], 0.02), M.paper, 0, 0, 0.05);
      return g;
    },
    clipboard() {
      const g = new THREE.Group();
      part(g, RB(0.98, 1.28, 0.06, 0.08), M.blue);
      part(g, RB(0.82, 1.04, 0.02, 0.02), M.white, 0, -0.06, 0.04);
      part(g, RB(0.36, 0.14, 0.09, 0.04), M.orange, 0, 0.6, 0.05);
      for (let i = 0; i < 4; i++) {
        part(g, RB(0.1, 0.1, 0.03, 0.02), i === 3 ? M.orange : M.sky, -0.28, 0.26 - i * 0.22, 0.06);
        part(g, RB(0.42, 0.05, 0.02, 0.02), M.sky, 0.1, 0.26 - i * 0.22, 0.06);
      }
      return g;
    },
    stack() {
      const g = new THREE.Group();
      for (let i = 0; i < 6; i++) part(g, RB(1.0, 0.72, 0.035, 0.02), i % 2 ? M.white : M.paper, rnd(-0.05, 0.05), rnd(-0.05, 0.05), i * 0.045).rotation.z = rnd(-0.1, 0.1);
      part(g, RB(1.0, 0.72, 0.035, 0.02), M.orange, 0.04, 0.03, 6 * 0.045).rotation.z = 0.12;
      return g;
    },
    sticky() {
      const g = new THREE.Group();
      part(g, RB(0.66, 0.66, 0.04, 0.03), M.orange);
      part(g, RB(0.44, 0.05, 0.02, 0.02), M.white, 0, 0.12, 0.03);
      part(g, RB(0.32, 0.05, 0.02, 0.02), M.white, -0.06, -0.02, 0.03);
      return g;
    },
    alert() {
      const g = new THREE.Group();
      part(g, new THREE.CapsuleGeometry(0.11, 0.45, 6, 16), M.orange, 0, 0.18, 0);
      part(g, new THREE.SphereGeometry(0.12, 20, 20), M.orange, 0, -0.35, 0);
      return g;
    },
  };
  return makers;
}

const OBJECT_ORDER = ["folder", "sheet", "chat", "envelope", "clipboard", "sheet", "stack", "chat", "sticky", "alert", "envelope", "folder"];

/** Returns a disposer. Throws if WebGL is unavailable (caller shows a fallback). */
export function createStory(o: StoryOptions): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas: o.canvas, antialias: true, alpha: true });
  // phones: cheaper frame (lower DPR, smaller shadow map, fewer chaos objects)
  const lite = window.matchMedia("(max-width: 820px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const labelRenderer = new CSS2DRenderer({ element: o.labelsEl });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);

  // light
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2236ff, 1.15));
  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(10, 22, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 70 });
  sun.shadow.bias = -0.0004;
  sun.shadow.radius = 6;
  scene.add(sun);

  // floor (shadow catcher) + faint grid
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.ShadowMaterial({ color: 0x0a1590, opacity: 0.32 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new THREE.GridHelper(60, 60, 0xffffff, 0xffffff);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.08;
  grid.position.y = 0.002;
  scene.add(grid);

  // ── stations: solid block grows inside a blueprint outline
  const S = {} as Record<StationKey, Station>;
  for (const r of RAW) {
    const cx = r.x + r.w / 2 - CX;
    const cz = r.z + r.d / 2 - CZ;
    const mat = new THREE.MeshStandardMaterial({ color: 0xf7f8ff, roughness: 0.55, emissive: ORANGE, emissiveIntensity: 0 });
    const pivot = new THREE.Group();
    pivot.position.set(cx, 0, cz);
    scene.add(pivot);
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(r.w, r.h, r.d, 5, 0.14), mat);
    mesh.position.y = r.h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    pivot.add(mesh);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(r.w, r.h, r.d)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true }),
    );
    edges.position.set(cx, r.h / 2, cz);
    scene.add(edges);

    const el = document.createElement("div");
    el.className = "story-label";
    const b = document.createElement("b");
    b.textContent = r.tag;
    const s = document.createElement("span");
    s.textContent = o.subs[r.id];
    el.append(b, s);
    const label = new CSS2DObject(el);
    // labels sit above the toy prop that stands on each block (above the ring for the agent)
    label.position.set(cx, r.h + (r.id === "agent" ? 1.75 : 1.95), cz);
    scene.add(label);
    S[r.id] = { ...r, pivot, mesh, mat, edges, el, cx, cz, heat: 0, dist: 0, sub: s, down: false, downK: 0, lift: 0 };
  }
  const agent = S.agent;
  for (const s of Object.values(S)) s.dist = Math.hypot(s.cx - agent.cx, s.cz - agent.cz);
  const MOUTH = new THREE.Vector3(agent.cx, agent.h + 0.9, agent.cz);

  // ── toy props: the "routine" objects of the prologue end up sorted onto the blocks they belong to
  const PROPS: Partial<Record<StationKey, string>> = { tg: "chat", web: "sheet", rbac: "sticky", c1: "folder", db: "stack", wf: "clipboard" };
  const propMakers = buildMakers();
  const props: { m: THREE.Group; s: Station; k: number; phase: number }[] = [];
  for (const [id, kind] of Object.entries(PROPS) as [StationKey, string][]) {
    const m = propMakers[kind]();
    m.visible = false;
    scene.add(m);
    props.push({ m, s: S[id], k: 0, phase: Math.random() * 6 });
  }

  // ── agent core: rings, burst light, floor shockwave
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.05, 16, 120),
    new THREE.MeshStandardMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 0.7 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.copy(MOUTH);
  scene.add(ring);
  const ring2Mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6, transparent: true });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.025, 12, 120), ring2Mat);
  ring2.rotation.x = Math.PI / 2;
  ring2.position.copy(MOUTH);
  scene.add(ring2);
  const burst = new THREE.PointLight(0xffb27a, 0, 30, 1.6);
  burst.position.copy(MOUTH).add(new THREE.Vector3(0, 1, 0));
  scene.add(burst);
  const shockMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide });
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 96), shockMat);
  shock.rotation.x = -Math.PI / 2;
  shock.position.set(agent.cx, 0.03, agent.cz);
  scene.add(shock);

  // ── conveyors
  const railMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, emissive: 0xffffff, emissiveIntensity: 0.15 });
  const curves: Record<string, { path: THREE.CurvePath<THREE.Vector3>; geo: THREE.TubeGeometry; len: number }> = {};
  for (const [a, b] of ROUTES) {
    const A = S[a];
    const B = S[b];
    const y = 0.07;
    const pts = [new THREE.Vector3(A.cx, y, A.cz), new THREE.Vector3(B.cx, y, A.cz), new THREE.Vector3(B.cx, y, B.cz)];
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < pts.length - 1; i++) if (pts[i].distanceTo(pts[i + 1]) > 0.001) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
    const geo = new THREE.TubeGeometry(path, 64, 0.055, 8, false);
    geo.setDrawRange(0, 0);
    const tube = new THREE.Mesh(geo, railMat);
    tube.receiveShadow = true;
    scene.add(tube);
    curves[`${a}-${b}`] = { path, geo, len: path.getLength() };
  }

  // ── packets (shared geometry/material with the chaos cubes)
  const cubeGeo = new RoundedBoxGeometry(0.42, 0.42, 0.42, 3, 0.07);
  const cubeMat = new THREE.MeshStandardMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 0.45, roughness: 0.45 });
  const packets: { m: THREE.Mesh; c: (typeof curves)[string]; t: number; speed: number; to: StationKey }[] = [];
  const launch = (key: string) => {
    const c = curves[key];
    if (!c || S[key.split("-")[0] as StationKey].down) return;
    const m = new THREE.Mesh(cubeGeo, cubeMat);
    m.castShadow = true;
    scene.add(m);
    packets.push({ m, c, t: 0, speed: 3.2 / c.len, to: key.split("-")[1] as StationKey });
  };

  // ── scripted request (steps 2–3): one HR request from the first case travels through the machine, on a loop
  type Move = { t: number; dur: number; key: string; rev: boolean; m: THREE.Mesh };
  type Say = { t: number; id: StationKey; el: HTMLElement; alt?: Say };
  const mkMove = (t: number, dur: number, key: string, rev = false): Move => {
    const m = new THREE.Mesh(cubeGeo, cubeMat);
    m.castShadow = true;
    m.visible = false;
    m.scale.setScalar(1.3);
    scene.add(m);
    return { t, dur, key, rev, m };
  };
  const mkSay = (t: number, id: StationKey, text: string, kind: "user" | "sys"): Say => {
    const el = document.createElement("div");
    el.className = `story-bubble is-${kind}`;
    el.textContent = text;
    el.style.opacity = "0";
    const obj = new CSS2DObject(el);
    obj.position.set(S[id].cx, S[id].h + (id === "agent" ? 3.4 : 3.5), S[id].cz);
    scene.add(obj);
    return { t, id, el };
  };
  const SCRIPTS: Record<number, { len: number; moves: Move[]; says: Say[] }> = {
    // 1 — the message travels from Telegram to the agent
    1: { len: 2.4, moves: [mkMove(0.1, 1.2, "tg-agent")], says: [] },
    // 2 — the role is checked in code, the balance is fetched from 1C and comes back
    2: {
      len: 4.4,
      moves: [mkMove(0.1, 0.8, "rbac-agent"), mkMove(1.0, 1.1, "agent-c1"), mkMove(2.6, 1.1, "agent-c1", true)],
      says: [mkSay(0, "rbac", o.tags.role, "sys"), mkSay(0.6, "c1", o.tags.balance, "sys")],
    },
    // 3 — the request is written to the database and goes to approval
    3: { len: 3.2, moves: [mkMove(0.1, 0.9, "agent-db"), mkMove(0.9, 1.3, "agent-wf")], says: [mkSay(0.7, "wf", o.tags.approved, "sys")] },
  };
  const shown = {} as Record<StationKey, boolean>;
  let scriptT = 0;
  /** Seconds since the current step came on screen (not looped): drives the bubbles. */
  let stepT = 0;
  let scriptStep = -1;
  let lastStage = -1;

  // ── chaos objects
  type Obj = {
    m: THREE.Group; cube: THREE.Mesh; base: THREE.Vector3; amp: THREE.Vector3; freq: number; phase: number;
    spin: THREE.Vector3; rot: THREE.Euler; delay: number; size: number; r0: number; a0: number;
  };
  const objs: Obj[] = [];
  if (!o.reduced) {
    const makers = buildMakers();
    for (let i = 0; i < (lite ? 14 : 24); i++) {
      const m = makers[OBJECT_ORDER[i % OBJECT_ORDER.length]]();
      scene.add(m);
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      cube.visible = false;
      cube.castShadow = true;
      scene.add(cube);
      objs.push({
        m, cube, base: new THREE.Vector3(),
        amp: new THREE.Vector3(rnd(0.3, 0.8), rnd(0.25, 0.55), rnd(0.3, 0.8)),
        freq: rnd(0.2, 0.45), phase: rnd(0, Math.PI * 2),
        spin: new THREE.Vector3(rnd(-0.5, 0.5), rnd(-0.8, 0.8), rnd(-0.4, 0.4)),
        rot: new THREE.Euler(rnd(-0.6, 0.3), rnd(-0.8, 0.8), rnd(-0.4, 0.4)),
        delay: Math.random(), size: rnd(0.95, 1.25), r0: 0, a0: 0,
      });
    }
  }

  // ── story shots
  const focus = (ids: StationKey[], dist: number, dir: [number, number, number], lift = 0): Shot => {
    const t = new THREE.Vector3();
    ids.forEach((id) => t.add(new THREE.Vector3(S[id].cx, S[id].h * 0.5 + lift, S[id].cz)));
    t.divideScalar(ids.length);
    return { pos: t.clone().add(new THREE.Vector3(...dir).normalize().multiplyScalar(dist)), target: t };
  };
  // the camera never zooms into a part of the machine: all blocks stay in frame,
  // only the distance breathes a little from stage to stage
  const ALL: StationKey[] = ["tg", "web", "rbac", "agent", "c1", "db", "wf"];
  const VIEW: [number, number, number] = [14.5, 25, 30];
  const STEPS: Step[] = [
    { cam: { pos: new THREE.Vector3(11, 20, 28), target: new THREE.Vector3(-2, 4, 1) }, hot: [], flows: [] },
    { cam: focus(ALL, 43, VIEW), hot: ["tg"], flows: [] },
    { cam: focus(ALL, 42, VIEW), hot: ["rbac", "agent", "c1"], flows: [] },
    { cam: focus(ALL, 42, VIEW), hot: ["db", "wf"], flows: [] },
    { cam: focus(ALL, 45, VIEW), hot: [], flows: ALL_FLOWS },
  ];
  const SEG_TOTAL = SEGMENTS.reduce((a, b) => a + b, 0);

  let progress = 0;
  const readScroll = () => {
    const r = o.track.getBoundingClientRect();
    const total = Math.max(1, o.track.offsetHeight - window.innerHeight);
    let u = Math.min(1, Math.max(0, -r.top / total / TRACK_USE)) * SEG_TOTAL;
    let p = 0;
    for (let i = 0; i < SEGMENTS.length; i++) {
      const s = SEGMENTS[i];
      if (u <= s) {
        // each step dwells at both ends of its segment, so its copy stays readable
        // and the cross-fade takes only the middle of the scroll distance
        const f = u / s;
        p += i === 0 ? clamp01(f / 0.9) : clamp01((f - 0.18) / 0.64);
        break;
      }
      u -= s;
      p += 1;
    }
    progress = Math.min(STEPS.length - 1, p);
  };
  const camAt = (p: number): Shot => {
    const i = Math.min(STEPS.length - 2, Math.floor(p));
    const f = ease(p - i);
    return { pos: STEPS[i].cam.pos.clone().lerp(STEPS[i + 1].cam.pos, f), target: STEPS[i].cam.target.clone().lerp(STEPS[i + 1].cam.target, f) };
  };

  let distScale = 1;
  let wide = true;
  const resize = () => {
    const w = o.canvas.clientWidth;
    const h = o.canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
    camera.aspect = w / h;
    // desktop: copy sits on the left → lens-shift the image right; phones: copy at the bottom → lift it
    wide = w > 820;
    if (wide) camera.setViewOffset(w, h, -w * 0.25, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.27, w, h);
    // keep every block in frame: pull the camera back as the window gets narrower
    distScale = wide ? Math.max(1, 1.62 / (w / h)) : w / h < 1 ? 1.75 : 1;
    camera.updateProjectionMatrix();
  };

  /** Place the cloud only where it can't cover the copy: right half on desktop, top on phones. */
  const placeObjects = () => {
    const cam = camera.clone();
    const s0 = STEPS[0].cam;
    cam.position.copy(s0.pos).sub(s0.target).multiplyScalar(distScale).add(s0.target);
    cam.lookAt(s0.target);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    const narrow = o.canvas.clientWidth <= 820;
    const v = new THREE.Vector3();
    const n = new THREE.Vector3();
    for (const ob of objs) {
      for (let tries = 0; tries < 400; tries++) {
        v.set(rnd(-16, 12), rnd(2.5, 10), rnd(-10, 13));
        n.copy(v).project(cam);
        const ok = narrow
          ? n.x > -0.85 && n.x < 0.85 && n.y > 0.05 && n.y < 0.82
          : n.x > 0.08 && n.x < 0.9 && n.y > -0.78 && n.y < 0.8;
        if (ok && n.z < 1) break;
      }
      ob.base.copy(v);
      ob.r0 = Math.hypot(v.x - MOUTH.x, v.z - MOUTH.z);
      ob.a0 = Math.atan2(v.z - MOUTH.z, v.x - MOUTH.x);
    }
  };

  const mouse = new THREE.Vector2();
  const onPointer = (e: PointerEvent) => mouse.set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);

  // ── interaction: hover / click blocks ("break the system") + cursor packet
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const meshToId = new Map<THREE.Object3D, StationKey>(Object.values(S).map((st) => [st.mesh, st.id]));
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.3);
  const WHITE = new THREE.Color(0xf7f8ff);
  const DOWN = new THREE.Color(0x8c96c8);
  let interactive = false;
  let hovered: StationKey | null = null;
  const pointerPos = new THREE.Vector3();
  const flyers: { m: THREE.Mesh; from: THREE.Vector3; ctrl: THREE.Vector3; to: THREE.Vector3; t: number; id: StationKey }[] = [];

  const pick = (e: { clientX: number; clientY: number }): StationKey | null => {
    const r = o.canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    raycaster.ray.intersectPlane(ground, pointerPos);
    const hit = raycaster.intersectObjects([...meshToId.keys()], false)[0];
    return hit ? (meshToId.get(hit.object) ?? null) : null;
  };
  const flyTo = (id: StationKey) => {
    if (o.reduced || S[id].down) return;
    const st = S[id];
    const to = new THREE.Vector3(st.cx, st.h + 0.3, st.cz);
    const from = pointerPos.clone();
    const ctrl = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 3, 0));
    const m = new THREE.Mesh(cubeGeo, cubeMat);
    m.castShadow = true;
    scene.add(m);
    flyers.push({ m, from, ctrl, to, t: 0, id });
  };
  const onCanvasMove = (e: PointerEvent) => {
    if (!interactive) return;
    const id = pick(e);
    if (id !== hovered && id && e.pointerType === "mouse") flyTo(id);
    hovered = id;
    o.canvas.style.cursor = id ? "pointer" : "";
  };
  const onCanvasLeave = () => {
    hovered = null;
  };
  const onCanvasClick = (e: MouseEvent) => {
    if (!interactive) return;
    const id = pick(e);
    if (!id) return;
    const st = S[id];
    st.down = !st.down;
    st.sub.textContent = st.down ? o.offlineLabel : o.subs[id];
    st.el.classList.toggle("is-down", st.down);
  };
  o.canvas.addEventListener("pointermove", onCanvasMove);
  o.canvas.addEventListener("pointerleave", onCanvasLeave);
  o.canvas.addEventListener("click", onCanvasClick);

  // only render while the story is on screen
  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
  io.observe(o.track);

  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointer);
  readScroll();
  resize();
  placeObjects();

  const start = camAt(progress);
  const camPos = start.pos.clone();
  const camTarget = start.target.clone();
  const proj = new THREE.Vector3();
  const drift = new THREE.Vector3();
  const vpos = new THREE.Vector3();
  const offset = new THREE.Vector3();
  let last = performance.now();
  const born = last;
  let lastLaunch = 0;
  let flowIdx = 0;
  let raf = 0;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible) return;
    const t = (now - born) / 1000;
    const intro = o.reduced ? 1 : ease(clamp01(t / 1.2)); // objects pop in on load
    const pro = o.reduced ? 1 : clamp01(progress); // prologue 0 → 1

    const suck = clamp01(pro / 0.7); // 0–0.7: vortex
    const blast = o.reduced ? 0 : bell(pro, 0.74, 0.05); // flash peak
    const build = o.reduced ? 1 : clamp01((pro - 0.72) / 0.28); // 0.72–1: assembly

    // chaos objects: drift → vortex → packets
    for (const ob of objs) {
      const local = ease(clamp01((suck - ob.delay * 0.35) / 0.65));
      const ft = t * ob.freq + ob.phase;
      drift.set(ob.base.x + Math.sin(ft) * ob.amp.x, ob.base.y + Math.sin(ft * 1.3) * ob.amp.y, ob.base.z + Math.cos(ft * 0.9) * ob.amp.z);
      vpos.copy(drift);
      if (local > 0) {
        const r = ob.r0 * Math.pow(1 - local, 1.25) + 0.15;
        const a = ob.a0 + local * local * 10;
        const y = drift.y + (MOUTH.y - drift.y) * Math.pow(local, 1.6) + Math.sin(local * Math.PI) * 1.2;
        const k = ease(clamp01(local * 2.5));
        vpos.set(drift.x + (MOUTH.x + Math.cos(a) * r - drift.x) * k, y, drift.z + (MOUTH.z + Math.sin(a) * r - drift.z) * k);
      }
      ob.rot.x += ob.spin.x * dt * (1 + local * 8);
      ob.rot.y += ob.spin.y * dt * (1 + local * 8);
      ob.rot.z += ob.spin.z * dt;
      const asCube = local > 0.55;
      ob.m.visible = !asCube;
      ob.m.position.copy(vpos);
      ob.m.rotation.copy(ob.rot);
      ob.m.scale.setScalar(Math.max(0.001, ob.size * intro * (1 - local * 0.75)));
      ob.cube.visible = asCube && local < 0.985;
      if (ob.cube.visible) {
        ob.cube.position.copy(vpos);
        ob.cube.rotation.copy(ob.rot);
        ob.cube.scale.setScalar(0.7 + (1 - local) * 1.2);
      }
    }

    // agent core: spin-up, flash, shockwave
    const cur = Math.round(progress);
    if (cur !== lastStage) {
      lastStage = cur;
      o.onStage(cur);
    }
    interactive = build > 0.98;
    o.hintEl.style.opacity = interactive && progress > 0.98 && progress < STEPS.length - 1.02 ? "1" : "0";
    o.cursorEl.style.opacity = "0";
    if (!interactive && o.canvas.style.cursor) o.canvas.style.cursor = "";
    const spinUp = o.reduced ? 0 : 0.8 + bell(pro, 0.55, 0.25) * 14;
    ring.rotation.z += dt * (cur === 2 && !o.reduced ? 2.4 : spinUp);
    ring2.rotation.z -= dt * spinUp * 0.6;
    ring.scale.setScalar(1 + blast * 0.6);
    ring2.scale.setScalar(1 + blast * 1.2);
    ring2Mat.opacity = 0.35 + blast * 0.65;
    if (!o.reduced) ring.position.y = ring2.position.y = MOUTH.y + Math.sin(now / 600) * 0.06;
    burst.intensity = blast * 220;
    o.flashEl.style.opacity = (blast * 0.85).toFixed(3);
    const sw = o.reduced ? 0 : clamp01((pro - 0.74) / 0.22);
    shock.scale.setScalar(0.2 + ease(sw) * 22);
    shockMat.opacity = sw > 0 && sw < 1 ? (1 - sw) * 0.8 : 0;

    // machine grows out of its blueprint, as a wave from the agent outwards
    for (const s of Object.values(S)) {
      const k = o.reduced ? 1 : ease(clamp01((build - s.dist * 0.035) / 0.5));
      s.pivot.scale.set(1, Math.max(0.001, k), 1);
      s.downK += ((s.down ? 1 : 0) - s.downK) * Math.min(1, dt * 8);
      s.lift += ((hovered === s.id && !s.down ? 0.28 : 0) - s.lift) * Math.min(1, dt * 12);
      s.pivot.position.y = s.lift - s.downK * 0.12;
      s.mat.color.lerpColors(WHITE, DOWN, s.downK);
      s.pivot.visible = k > 0.002;
      s.mesh.castShadow = k > 0.3;
      (s.edges.material as THREE.LineBasicMaterial).opacity = (0.9 - k * 0.8) * intro;
      // hide labels that would land on the copy (left on desktop, bottom on phones)
      proj.set(s.cx, s.h, s.cz).project(camera);
      const overCopy = wide ? proj.x < -0.1 : proj.y < -0.12;
      const labelOn = k > 0.85 && !overCopy;
      shown[s.id] = labelOn && Math.abs(proj.x) < 0.86 && proj.y < 0.8 && proj.y > -0.9;
      s.el.style.opacity = labelOn ? "1" : "0";
    }
    for (const p of props) {
      const on = p.s.pivot.scale.y > 0.85 ? 1 : 0;
      p.k += (on - p.k) * (o.reduced ? 1 : Math.min(1, dt * 6));
      p.m.visible = p.k > 0.01;
      p.m.scale.setScalar(Math.max(0.001, p.k * 0.92));
      const bob = o.reduced ? 0 : Math.sin(now / 900 + p.phase) * 0.06;
      p.m.position.set(p.s.cx, p.s.h + 0.8 + p.s.lift - p.s.downK * 0.12 + bob, p.s.cz);
      p.m.rotation.set(0, 0.45 + (o.reduced ? 0 : Math.sin(now / 1700 + p.phase) * 0.3), 0);
    }
    Object.values(curves).forEach((c, i) => {
      const k = o.reduced ? 1 : clamp01((build - 0.35 - i * 0.04) / 0.45);
      const count = c.geo.index ? c.geo.index.count : 0;
      c.geo.setDrawRange(0, Math.floor((count * k) / 3) * 3);
    });

    // camera follows scroll (smoothed) + pointer parallax + shake on the flash
    const goal = camAt(progress);
    const kk = o.reduced ? 1 : 1 - Math.pow(0.0015, dt);
    camPos.lerp(goal.pos, kk);
    camTarget.lerp(goal.target, kk);
    offset.set(o.reduced ? 0 : mouse.x * 1.4, o.reduced ? 0 : -mouse.y * 0.8, 0);
    offset.add(new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(blast * 0.25));
    camera.position.copy(camPos).sub(camTarget).multiplyScalar(distScale).add(camTarget).add(offset);
    camera.lookAt(camTarget);

    // copy cross-fade + progress rail
    o.stepEls.forEach((el, i) => {
      // element 0 is the hero copy; element 1 (caption + chat) stays for every later step
      const d = i === 0 ? progress : Math.min(progress, 1) - 1;
      const on = Math.abs(d) < 0.5;
      el.style.opacity = clamp01(1.25 - Math.abs(d) * 2.5).toFixed(3);
      el.style.setProperty("--shift", `${(-d * 40).toFixed(1)}px`);
      el.setAttribute("aria-hidden", on ? "false" : "true");
      el.style.pointerEvents = on ? "auto" : "none";
      el.inert = !on;
    });
    o.railEls.forEach((b, i) => (b.style.transform = `scaleY(${Math.min(1, Math.max(0, progress - i + 1)).toFixed(3)})`));

    // focus highlighting
    const hot = new Set(STEPS[cur].hot);
    for (const id of Object.keys(S) as StationKey[]) {
      const s = S[id];
      const want = hot.has(id) ? 1 : 0;
      s.heat += (want - s.heat) * Math.min(1, dt * 6);
      s.mat.emissiveIntensity = s.down ? 0 : s.heat * 0.22;
      s.el.classList.toggle("is-hot", want === 1);
    }

    // scripted request: packets and speech bubbles follow a fixed timeline while a step is on screen
    if (cur !== scriptStep) {
      scriptStep = cur;
      scriptT = 0;
      stepT = 0;
    }
    const active = SCRIPTS[cur];
    if (active && build > 0.95) {
      scriptT = o.reduced ? 0 : (scriptT + dt) % (active.len + 0.7);
      stepT = o.reduced ? 99 : stepT + dt;
    }
    for (const [step, sc] of Object.entries(SCRIPTS)) {
      const on = Number(step) === cur && build > 0.95;
      for (const mv of sc.moves) {
        const u = (scriptT - mv.t) / mv.dur;
        mv.m.visible = on && !o.reduced && u >= 0 && u <= 1;
        if (!mv.m.visible) continue;
        const pt = curves[mv.key].path.getPointAt(mv.rev ? 1 - u : u);
        mv.m.position.set(pt.x, 0.38, pt.z);
        mv.m.rotation.y += dt * 3;
        if (u > 0.9) {
          const [from, to] = mv.key.split("-") as StationKey[];
          const dest = S[mv.rev ? from : to];
          dest.heat = Math.max(dest.heat, 1);
        }
      }
      // bubbles appear within the first second and a half and stay while the step is on screen,
      // so a fast scroll still shows the whole exchange; only the packets keep looping
      for (const say of sc.says) {
        const due = on && stepT >= say.t;
        say.el.style.opacity = due && shown[say.id] ? "1" : "0";
        if (say.alt) say.alt.el.style.opacity = due && !shown[say.id] && shown[say.alt.id] ? "1" : "0";
      }
    }

    // packets along the active step's routes
    if (!o.reduced && build > 0.95 && now - lastLaunch > 420 && STEPS[cur].flows.length) {
      lastLaunch = now;
      const flows = STEPS[cur].flows;
      launch(flows[flowIdx++ % flows.length]);
    }
    const queued: Partial<Record<StationKey, number>> = {};
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.speed * dt;
      if (S[p.to].down) {
        // destination is offline: wait in a queue in front of it and "retry"
        const idx = (queued[p.to] = (queued[p.to] ?? -1) + 1);
        const hold = Math.max(0.2, 0.86 - idx * (0.6 / p.c.len));
        if (p.t > hold) p.t = hold;
        const pt = p.c.path.getPointAt(p.t);
        p.m.position.set(pt.x, 0.3 + Math.abs(Math.sin(now / 180 + i)) * 0.25, pt.z);
        continue;
      }
      if (p.t >= 1) {
        scene.remove(p.m);
        packets.splice(i, 1);
        S[p.to].heat = Math.max(S[p.to].heat, 1);
        continue;
      }
      const pt = p.c.path.getPointAt(p.t);
      p.m.position.set(pt.x, 0.3, pt.z);
      p.m.rotation.y += dt * 3;
    }

    for (let i = flyers.length - 1; i >= 0; i--) {
      const f = flyers[i];
      f.t += dt / 0.55;
      if (f.t >= 1) {
        scene.remove(f.m);
        flyers.splice(i, 1);
        S[f.id].heat = Math.max(S[f.id].heat, 1);
        continue;
      }
      const u = f.t;
      const a = (1 - u) * (1 - u);
      const b = 2 * (1 - u) * u;
      const c = u * u;
      f.m.position.set(a * f.from.x + b * f.ctrl.x + c * f.to.x, a * f.from.y + b * f.ctrl.y + c * f.to.y, a * f.from.z + b * f.ctrl.z + c * f.to.z);
      f.m.rotation.y += dt * 6;
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener("scroll", readScroll);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointer);
    o.canvas.removeEventListener("pointermove", onCanvasMove);
    o.canvas.removeEventListener("pointerleave", onCanvasLeave);
    o.canvas.removeEventListener("click", onCanvasClick);
    o.canvas.style.cursor = "";
    o.flashEl.style.opacity = "0";
    o.hintEl.style.opacity = "0";
    o.cursorEl.style.opacity = "0";
    const geos = new Set<THREE.BufferGeometry>();
    const mats = new Set<THREE.Material>();
    scene.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (m.geometry) geos.add(m.geometry);
      if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => mats.add(x));
    });
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    renderer.dispose();
    o.labelsEl.replaceChildren();
  };
}
