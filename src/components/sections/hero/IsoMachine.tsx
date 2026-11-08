"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { DRAW_ORDER, FLOWS, ROUTES, centre, faces, project, pts, route, station, viewBox, type StationId } from "./iso";
import { useInView, usePageVisible, usePrefersReducedMotion } from "./useStreamControls";

const VIEWBOX = viewBox();
const NS = "http://www.w3.org/2000/svg";
const RING_DOTS = 24;
const RING_R = 1.15;

const GRID = (() => {
  const lines: string[] = [];
  for (let i = -3; i <= 20; i++) lines.push(pts([[i, -3, 0], [i, 12, 0]]));
  for (let j = -3; j <= 12; j++) lines.push(pts([[-3, j, 0], [20, j, 0]]));
  return lines;
})();

type Props = {
  label: string;
  caption: string;
  subs: Record<StationId, string>;
  pauseLabel: string;
};

function makeCube(parent: SVGGElement) {
  const g = document.createElementNS(NS, "g");
  const q = 0.45;
  const face = (list: [number, number, number][], fill: string) => {
    const p = document.createElementNS(NS, "polygon");
    p.setAttribute("points", pts(list));
    p.setAttribute("fill", fill);
    p.setAttribute("stroke", "#fff");
    p.setAttribute("stroke-width", "0.8");
    g.appendChild(p);
  };
  face([[0, q, 0], [q, q, 0], [q, q, q], [0, q, q]], "var(--color-accent-deep)");
  face([[q, 0, 0], [q, q, 0], [q, q, q], [q, 0, q]], "#b33f00");
  face([[0, 0, q], [q, 0, q], [q, q, q], [0, q, q]], "var(--color-accent)");
  parent.appendChild(g);
  return g;
}

/**
 * Isometric illustration of the HR Assistant architecture. Rails draw in, stations drop
 * in, then packets travel along verified routes. All per-frame work is imperative
 * (rAF + direct attribute writes) so React never re-renders during the animation.
 */
export function IsoMachine({ label, caption, subs, pauseLabel }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const packetsRef = useRef<SVGGElement>(null);
  const ringRef = useRef<SVGGElement>(null);
  const topRefs = useRef<Partial<Record<StationId, SVGPolygonElement | null>>>({});

  const reduced = usePrefersReducedMotion();
  const inView = useInView(wrapRef, 0.15);
  const visible = usePageVisible();
  const [booted, setBooted] = useState(false);
  const [paused, setPaused] = useState(false);
  const running = booted && !paused && !reduced && inView && visible;

  useEffect(() => {
    const id = requestAnimationFrame(() => setBooted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // packets + ring rotation
  useEffect(() => {
    if (!running) return;
    const group = packetsRef.current;
    const ring = ringRef.current;
    if (!group || !ring) return;

    type Packet = { el: SVGGElement; r: [number, number][]; segs: number[]; total: number; t0: number; dur: number; to: StationId };
    const live: Packet[] = [];
    let flow = 0;
    let lastLaunch = 0;
    let frame = 0;
    const start = performance.now();
    const agent = station("agent");
    const [rx, ry] = centre(agent);
    const dots = Array.from(ring.querySelectorAll("circle"));

    const flash = (id: StationId) => {
      const top = topRefs.current[id];
      if (!top) return;
      top.setAttribute("fill", "var(--color-accent)");
      window.setTimeout(() => top.setAttribute("fill", "var(--color-face-top)"), 260);
    };

    const tick = (now: number) => {
      // first packet after the boot sequence, then one every 900 ms
      if (now - start > 1600 && now - lastLaunch > 900) {
        lastLaunch = now;
        const [a, b] = FLOWS[flow++ % FLOWS.length];
        const r = route(a, b);
        const segs = r.slice(1).map((p, i) => Math.hypot(p[0] - r[i][0], p[1] - r[i][1]));
        const total = segs.reduce((m, n) => m + n, 0);
        live.push({ el: makeCube(group), r, segs, total, t0: now, dur: total * 140, to: b });
      }

      for (let n = live.length - 1; n >= 0; n--) {
        const p = live[n];
        const k = Math.min(1, (now - p.t0) / p.dur);
        let dist = k * p.total;
        let i = 0;
        while (i < p.segs.length - 1 && dist > p.segs[i]) dist -= p.segs[i++];
        const f = p.segs[i] ? dist / p.segs[i] : 1;
        const x = p.r[i][0] + (p.r[i + 1][0] - p.r[i][0]) * f - 0.22;
        const y = p.r[i][1] + (p.r[i + 1][1] - p.r[i][1]) * f - 0.22;
        const [px, py] = project(x, y);
        p.el.setAttribute("transform", `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
        if (k >= 1) {
          p.el.remove();
          live.splice(n, 1);
          flash(p.to);
        }
      }

      dots.forEach((c, i) => {
        const a = (i / RING_DOTS) * Math.PI * 2 + now / 2200;
        const [cx, cy] = project(rx + Math.cos(a) * RING_R, ry + Math.sin(a) * RING_R, agent.h + 0.9);
        c.setAttribute("cx", cx.toFixed(1));
        c.setAttribute("cy", cy.toFixed(1));
      });

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      live.forEach((p) => p.el.remove());
    };
  }, [running]);

  // gentle tilt following the pointer
  useEffect(() => {
    if (reduced) return;
    const svg = svgRef.current;
    if (!svg) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      svg.style.transform = `rotateX(${(y * -6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  const agent = station("agent");
  const [rx, ry] = centre(agent);
  const show = booted || reduced;

  return (
    <figure ref={wrapRef} className="relative [perspective:1400px]">
      <svg
        ref={svgRef}
        role="img"
        aria-label={label}
        viewBox={VIEWBOX}
        className="block h-auto w-full transition-transform duration-300 ease-out [transform-style:preserve-3d]"
      >
        <g stroke="rgba(255,255,255,.10)" strokeWidth={1} fill="none">
          {GRID.map((p, i) => (
            <polyline key={i} points={p} />
          ))}
        </g>

        <g fill="none" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round">
          {ROUTES.map(([a, b], i) => (
            <polyline
              key={`${a}-${b}`}
              points={pts(route(a, b).map(([x, y]) => [x, y, 0]))}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={show ? 0 : 1}
              style={{ transition: `stroke-dashoffset 1.4s cubic-bezier(.65,0,.35,1) ${0.2 + i * 0.09}s` }}
            />
          ))}
        </g>

        <g>
          {DRAW_ORDER.map((s, i) => {
            const f = faces(s);
            const [lx, ly] = project(s.x + s.w / 2, s.y + s.d / 2, s.h);
            return (
              <g
                key={s.id}
                style={{
                  opacity: show ? 1 : 0,
                  transform: show ? "none" : "translateY(-24px)",
                  transition: `opacity .5s ${0.5 + i * 0.08}s, transform .7s cubic-bezier(.2,.7,.2,1) ${0.5 + i * 0.08}s`,
                }}
              >
                <polygon points={f.left} fill="var(--color-face-left)" stroke="#fff" strokeWidth={1.4} />
                <polygon points={f.right} fill="var(--color-face-right)" stroke="#fff" strokeWidth={1.4} />
                <polygon
                  ref={(el) => {
                    topRefs.current[s.id] = el;
                  }}
                  points={f.top}
                  fill="var(--color-face-top)"
                  stroke="#fff"
                  strokeWidth={1.4}
                  style={{ transition: "fill .15s" }}
                />
                {s.core && (
                  <g ref={ringRef} fill="#fff">
                    {Array.from({ length: RING_DOTS }, (_, k) => {
                      const a = (k / RING_DOTS) * Math.PI * 2;
                      const [cx, cy] = project(rx + Math.cos(a) * RING_R, ry + Math.sin(a) * RING_R, agent.h + 0.9);
                      return <circle key={k} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={k % 3 === 0 ? 2.6 : 1.3} />;
                    })}
                  </g>
                )}
                <text
                  x={lx}
                  y={ly - (s.core ? 80 : 19)}
                  textAnchor="middle"
                  className="fill-fg text-[10.5px] font-semibold tracking-[0.14em] uppercase"
                >
                  {s.tag}
                </text>
                <text x={lx} y={ly - (s.core ? 66 : 6)} textAnchor="middle" className="fill-muted text-[10px]">
                  {subs[s.id]}
                </text>
              </g>
            );
          })}
        </g>

        <g ref={packetsRef} />
      </svg>

      <figcaption className="mt-2 flex items-center justify-between gap-4 text-xs text-muted">
        <span>{caption}</span>
        {!reduced && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={pauseLabel}
            title={pauseLabel}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full border-[1.5px] border-line-2 text-fg hover:border-fg",
              paused && "border-fg",
            )}
          >
            {paused ? <Play size={14} strokeWidth={2} /> : <Pause size={14} strokeWidth={2} />}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
