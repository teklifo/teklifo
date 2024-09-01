import Image from "next/image";

const ThemedImage = ({ ...props }) => {
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

export default ThemedImage;
