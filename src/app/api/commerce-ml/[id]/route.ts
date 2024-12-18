import { NextRequest } from "next/server";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import { addDataImportJob } from "@/workers/data-import.worker";
import { getTranslationsFromHeader } from "@/lib/api-utils";
import {
  getExchangeFilePath,
  getExcangeJobByFileName,
  createExchangeJob,
  getExchangeFileType,
  getExchangeJobByPath,
} from "@/lib/exchange/exchange-jobs";
import {
  authenticateUser,
  writeFileFromStream,
  getResponseMessage,
} from "./utils";

type Props = {
  params: { id: string };
};

export async function GET(
  request: NextRequest,
  { params: { id: companyId } }: Props
) {
  const { t } = await getTranslationsFromHeader(request.headers);

  const mode = request.nextUrl.searchParams.get("mode") ?? "init";

  try {
    if (mode === "init") {
      return new Response("zip=no\nfile_limit=2000000");
    } else if (mode === "checkauth") {
      return await authenticateUser(companyId, request);
    } else if (mode === "import") {
      const filename =
        request.nextUrl.searchParams.get("filename") ?? "filename";
      const exchangeJob = await getExcangeJobByFileName(companyId, filename);
      if (exchangeJob?.status === "INACTIVE") {
        const filePath = getExchangeFilePath(filename, companyId);
        const exchangeJob = await getExchangeJobByPath(companyId, filePath);
        if (!exchangeJob) return new Response(getResponseMessage("ERROR"));
        await addDataImportJob({ id: exchangeJob.id });
        return new Response(getResponseMessage("PENDING"));
      }
      return new Response(getResponseMessage(exchangeJob?.status || "SUCCESS"));
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

export async function POST(
  request: NextRequest,
  { params: { id: companyId } }: Props
) {
  const { t } = await getTranslationsFromHeader(request.headers);

  const mode = request.nextUrl.searchParams.get("mode") ?? "import";

  try {
    const company = await getUserCompany(companyId);
    const isAdmin = await isCompanyAdmin(companyId);
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

    if (mode === "file") {
      const filename =
        request.nextUrl.searchParams.get("filename") ?? "filename";
      const filePath = getExchangeFilePath(filename, companyId);
      await writeFileFromStream(request, filePath);

      const exchangeType = getExchangeFileType(filePath);
      if (!exchangeType) {
        return new Response(
          getResponseMessage("ERROR", undefined, t("invalidFileName")),
          {
            status: 404,
          }
        );
      }

      if (filename.includes("xml")) {
        await createExchangeJob(
          companyId,
          filename,
          filePath,
          exchangeType,
          "ru"
        );
      }
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
