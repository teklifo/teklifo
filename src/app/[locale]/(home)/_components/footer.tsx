import { format } from "date-fns";

const Footer = async () => {
  return (
    <div className="my-20">
      <p className="text-center text-sm text-muted-foreground">{`© Teklifo ${format(
        new Date(),
        "yyyy"
      )}`}</p>
    </div>
  );
};

export default Footer;
