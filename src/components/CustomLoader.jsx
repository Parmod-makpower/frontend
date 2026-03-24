
const CustomLoader = ({ text = "Loading, please wait..." }) => {
  return (
    <div className="flex items-center justify-center mt-50 mb-6">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 mt-3 animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
};

export default CustomLoader;