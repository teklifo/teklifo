import { Loader } from "lucide-react";

const Loading = () => {
  return (
    <div className="w-[100%] h-[80vh] flex flex-col justify-center items-center">
      <Loader className="mr-2 animate-spin" />
    </div>
  );
};

export default Loading;
