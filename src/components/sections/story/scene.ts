/**
 * Three.js scene for the scroll story. Loaded lazily (dynamic import) so three.js
 * lives in its own chunk. Everything per-frame is imperative; React only provides
 * the DOM nodes. Illustration of a typical automation architecture — not a diagram
 * of any specific project.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export type StationKey = "tg" | "web" | "api" | "rbac" | "agent" | "tools" | "c1" | "db" | "wf";

export type StoryOptions = {
  canvas: HTMLCanvasElement;
  labelsEl: HTMLElement;
  track: HTMLElement;
  stepEls: HTMLElement[];
  railEls: HTMLElement[];
  subs: Record<StationKey, string>;
  reduced: boolean;
};

const ORANGE = 0xff6a1a;

const RAW: { id: StationKey; x: number; z: number; w: number; d: number; h: number; tag: string }[] = [
  { id: "tg", x: 0, z: 1, w: 2.2, d: 2.2, h: 1.1, tag: "Telegram" },
  { id: "web", x: 0, z: 6, w: 2.2, d: 2.2, h: 1.1, tag: "Web app" },
  { id: "api", x: 3.4, z: 6.3, w: 1.6, d: 1.6, h: 0.8, tag: "REST API" },
  { id: "rbac", x: 5.5, z: -1.6, w: 2.2, d: 1.6, h: 1.2, tag: "Access" },
  { id: "agent", x: 5, z: 3.2, w: 3.2, d: 3.2, h: 2.6, tag: "AI agent" },
  { id: "tools", x: 10.5, z: 3.7, w: 2.2, d: 2.2, h: 1.4, tag: "Integrations" },
  { id: "c1", x: 15, z: 0.2, w: 2.2, d: 2.2, h: 2.4, tag: "1C" },
  { id: "db", x: 15, z: 4.4, w: 2.6, d: 2.2, h: 0.5, tag: "Database" },
  { id: "wf", x: 10.5, z: 8.4, w: 2.2, d: 2.2, h: 1.0, tag: "Workflow" },
];

const ROUTES: [StationKey, StationKey][] = [
  ["tg", "agent"], ["web", "api"], ["api", "agent"], ["rbac", "agent"],
  ["agent", "tools"], ["tools", "c1"], ["tools", "db"], ["tools", "wf"],
];

const CX = 8.8;
const CZ = 4.5;

type Station = (typeof RAW)[number] & { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; el: HTMLElement; cx: number; cz: number; heat: number };
type Shot = { pos: THREE.Vector3; target: THREE.Vector3 };
type Step = { cam: Shot; hot: StationKey[]; flows: string[] };

const ALL_FLOWS = ["tg-agent", "rbac-agent", "agent-tools", "tools-c1", "web-api", "api-agent", "agent-tools", "tools-wf", "tools-db"];

/** Returns a disposer. Throws if WebGL is unavailable (caller shows a fallback). */
export function createStory(o: StoryOptions): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas: o.canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const labelRenderer = new CSS2DRenderer({ element: o.labelsEl });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  // light
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2236ff, 1.15));
  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(10, 22, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 60 });
  sun.shadow.bias = -0.0004;
  sun.shadow.radius = 6;
  scene.add(sun);

  // floor (shadow catcher) + faint grid
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(80, 80)), track(new THREE.ShadowMaterial({ color: 0x0a1590, opacity: 0.32 })));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new THREE.GridHelper(60, 60, 0xffffff, 0xffffff);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.08;
  grid.position.y = 0.002;
  scene.add(grid);

  // stations
  const S = {} as Record<StationKey, Station>;
  for (const r of RAW) {
    const mat = track(new THREE.MeshStandardMaterial({ color: 0xf7f8ff, roughness: 0.55, emissive: ORANGE, emissiveIntensity: 0 }));
    const mesh = new THREE.Mesh(track(new RoundedBoxGeometry(r.w, r.h, r.d, 5, 0.14)), mat);
    const cx = r.x + r.w / 2 - CX;
    const cz = r.z + r.d / 2 - CZ;
    mesh.position.set(cx, r.h / 2, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const el = document.createElement("div");
    el.className = "story-label";
    const b = document.createElement("b");
    b.textContent = r.tag;
    const s = document.createElement("span");
    s.textContent = o.subs[r.id];
    el.append(b, s);
    const label = new CSS2DObject(el);
    label.position.set(0, r.h / 2 + (r.id === "agent" ? 1.75 : 0.35), 0);
    mesh.add(label);
    S[r.id] = { ...r, mesh, mat, el, cx, cz, heat: 0 };
  }

  // agent core
  const agent = S.agent;
  const ringMat = track(new THREE.MeshStandardMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 0.6, roughness: 0.4 }));
  const ring = new THREE.Mesh(track(new THREE.TorusGeometry(1.35, 0.05, 16, 120)), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(agent.cx, agent.h + 0.85, agent.cz);
  ring.castShadow = true;
  scene.add(ring);
  const beads = new THREE.Group();
  beads.position.copy(ring.position);
  const beadMat = track(new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 }));
  const beadBig = track(new THREE.SphereGeometry(0.11, 16, 16));
  const beadSmall = track(new THREE.SphereGeometry(0.06, 12, 12));
  for (let i = 0; i < 10; i++) {
    const bead = new THREE.Mesh(i % 3 === 0 ? beadBig : beadSmall, beadMat);
    const a = (i / 10) * Math.PI * 2;
    bead.position.set(Math.cos(a) * 1.35, 0, Math.sin(a) * 1.35);
    beads.add(bead);
  }
  scene.add(beads);

  // conveyors
  const railMat = track(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, emissive: 0xffffff, emissiveIntensity: 0.15 }));
  const curves: Record<string, { path: THREE.CurvePath<THREE.Vector3>; geo: THREE.TubeGeometry; len: number }> = {};
  for (const [a, b] of ROUTES) {
    const A = S[a];
    const B = S[b];
    const y = 0.07;
    const pts = [new THREE.Vector3(A.cx, y, A.cz), new THREE.Vector3(B.cx, y, A.cz), new THREE.Vector3(B.cx, y, B.cz)];
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < pts.length - 1; i++) if (pts[i].distanceTo(pts[i + 1]) > 0.001) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
    const geo = track(new THREE.TubeGeometry(path, 64, 0.055, 8, false));
    geo.setDrawRange(0, 0);
    const tube = new THREE.Mesh(geo, railMat);
    tube.receiveShadow = true;
    scene.add(tube);
    curves[`${a}-${b}`] = { path, geo, len: path.getLength() };
  }

  // packets
  const packetGeo = track(new RoundedBoxGeometry(0.42, 0.42, 0.42, 3, 0.07));
  const packetMat = track(new THREE.MeshStandardMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 0.35, roughness: 0.45 }));
  const packets: { m: THREE.Mesh; c: (typeof curves)[string]; t: number; speed: number; to: StationKey }[] = [];
  const launch = (key: string) => {
    const c = curves[key];
    if (!c) return;
    const m = new THREE.Mesh(packetGeo, packetMat);
    m.castShadow = true;
    scene.add(m);
    packets.push({ m, c, t: 0, speed: 3.2 / c.len, to: key.split("-")[1] as StationKey });
  };

  // story shots
  const focus = (ids: StationKey[], dist: number, dir: [number, number, number], lift = 0): Shot => {
    const t = new THREE.Vector3();
    ids.forEach((id) => t.add(new THREE.Vector3(S[id].cx, S[id].h * 0.5 + lift, S[id].cz)));
    t.divideScalar(ids.length);
    return { pos: t.clone().add(new THREE.Vector3(...dir).normalize().multiplyScalar(dist)), target: t };
  };
  const STEPS: Step[] = [
    { cam: { pos: new THREE.Vector3(18, 32, 38), target: new THREE.Vector3(0, 0, 0.5) }, hot: [], flows: ALL_FLOWS },
    { cam: focus(["tg", "web", "api"], 17, [1.3, 1.25, 1.0]), hot: ["tg", "web", "api"], flows: ["tg-agent", "web-api", "api-agent"] },
    { cam: focus(["agent"], 17, [1.15, 1.0, 0.75], 0.6), hot: ["agent", "rbac"], flows: ["rbac-agent", "agent-tools", "tg-agent"] },
    { cam: focus(["c1", "db"], 16, [1.0, 1.15, 1.05]), hot: ["c1", "db", "tools"], flows: ["tools-c1", "tools-db", "agent-tools"] },
    { cam: focus(["wf"], 15, [1.3, 1.2, 0.5]), hot: ["wf"], flows: ["tools-wf", "agent-tools"] },
    { cam: { pos: new THREE.Vector3(24, 31, 27), target: new THREE.Vector3(0, 0, 0.5) }, hot: [], flows: ALL_FLOWS },
  ];

  let progress = 0;
  const readScroll = () => {
    const r = o.track.getBoundingClientRect();
    const total = o.track.offsetHeight - window.innerHeight;
    progress = Math.min(1, Math.max(0, -r.top / Math.max(1, total))) * (STEPS.length - 1);
  };
  const ease = (x: number) => x * x * (3 - 2 * x);
  const camAt = (p: number): Shot => {
    const i = Math.min(STEPS.length - 2, Math.floor(p));
    const f = ease(p - i);
    return { pos: STEPS[i].cam.pos.clone().lerp(STEPS[i + 1].cam.pos, f), target: STEPS[i].cam.target.clone().lerp(STEPS[i + 1].cam.target, f) };
  };

  let distScale = 1;
  const resize = () => {
    const w = o.canvas.clientWidth;
    const h = o.canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
    camera.aspect = w / h;
    // desktop: copy sits on the left, so shift the image right (lens shift, no rotation)
    // phones: copy sits at the bottom — lift the image up and pull the camera back
    if (w > 820) camera.setViewOffset(w, h, -w * 0.25, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.2, w, h);
    distScale = w / h < 1 ? 1.75 : 1;
    camera.updateProjectionMatrix();
  };

  const mouse = new THREE.Vector2();
  const onPointer = (e: PointerEvent) => mouse.set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);

  // only render while the story is on screen
  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
  io.observe(o.track);

  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointer);
  readScroll();
  resize();

  const start = camAt(progress);
  const camPos = start.pos.clone();
  const camTarget = start.target.clone();
  const parallax = new THREE.Vector3();
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
    const age = (now - born) / 1000;

    // boot: blocks drop in, rails draw
    RAW.forEach((r, i) => {
      const s = S[r.id];
      const k = o.reduced ? 1 : Math.min(1, Math.max(0, (age - 0.15 - i * 0.09) / 0.7));
      const e = 1 - Math.pow(1 - k, 3);
      s.mesh.position.y = s.h / 2 + (1 - e) * 6;
      s.mesh.scale.setScalar(0.6 + 0.4 * e);
      s.el.style.opacity = k > 0.9 ? "1" : "0";
    });
    Object.values(curves).forEach((c, i) => {
      const k = o.reduced ? 1 : Math.min(1, Math.max(0, (age - 0.9 - i * 0.07) / 0.9));
      const count = c.geo.index ? c.geo.index.count : 0;
      c.geo.setDrawRange(0, Math.floor((count * k) / 3) * 3);
    });

    // camera follows scroll (smoothed) + subtle pointer parallax
    const goal = camAt(progress);
    const k = o.reduced ? 1 : 1 - Math.pow(0.0015, dt);
    camPos.lerp(goal.pos, k);
    camTarget.lerp(goal.target, k);
    parallax.set(o.reduced ? 0 : mouse.x * 1.4, o.reduced ? 0 : -mouse.y * 0.8, 0);
    camera.position.copy(camPos).sub(camTarget).multiplyScalar(distScale).add(camTarget).add(parallax);
    camera.lookAt(camTarget);

    // copy cross-fade + progress rail
    o.stepEls.forEach((el, i) => {
      const d = progress - i;
      el.style.opacity = Math.max(0, 1 - Math.abs(d) * 2.4).toFixed(3);
      el.style.setProperty("--shift", `${(-d * 60).toFixed(1)}px`);
      el.setAttribute("aria-hidden", Math.abs(d) < 0.5 ? "false" : "true");
    });
    o.railEls.forEach((b, i) => (b.style.transform = `scaleY(${Math.min(1, Math.max(0, progress - i + 1)).toFixed(3)})`));

    // focus highlighting
    const cur = Math.round(progress);
    const hot = new Set(STEPS[cur].hot);
    for (const id of Object.keys(S) as StationKey[]) {
      const s = S[id];
      const want = hot.has(id) ? 1 : 0;
      s.heat += (want - s.heat) * Math.min(1, dt * 6);
      s.mat.emissiveIntensity = s.heat * 0.22;
      s.el.classList.toggle("is-hot", want === 1);
    }

    // agent core
    const spin = o.reduced ? 0 : cur === 2 ? 2.4 : 0.8;
    ring.rotation.z += dt * spin;
    beads.rotation.y -= dt * spin * 1.3;
    if (!o.reduced) {
      ring.position.y = agent.h + 0.85 + Math.sin(now / 600) * 0.06;
      beads.position.y = ring.position.y;
    }

    // packets along the active step's routes
    if (!o.reduced && age > 1.8 && now - lastLaunch > 420) {
      lastLaunch = now;
      const flows = STEPS[cur].flows;
      launch(flows[flowIdx++ % flows.length]);
    }
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.speed * dt;
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
    packets.forEach((p) => scene.remove(p.m));
    disposables.forEach((d) => d.dispose());
    (grid.geometry as THREE.BufferGeometry).dispose();
    (grid.material as THREE.Material).dispose();
    renderer.dispose();
    o.labelsEl.replaceChildren();
  };
}
