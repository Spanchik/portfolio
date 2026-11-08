const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1", "0.0.0.0"]);

function isLocalHost(hostname: string) {
  const host = hostname.toLowerCase();
  return LOCAL_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".test");
}

let warned = false;

/**
 * Validated public origin from NEXT_PUBLIC_SITE_URL.
 *
 * - production + invalid / non-https / local host → throws (build fails)
 * - production + unset → returns null; URL-dependent metadata is omitted
 * - development → any parseable URL is accepted (localhost included)
 */
export function getSiteUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const isProd = process.env.NODE_ENV === "production";

  if (!raw) {
    if (isProd && !warned) {
      warned = true;
      console.warn(
        "[site-url] NEXT_PUBLIC_SITE_URL is not set — canonical, hreflang, og:url and sitemap entries are omitted.",
      );
    }
    return null;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`[site-url] NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}"`);
  }

  if (isProd) {
    if (url.protocol !== "https:") {
      throw new Error(`[site-url] NEXT_PUBLIC_SITE_URL must use https in production: "${raw}"`);
    }
    if (isLocalHost(url.hostname)) {
      throw new Error(`[site-url] NEXT_PUBLIC_SITE_URL must not point to a local host in production: "${raw}"`);
    }
  }

  // Normalise to origin (drop path/query/hash) so relative metadata URLs resolve predictably.
  return new URL(url.origin);
}
