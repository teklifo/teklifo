"use client";

import { useFormatter, useTranslations } from "next-intl";
import { intervalToDuration } from "date-fns";
import { Calendar } from "lucide-react";
import MainInfoItem from "@/components/main-info-item";
import { Badge } from "@/components/ui/badge";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const RFQDateInfo = ({ endDate }: { endDate: Date }) => {
  const t = useTranslations("RFQ");
  const format = useFormatter();

  const duration = intervalToDuration({ start: new Date(), end: endDate });
  const completed = endDate < new Date();

  return (
    <>
      <div className="md:flex md:flex-row md:space-x-2">
        <MainInfoItem
          icon={<Calendar />}
          title={t("endDate")}
          content={
            <div className="flex flex-row space-x-2">
              <span>
                {format.dateTime(new Date(endDate), {
                  timeZone,
                  dateStyle: "long",
                  timeStyle: "medium",
                })}
              </span>
              {!completed ? (
                <Badge variant="outline" className="text-center">
                  {t("daysLeft", {
                    days: duration.days ?? 0,
                    hours: duration.hours ?? 0,
                    minutes: duration.minutes ?? 0,
                  })}
                </Badge>
              ) : (
                <Badge variant="destructive">{t("completed")}</Badge>
              )}
            </div>
          }
        />
      </div>
    </>
  );
};
