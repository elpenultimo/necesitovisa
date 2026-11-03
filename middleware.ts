import { NextResponse } from "next/server";

/**
 * Known automated probes observed in Vercel traffic on 2026-11-03.
 *
 * Keep this list deliberately narrow: NecesitoVisa may add a real blog or API
 * later, so we only reject the exact paths that are currently nonexistent and
 * receiving abusive traffic.
 */
export function middleware() {
  return new NextResponse(null, {
    status: 404,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const config = {
  matcher: [
    "/api/demo",
    "/api/generate",
    "/blog/1",
    "/blog/2",
    "/blog/3",
  ],
};
