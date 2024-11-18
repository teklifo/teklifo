"use client";

import { useRouter } from "@/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type BackButtonProps = {
  defaultHref: string;
};

const BackButton = ({ defaultHref }: BackButtonProps) => {
  const router = useRouter();

  function onClick() {
    if (window.history?.length && window.history.length > 1) {
      router.back();
    } else {
      router.push(defaultHref);
    }
  }

  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="icon"
      className="space-x-2"
    >
      <ChevronLeft className="w-4 -h-4" />
    </Button>
  );
};

export default BackButton;
