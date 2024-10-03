import { useTranslations, useFormatter } from "next-intl";
import type { ExchangeJob as ExchangeJobType } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("status")}</TableHead>
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
            <TableCell>{exchangeJob.name}</TableCell>
            <TableCell>{exchangeJob.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ImportDataTable;
