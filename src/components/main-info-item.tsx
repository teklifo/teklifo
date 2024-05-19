type MainInfoItemProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  content: React.ReactNode;
};

const MainInfoItem = ({ icon, title, content }: MainInfoItemProps) => {
  return (
    <div className="flex flex-col items-center md:flex-row md:space-x-2">
      <div className="flex flex-row space-x-2">
        {icon}
        <span>{`${title}:`}</span>
      </div>
      <span className="font-semibold">{content}</span>
    </div>
  );
};

export default MainInfoItem;
