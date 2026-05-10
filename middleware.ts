import { NextResponse } from "next/server";

export const runtime = "edge";

export function middleware(request: Request) {
  const url = new URL(request.url);

  return NextResponse.redirect(
    `https://my.koom.pp.ua${url.pathname}${url.search}`
  );
}

export const config = {
  matcher: "/:path*",
};
