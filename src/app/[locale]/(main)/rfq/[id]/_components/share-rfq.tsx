"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, Clipboard, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const ShareRFQ = () => {
  const [url, setUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.toString());
  }, []);

  const t = useTranslations("RFQ");

  const onButtonClick = () => {
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
  };

  return (
    <Dialog
      onOpenChange={() => {
        setLinkCopied(false);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-center whitespace-normal h-auto space-x-2 lg:w-full"
        >
          <LinkIcon className="h-4 w-4" />
          <span>{t("shareRfq")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("shareRfqTitle")}</DialogTitle>
          <DialogDescription>{t("shareRfqHint")}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input id="url" defaultValue={url} className="w-full" />
          <Button variant="outline" size="icon" onClick={onButtonClick}>
            {linkCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareRFQ;
