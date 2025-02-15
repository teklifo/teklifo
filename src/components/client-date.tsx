"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { formatInTimeZone } from "date-fns-tz";
import { dateFnsLocale } from "@/lib/utils";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

type DisplayDateProps = { date: string | Date | number; format: string };

const DisplayDate = ({ date, format }: DisplayDateProps) => {
  const locale = useLocale();
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const formattedDate = formatInTimeZone(new Date(date), timeZone, format, {
      locale: dateFnsLocale(locale),
    });
    setTime(formattedDate);
  }, [date, format, locale]);

  return <>{time ?? "..."}</>;
};

export default DisplayDate;
