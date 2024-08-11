import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-0 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
          " bg-[radial-gradient(circle_farthest-side_at_0_100%,#d8b4fe,transparent),radial-gradient(circle_farthest-side_at_100%_0,#d8b4fe,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#d8b4fe,transparent),radial-gradient(circle_farthest-side_at_0_0,#d8b4fe,#d8b4fe)]"
        )}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-0 group-hover:opacity-100 transition duration-500 will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#d8b4fe,transparent),radial-gradient(circle_farthest-side_at_100%_0,#d8b4fe,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#d8b4fe,transparent),radial-gradient(circle_farthest-side_at_0_0,#d8b4fe,#d8b4fe)]"
        )}
      />

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
