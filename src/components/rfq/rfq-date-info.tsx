"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import MainInfoItem from "@/components/main-info-item";
import { Badge } from "@/components/ui/badge";
import ClientDate from "@/components/client-date";

export const RFQDateInfo = ({ endDate }: { endDate: Date }) => {
  const t = useTranslations("RFQ");
  const format = useFormatter();

  const completed = new Date(endDate) < new Date();

  return (
    <>
      <div className="md:flex md:flex-row md:space-x-2">
        <MainInfoItem
          icon={<Calendar />}
          title={t("endDate")}
          content={
            <div className="flex flex-row space-x-2">
              <span>
                <ClientDate date={endDate} format="dd MMMM yyyy HH:mm" />
              </span>
              {!completed ? (
                <Badge variant="outline" className="text-center">
                  {t("deadline", {
                    deadline: format.relativeTime(endDate),
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
