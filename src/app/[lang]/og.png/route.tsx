import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { pts } from "@/components/sections/hero/iso";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { site } from "@/lib/site";

/**
 * Link-preview image (1200×630), prerendered per locale.
 * A plain route (not the `opengraph-image` file convention) so the layout can add
 * og:image only when NEXT_PUBLIC_SITE_URL is valid — no localhost URLs in metadata.
 */
export const dynamic = "force-static";
export const generateStaticParams = () => locales.map((lang) => ({ lang }));

const font = (pkg: string, file: string) => readFile(join(process.cwd(), "node_modules/@fontsource", pkg, "files", file));

type Cube = { x: number; y: number; z: number; s: number; accent?: boolean };
const CUBES: Cube[] = [
  { x: 0, y: 0, z: 0, s: 3 },
  { x: 3.3, y: 0.4, z: 0, s: 2, accent: true },
  { x: 0.4, y: 3.3, z: 0, s: 2 },
  { x: 0.8, y: 0.8, z: 3, s: 1.5, accent: true },
  { x: 3.6, y: 3.6, z: 0, s: 1.2 },
];

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return new Response("Not found", { status: 404 });
  const dict = getDictionary(lang);

  const [uCyr, uLat, gCyr, gLat] = await Promise.all([
    font("unbounded", "unbounded-cyrillic-700-normal.woff"),
    font("unbounded", "unbounded-latin-700-normal.woff"),
    font("golos-text", "golos-text-cyrillic-500-normal.woff"),
    font("golos-text", "golos-text-latin-500-normal.woff"),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#1f3bff", color: "#fff", padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
          <div style={{ display: "flex", fontFamily: "GolosLat, GolosCyr", fontSize: 28 }}>{site.name[lang]}</div>
          <div style={{ display: "flex", fontFamily: "UnboundedLat, UnboundedCyr", fontSize: 62, lineHeight: 1.05, letterSpacing: -2 }}>{dict.hero.title}</div>
          <div style={{ display: "flex", fontFamily: "GolosLat, GolosCyr", fontSize: 28, lineHeight: 1.35, opacity: 0.9 }}>{dict.meta.description}</div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <svg width="400" height="400" viewBox="-160 -165 320 330">
            {CUBES.map((c, i) => {
              const { x, y, z, s } = c;
              return (
                <g key={i} stroke="#fff" strokeWidth={2} strokeLinejoin="round">
                  <polygon points={pts([[x, y + s, z], [x + s, y + s, z], [x + s, y + s, z + s], [x, y + s, z + s]])} fill={c.accent ? "#d94d00" : "#132ac4"} />
                  <polygon points={pts([[x + s, y, z], [x + s, y + s, z], [x + s, y + s, z + s], [x + s, y, z + s]])} fill={c.accent ? "#b33f00" : "#0d1f9c"} />
                  <polygon points={pts([[x, y, z + s], [x + s, y, z + s], [x + s, y + s, z + s], [x, y + s, z + s]])} fill={c.accent ? "#ff6a1a" : "#2c47ff"} />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "UnboundedCyr", data: uCyr, weight: 700, style: "normal" },
        { name: "UnboundedLat", data: uLat, weight: 700, style: "normal" },
        { name: "GolosCyr", data: gCyr, weight: 500, style: "normal" },
        { name: "GolosLat", data: gLat, weight: 500, style: "normal" },
      ],
    },
  );
}
