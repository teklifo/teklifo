import { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import type { User as UserType } from "@prisma/client";
import { locales, localePrefix } from "./navigation";
import request from "@/lib/request";
import { PaginationType } from "./types";

type PaginatedData = {
  result: UserType[];
  pagination: PaginationType;
};

const publicPages = [
  "/",
  "/login",
  "/check-email",
  "/company/*",
  "/rfq",
  "/rfq/*",
  "/supplier-guide/*",
  "/products/*",
];

const intlMiddleware = createIntlMiddleware({
  locales,
  localePrefix,
  defaultLocale: "en",
});

const authMiddleware = withAuth(
  // Note that this callback is only invoked if
  // the `authorized` callback has returned `true`
  // and not for pages listed in `pages`.
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: async ({ token }) => {
        if (!token) return false;

        try {
          const response = await request<PaginatedData>(
            `/api/user?email=${token?.email}&page=1&limit=1`
          );
          return response.result.length > 0;
        } catch (error) {
          return false;
        }
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join("|")}))?(${publicPages
      .map((page) => page.replace(/\*/, ".*"))
      .join("|")})?/?$`,
    "i"
  );

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
