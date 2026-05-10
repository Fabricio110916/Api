import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export const config = {
  matcher: "/:path*",
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  return NextResponse.redirect(
    `https://my.koom.pp.ua${url.pathname}${url.search}`
  );
}
