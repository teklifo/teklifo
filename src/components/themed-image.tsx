import Image from "next/image";
import { cn } from "@/lib/utils";

const ThemedImage = ({ ...props }) => {
  return (
    <>
      <Image
        {...props}
        src={props.src}
        alt={props.alt}
        className={cn("block dark:hidden", props.className)}
      />
      <Image
        {...props}
        src={props.src.replace("light", "dark")}
        alt={props.alt}
        className={cn("hidden dark:block", props.className)}
      />
    </>
  );
};

export default ThemedImage;
