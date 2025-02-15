"use client";

import { useLocale } from "next-intl";
import { formatInTimeZone } from "date-fns-tz";
import { dateFnsLocale } from "@/lib/utils";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

type DisplayDateProps = { date: string | Date | number; format: string };

const DisplayDate = ({ date, format }: DisplayDateProps) => {
  const locale = useLocale();

  const formattedDate = formatInTimeZone(new Date(date), timeZone, format, {
    locale: dateFnsLocale(locale),
  });

  return <>{formattedDate}</>;
};

export default DisplayDate;
