import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { stringify } from "querystring";
import getAllowedCompany from "@/app/actions/get-allowed-company";
import getLocale from "@/lib/get-locale";
import db from "@/lib/db";
import { checkFile } from "@/lib/utils";
import readCMLFiles from "./read-file";

type Props = {
  params: { id: string };
};

const getResponseMessage = (
  result: "success" | "error" | "progress",
  token?: string,
  error?: string
) => {
  return `${result}${token ? `\nnext-auth.session-token\n${token}` : ""}${
    error ? `\n${error}` : ""
  }`;
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

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const locale = getLocale(request.headers);
  const t = await getTranslations({ locale: "ru", namespace: "API" });

  const mode = request.nextUrl.searchParams.get("mode") ?? "init";

  try {
    if (mode === "init") {
      // Initial parameters
      return new Response("zip=no\nfile_limit=2000000");
    } else if (mode === "checkauth") {
      // Authentication

      // Get credentials out of request headers
      const [username, password] = getCredentials(
        request.headers.get("authorization") || ""
      );
      if (!username || !password) {
        return new Response(
          getResponseMessage("error", undefined, t("invalidCredentials")),
          {
            status: 401,
          }
        );
      }

      // Request for CSRF token
      const csrfResult = await getCsrfToken();
      if (!csrfResult) {
        return new Response(
          getResponseMessage("error", undefined, t("invalidRequest")),
          {
            status: 400,
          }
        );
      }

      // Get session token
      const { cookies, csrfToken } = csrfResult;
      const token = await getSessionToken(
        username,
        password,
        cookies,
        csrfToken
      );

      if (!token) {
        return new Response(
          getResponseMessage("error", undefined, t("invalidCredentials"))
        );
      }

      // Find user
      const user = await db.user.findUnique({
        where: {
          email: username,
        },
      });
      if (!user) {
        return new Response(
          getResponseMessage("error", undefined, t("invalidCredentials")),
          {
            status: 401,
          }
        );
      }

      // Find company
      const company = await getAllowedCompany(id, true, user.id);
      if (!company) {
        return new Response(
          getResponseMessage("error", undefined, t("invalidCompanyId")),
          {
            status: 404,
          }
        );
      }

      return new Response(getResponseMessage("success", token));
    } else if (mode === "import") {
      // Read exchange files
      // A foldres called 'progress' indicates that exchange is currently running

      const filename =
        request.nextUrl.searchParams.get("filename") ?? "filename";

      const subfolderName =
        filename
          .replace("import", "")
          .replace("offers", "")
          .replace("import_files", "")
          .replace(".xml", "") || "subfolder";

      const folderPath = `${process.cwd()}/cml-files/${id}/${subfolderName}`;
      const progressPath = `${folderPath}/progress`;
      const inProgress = await checkFile(progressPath);
      if (inProgress) {
        return new Response(getResponseMessage("progress"));
      }
      // Start reading
      await readCMLFiles(id, folderPath);
      return new Response(getResponseMessage("success"));
    }
  } catch (error) {
    console.log(error);

    return new Response(
      getResponseMessage("error", undefined, t("serverError")),
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest, { params: { id } }: Props) {
  const locale = getLocale(request.headers);
  const t = await getTranslations({ locale: "ru", namespace: "API" });

  const mode = request.nextUrl.searchParams.get("mode") ?? "import";

  try {
    // Find company
    const company = await getAllowedCompany(id);
    if (!company) {
      return new Response(
        getResponseMessage("error", undefined, t("invalidCompanyId")),
        {
          status: 404,
        }
      );
    }

    // Handle request
    if (mode === "file") {
      // Create folder if needed
      const filename =
        request.nextUrl.searchParams.get("filename") ?? "filename";

      const subfolderName =
        filename
          .replace("import", "")
          .replace("offers", "")
          .replace("import_files", "")
          .replace(".xml", "") || "subfolder";

      const fullPath = `${process.cwd()}/cml-files/${id}/${subfolderName}/${filename}`;
      const folderPath = path.dirname(fullPath);
      console.log(folderPath);
      if (!(await checkFile(folderPath))) {
        await fs.promises.mkdir(folderPath, { recursive: true });
      }

      // Write a stream
      if (!request.body) {
        return new Response(
          getResponseMessage("error", undefined, t("invalidRequest", { mode })),
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
            console.log(error);
            return new Response(
              getResponseMessage(
                "error",
                undefined,
                t("invalidRequest", { mode })
              ),
              {
                status: 400,
              }
            );
          }
        }
      );

      return new Response(getResponseMessage("success"));
    } else {
      return new Response(
        getResponseMessage("error", undefined, t("invalidMode", { mode })),
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.log(error);
    return new Response(
      getResponseMessage("error", undefined, t("serverError")),
      {
        status: 500,
      }
    );
  }
}
