type MainInfoItemProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  content: React.ReactNode;
};

const MainInfoItem = ({ icon, title, content }: MainInfoItemProps) => {
  return (
    <div className="flex flex-col items-start md:flex-row md:space-x-2 md:items-center">
      <div className="flex flex-row space-x-2">
        {icon}
        <span className="break-words">{`${title}:`}</span>
      </div>
      <span className="font-semibold">{content}</span>
    </div>
  );
};

export default MainInfoItem;
