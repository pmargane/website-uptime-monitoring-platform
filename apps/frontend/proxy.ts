import { NextFetchEvent, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";

const pathsToExclude =
  /^(?!\/(api|_next\/static|favicon\.ico|manifest|icon|static)).*$/;

const publicPagesSet = new Set<string>(["home"]);

const rootRegex = /^\/($|\?.+|#.+)?$/;

export default async function proxy(
  req: NextRequestWithAuth,
  event: NextFetchEvent,
) {
  if (
    !pathsToExclude.test(req.nextUrl.pathname) ||
    publicPagesSet.has(req.nextUrl.pathname)
  )
    return NextResponse.next();

  const token = await getToken({ req });
  const isAuthenticated = !!token;

  if (rootRegex.test(req.nextUrl.pathname)) {
    if (isAuthenticated)
      return NextResponse.redirect(new URL("/home", req.url)) as NextResponse;
    return NextResponse.redirect(new URL("/login", req.url)) as NextResponse;
  }

  if (
    isAuthenticated &&
    (req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(new URL("/home", req.url)) as NextResponse;
  }

  const authMiddleware = await withAuth({
    pages: {
      signIn: `/login`,
    },
  });

  return authMiddleware(req, event);
}
