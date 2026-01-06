export default function FullPageLoader({ text = "Please wait..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-40">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-white text-sm font-semibold">
        {text}
      </p>
    </div>
  );
}
