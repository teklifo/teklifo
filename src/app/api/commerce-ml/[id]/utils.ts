import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { NextRequest } from "next/server";
import { stringify } from "querystring";
import { ExchangeStatus } from "@prisma/client";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { makeDirectoryFromFullPath } from "@/lib/exchange/exchange-jobs";
import { getTranslationsFromHeader } from "@/lib/api-utils";

export const authenticateUser = async (
  companyId: string,
  request: NextRequest
) => {
  const { t } = await getTranslationsFromHeader(request.headers);

  const [username, password] = getCredentials(
    request.headers.get("authorization") || ""
  );
  if (!username || !password) {
    return new Response(
      getResponseMessage("ERROR", undefined, t("invalidCredentials")),
      {
        status: 401,
      }
    );
  }

  const csrfResult = await getCsrfToken();
  if (!csrfResult) {
    return new Response(
      getResponseMessage("ERROR", undefined, t("invalidRequest")),
      {
        status: 400,
      }
    );
  }

  const { cookies, csrfToken } = csrfResult;
  const token = await getSessionToken(username, password, cookies, csrfToken);

  if (!token) {
    return new Response(
      getResponseMessage("ERROR", undefined, t("invalidCredentials"))
    );
  }

  const user = await db.user.findUnique({
    where: {
      email: username,
    },
    include: {
      companies: {
        include: {
          companyRole: true,
        },
      },
    },
  });
  if (!user) {
    return new Response(
      getResponseMessage("ERROR", undefined, t("invalidCredentials")),
      {
        status: 401,
      }
    );
  }

  const company = await getUserCompany(companyId, user.id);
  const isAdmin = await isCompanyAdmin(companyId, user);
  if (!company) {
    return new Response(
      getResponseMessage("ERROR", undefined, t("invalidCompanyId")),
      {
        status: 404,
      }
    );
  } else if (!isAdmin) {
    return new Response(
      getResponseMessage("ERROR", undefined, t("notAllowed")),
      {
        status: 404,
      }
    );
  }

  return new Response(getResponseMessage("SUCCESS", token));
};

const getCredentials = (authHeader: string) => {
  const encodedCredentials = authHeader.split(" ")[1];
  const decodedCredentials = Buffer.from(encodedCredentials, "base64").toString(
    "utf-8"
  );

  return decodedCredentials.split(":");
};

const getCsrfToken = async () => {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/csrf`);

    if (response.status !== 200) return null;

    const cookies = response.headers.getSetCookie();
    const csrfToken: string = (await response.json()).csrfToken;

    return { csrfToken, cookies };
  } catch (error) {
    return null;
  }
};

const getSessionToken = async (
  email: string,
  password: string,
  cookies: string[],
  csrfToken: string
) => {
  const headersCookies = cookies
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/auth/callback/credentials?`,
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          cookie: headersCookies,
        },
        body: stringify({
          email,
          password,
          callbackUrl: "/",
          redirect: "false",
          csrfToken,
          json: true,
        }),
        method: "POST",
      }
    );

    if (response.status !== 200) {
      return null;
    }

    let token: string | null = null;
    response.headers.getSetCookie().forEach((cookie) => {
      if (cookie.includes("next-auth.session-token")) {
        const values = cookie.split(";");
        values.forEach((value) => {
          if (value.includes("next-auth.session-token")) {
            token = value.split("=")[1];
          }
        });
      }
    });

    return token;
  } catch (error) {
    return null;
  }
};

export const writeFileFromStream = async (
  request: NextRequest,
  fullPath: string
) => {
  const { t } = await getTranslationsFromHeader(request.headers);

  await makeDirectoryFromFullPath(fullPath);

  if (!request.body) {
    return new Response(
      getResponseMessage(
        "ERROR",
        undefined,
        t("invalidRequest", { mode: "file" })
      ),
      {
        status: 400,
      }
    );
  }
  const writeStream = fs.createWriteStream(fullPath);
  pipeline(
    request.body as unknown as NodeJS.ReadableStream,
    writeStream,
    (error) => {
      if (error) {
        throw error;
      }
    }
  );
};

export const getResponseMessage = (
  result: ExchangeStatus,
  token?: string,
  error?: string
) => {
  return `${result}${token ? `\nnext-auth.session-token\n${token}` : ""}${
    error ? `\n${error}` : ""
  }`;
};
