import { auth } from "@bullstudio/auth";
import { NextRequest, NextResponse } from "next/server";

export const proxy = async (req: NextRequest) => {
  const session = await auth();
  if (!session && req.nextUrl.pathname !== "/login") {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }
  return NextResponse.next();
};

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
