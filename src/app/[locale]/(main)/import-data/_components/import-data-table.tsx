import { useTranslations, useFormatter } from "next-intl";
import { Link } from "@/navigation";
import type { ExchangeJob as ExchangeJobType } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImportDataTableProps = {
  exchangeJobs: ExchangeJobType[];
};

const ImportDataTable = ({ exchangeJobs }: ImportDataTableProps) => {
  const t = useTranslations("ImportData");
  const format = useFormatter();

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>{t("date")}</TableHead>
          <TableHead>{t("type")}</TableHead>
          <TableHead className="hidden md:table-cell">{t("name")}</TableHead>
          <TableHead className="hidden md:table-cell">{t("status")}</TableHead>
          <TableHead>{t("logs")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exchangeJobs.map((exchangeJob) => (
          <TableRow key={exchangeJob.id}>
            <TableCell>
              {format.dateTime(new Date(exchangeJob.updatedAt), {
                dateStyle: "medium",
                timeStyle: "medium",
              })}
            </TableCell>
            <TableCell>{exchangeJob.type}</TableCell>
            <TableCell className="hidden md:table-cell">
              {exchangeJob.name}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {exchangeJob.status}
            </TableCell>
            <TableCell>
              <Link
                href={`/exchange-job/${exchangeJob.id}`}
                className={cn(buttonVariants({ variant: "link" }))}
              >
                {t("logs")}
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ImportDataTable;
