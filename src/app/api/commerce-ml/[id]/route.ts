import { NextRequest } from "next/server";
import getAllowedCompany from "@/app/actions/get-allowed-company";
import { getTranslationsFromHeader } from "@/lib/utils";
import {
  addReadFileJobToQueue,
  getExchangeFilePath,
  getExcangeJobStatus,
} from "@/lib/exchange/exchange-jobs";
import {
  authenticateUser,
  writeFileFromStream,
  getResponseMessage,
} from "./utils";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  const mode = request.nextUrl.searchParams.get("mode") ?? "init";

  try {
    if (mode === "init") {
      return new Response("zip=no\nfile_limit=2000000");
    } else if (mode === "checkauth") {
      return await authenticateUser(id, request);
    } else if (mode === "import") {
      const filename =
        request.nextUrl.searchParams.get("filename") ?? "filename";
      const jobStatus = await getExcangeJobStatus(id, filename);
      return new Response(getResponseMessage(jobStatus));
    }
  } catch (error) {
    console.log(error);
    return new Response(
      getResponseMessage("ERROR", undefined, t("serverError")),
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  const mode = request.nextUrl.searchParams.get("mode") ?? "import";

  try {
    const company = await getAllowedCompany(id);
    if (!company) {
      return new Response(
        getResponseMessage("ERROR", undefined, t("invalidCompanyId")),
        {
          status: 404,
        }
      );
    }

    if (mode === "file") {
      const filename =
        request.nextUrl.searchParams.get("filename") ?? "filename";
      const fullPath = getExchangeFilePath(filename, id);
      await writeFileFromStream(request, fullPath);
      await addReadFileJobToQueue(id, fullPath);
      return new Response(getResponseMessage("SUCCESS"));
    } else {
      return new Response(
        getResponseMessage("ERROR", undefined, t("invalidMode", { mode })),
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.log(error);
    return new Response(
      getResponseMessage("ERROR", undefined, t("serverError")),
      {
        status: 500,
      }
    );
  }
}
