import { useTranslations } from "next-intl";
import { ExchangeLog as ExchangeLogType } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ClientDate from "@/components/client-date";

type ExchangeLogsTableProps = {
  exchangeLogs: ExchangeLogType[];
};

const ExchangeLogsTable = ({ exchangeLogs }: ExchangeLogsTableProps) => {
  const t = useTranslations("ExchangeJob");

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>{t("date")}</TableHead>
          <TableHead>{t("status")}</TableHead>
          <TableHead>{t("message")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exchangeLogs.map((exchangeLog) => (
          <TableRow key={exchangeLog.id}>
            <TableCell>
              <ClientDate
                date={exchangeLog.createdAt}
                format="dd.MM.yyyy HH:mm"
              />
            </TableCell>
            <TableCell>{exchangeLog.status}</TableCell>
            <TableCell>{exchangeLog.message}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExchangeLogsTable;
