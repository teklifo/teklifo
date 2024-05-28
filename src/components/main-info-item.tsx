import { cn } from "@/lib/utils";

type MainInfoItemProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  content: React.ReactNode;
  view: "horizontal" | "vertical";
};

const MainInfoItem = ({ icon, title, content, view }: MainInfoItemProps) => {
  return (
    <div
      className={cn(
        "flex flex-col",
        view === "horizontal"
          ? "items-start md:flex-row md:space-x-2 md:items-center"
          : "items-start"
      )}
    >
      <div className="flex flex-row space-x-2">
        {icon}
        <span className="break-words">{`${title}:`}</span>
      </div>
      <span className="font-semibold">{content}</span>
    </div>
  );
};

export default MainInfoItem;
