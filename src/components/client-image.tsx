"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

const ClientImage = ({ ...props }) => {
  const { theme } = useTheme();
  console.log(theme);

  return (
    <>
      <Image
        {...props}
        src={props.src}
        alt={props.alt}
        className="block dark:hidden"
      />
      <Image
        {...props}
        src={props.src.replace("light", "dark")}
        alt={props.alt}
        className="hidden dark:block"
      />
    </>
  );
};

export default ClientImage;
